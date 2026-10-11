import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { clearRemoteCache, readRemoteLibrary, remoteMemoryStorage, writeRemoteLibrary, USE_SUPABASE } from '../api/backend'
import type { LibraryChange } from '../api/backend'
import { useAuthStore } from './useAuthStore'

interface LibraryState {
  libraryByUser: Record<string, number[]>
  activeUserId: string | null
  loaded: boolean
  loading: boolean
  pending: boolean
  error: string | null
  loadLibrary: (userId: string) => Promise<void>
  resetRemoteLibrary: () => void
  toggleGame: (userId: string, gameId: number) => Promise<void>
  clearLibrary: (userId: string) => Promise<void>
}

let revision = 0
const message = (error: unknown) => error instanceof Error ? error.message : 'บันทึก Library ไม่สำเร็จ กรุณาลองใหม่'
const isCurrentUser = (userId: string) => useAuthStore.getState().user?.id === userId

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => {
      const saveRemote = async (change: LibraryChange) => {
        const { userId } = change
        const state = get()
        if (!isCurrentUser(userId) || state.pending || state.loading) return
        if (!state.loaded || state.activeUserId !== userId) {
          set({ error: 'กรุณาโหลด Library ให้สำเร็จก่อนบันทึก' })
          return
        }
        const attempt = revision
        set({ pending: true, error: null })
        try {
          await writeRemoteLibrary(change)
          // Apply only after a successful write. A later read failure leaves these confirmed IDs visible.
          if (attempt !== revision || !isCurrentUser(userId)) return
          const current = get().libraryByUser[userId] ?? []
          const next = change.action === 'clear' ? [] : change.action === 'add'
            ? [...new Set([...current, change.gameId!])] : current.filter((id) => id !== change.gameId)
          set({ libraryByUser: { [userId]: next } })
          const ids = await readRemoteLibrary(userId)
          if (attempt === revision && isCurrentUser(userId)) {
            set({ libraryByUser: { [userId]: ids }, pending: false })
          }
        } catch (error) {
          if (attempt === revision && isCurrentUser(userId)) set({ pending: false, error: message(error) })
        }
      }
      return {
        libraryByUser: {}, activeUserId: null, loaded: !USE_SUPABASE,
        loading: false, pending: false, error: null,

        loadLibrary: async (userId) => {
          if (!USE_SUPABASE || !isCurrentUser(userId)) return
          if (get().pending || (get().loading && get().activeUserId === userId)) return
          const attempt = ++revision
          const sameUser = get().activeUserId === userId
          set({ activeUserId: userId, loading: true, error: null,
            ...(sameUser ? {} : { libraryByUser: {}, loaded: false, pending: false }) })
          try {
            const ids = await readRemoteLibrary(userId)
            if (attempt === revision && isCurrentUser(userId)) {
              set({ libraryByUser: { [userId]: ids }, loaded: true, loading: false })
            }
          } catch (error) {
            if (attempt === revision && isCurrentUser(userId)) set({ loading: false, error: message(error) })
          }
        },

        resetRemoteLibrary: () => {
          if (!USE_SUPABASE) return
          ++revision
          clearRemoteCache()
          set({ libraryByUser: {}, activeUserId: null, loaded: false, loading: false, pending: false, error: null })
        },

        toggleGame: async (userId, gameId) => {
          if (USE_SUPABASE) {
            if (!Number.isSafeInteger(gameId) || gameId <= 0) return
            const saved = (get().libraryByUser[userId] ?? []).includes(gameId)
            await saveRemote({ userId, gameId, action: saved ? 'remove' : 'add' })
            return
          }
          set((state) => {
            const current = state.libraryByUser[userId] ?? []
            return { libraryByUser: { ...state.libraryByUser,
              [userId]: current.includes(gameId) ? current.filter((id) => id !== gameId) : [...current, gameId] } }
          })
        },

        clearLibrary: async (userId) => {
          if (USE_SUPABASE) { await saveRemote({ userId, action: 'clear' }); return }
          set((state) => ({ libraryByUser: { ...state.libraryByUser, [userId]: [] } }))
        },
      }
    },
    {
      name: 'gamestation-library',
      partialize: (state) => ({ libraryByUser: state.libraryByUser }),
      storage: createJSONStorage(() => USE_SUPABASE ? remoteMemoryStorage : localStorage),
    },
  ),
)

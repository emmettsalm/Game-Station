import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthResult, LoginInput, RegisterInput, StoredUser, User } from '../types/auth'
import { fakeDelay, readUsers, saveUsers } from '../mocks/userDb'
import { sha256 } from '../utils/hash'
import { clearRemoteCache, getSupabase, remoteMemoryStorage, toPublicUser, USE_SUPABASE } from '../api/backend'

interface AuthState {
  initialized: boolean
  sessionError: string | null
  user: User | null
  initialize: () => Promise<void>
  listenForAuthChanges: () => () => void
  register: (input: RegisterInput) => Promise<AuthResult<RegisterInput>>
  login: (input: LoginInput) => Promise<AuthResult<LoginInput>>
  logout: () => Promise<void>
}

const toLocalUser = (u: StoredUser): User => ({
  id: u.id, username: u.username, email: u.email, createdAt: u.createdAt,
})
const hashPassword = (email: string, password: string) => sha256(`${email.toLowerCase()}:${password}`)
let authAttempt = 0
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const updateUser = (user: User | null) => {
        const current = get().user
        const same = current && user && current.id === user.id && current.username === user.username && current.email === user.email
        if (current?.id !== user?.id) clearRemoteCache()
        set({ user: same ? current : user, initialized: true, sessionError: null })
      }
      return {
        user: null, initialized: !USE_SUPABASE, sessionError: null,

        initialize: async () => {
          if (!USE_SUPABASE) return
          const attempt = ++authAttempt
          try {
            const { data, error } = await getSupabase().auth.getUser()
            if (attempt !== authAttempt) return
            if (error && error.name !== 'AuthSessionMissingError' && error.status !== 401 && error.status !== 403) throw error
            updateUser(!error && data.user ? toPublicUser(data.user) : null)
          } catch (error) {
            if (attempt === authAttempt) set({ user: null, initialized: true, sessionError: errorMessage(error) })
          }
        },

        listenForAuthChanges: () => {
          if (!USE_SUPABASE) return () => {}
          try {
            const { data } = getSupabase().auth.onAuthStateChange((event, session) => {
              // Keep callbacks synchronous: never call another Auth method inside this callback.
              if (event === 'SIGNED_OUT') {
                ++authAttempt
                clearRemoteCache()
                updateUser(null)
              } else if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
                updateUser(toPublicUser(session.user))
              }
            })
            return () => data.subscription.unsubscribe()
          } catch (error) {
            set({ sessionError: errorMessage(error), initialized: true })
            return () => {}
          }
        },

        register: async (input) => {
          if (USE_SUPABASE) {
            const attempt = ++authAttempt
            try {
              const { data, error } = await getSupabase().auth.signUp({
                email: input.email.trim().toLowerCase(), password: input.password,
                options: { data: { username: input.username.trim() }, emailRedirectTo: window.location.origin + '/login' },
              })
              if (error) throw error
              if (attempt !== authAttempt) return { ok: false, message: 'สถานะบัญชีเปลี่ยนแล้ว กรุณาลองใหม่' }
              if (data.session && data.user) {
                updateUser(toPublicUser(data.user))
                return { ok: true }
              }
              return { ok: true, requiresEmailConfirmation: true,
                message: 'กรุณาตรวจอีเมลและกดยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบด้วยอีเมล' }
            } catch (error) { return { ok: false, message: errorMessage(error) } }
          }
        await fakeDelay()
        const users = readUsers()
        const email = input.email.trim().toLowerCase()
        const username = input.username.trim()

        if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
          return { ok: false, field: 'username', message: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' }
        }
        if (users.some((u) => u.email === email)) {
          return { ok: false, field: 'email', message: 'อีเมลนี้สมัครสมาชิกแล้ว' }
        }

        const newUser: StoredUser = {
          id: crypto.randomUUID(),
          username,
          email,
          createdAt: new Date().toISOString(),
          passwordHash: await hashPassword(email, input.password),
        }
        saveUsers([...users, newUser])
        set({ user: toLocalUser(newUser) })   // สมัครเสร็จ → ล็อกอินให้เลย
        return { ok: true }

        },

        login: async ({ identifier, password }) => {
          if (USE_SUPABASE) {
            if (!identifier.trim().includes('@')) return { ok: false, field: 'identifier', message: 'กรุณาเข้าสู่ระบบด้วยอีเมล' }
            const attempt = ++authAttempt
            try {
              const { data, error } = await getSupabase().auth.signInWithPassword({ email: identifier.trim().toLowerCase(), password })
              if (error) throw error
              if (attempt !== authAttempt) return { ok: false, message: 'สถานะบัญชีเปลี่ยนแล้ว กรุณาลองใหม่' }
              updateUser(toPublicUser(data.user))
              return { ok: true }
            } catch (error) { return { ok: false, message: errorMessage(error) } }
          }
        await fakeDelay()
        const id = identifier.trim().toLowerCase()
        const found = readUsers().find((u) => u.email === id || u.username.toLowerCase() === id)

        // ไม่บอกว่าผิดที่อีเมลหรือรหัสผ่าน เพื่อความปลอดภัย
        if (!found || found.passwordHash !== (await hashPassword(found.email, password))) {
          return { ok: false, message: 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง' }
        }
        set({ user: toLocalUser(found) })
        return { ok: true }

        },

        logout: async () => {
          if (!USE_SUPABASE) { updateUser(null); return }
          const attempt = ++authAttempt
          try {
            const { error } = await getSupabase().auth.signOut({ scope: 'local' })
            if (error) throw error
            if (attempt === authAttempt) updateUser(null)
          } catch (error) {
            if (attempt === authAttempt) set({ sessionError: errorMessage(error) })
          }
        },
      }
    },
    { name: 'gamestation-auth', partialize: (s) => ({ user: s.user }),
      storage: createJSONStorage(() => USE_SUPABASE ? remoteMemoryStorage : localStorage) },
  ),
)

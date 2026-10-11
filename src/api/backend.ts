import { createClient, type SupabaseClient, type User as SupabaseUser } from '@supabase/supabase-js'
import type { StateStorage } from 'zustand/middleware'
import type { User } from '../types/auth'
import { queryClient } from './queryClient'

type LibraryRow = { user_id: string; game_id: number; created_at: string }
interface Database {
  public: {
    Tables: {
      game_library: {
        Row: LibraryRow
        Insert: { user_id: string; game_id: number; created_at?: string }
        Update: { user_id?: string; game_id?: number; created_at?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/\/+$/, '')
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim()
// Only completely empty settings select the demo. Partial settings must show an error.
export const USE_SUPABASE = Boolean(url || key)
export const remoteMemoryStorage: StateStorage = {
  getItem: () => null, setItem: () => {}, removeItem: () => {},
}
let client: SupabaseClient<Database> | undefined

export function getSupabase(): SupabaseClient<Database> {
  if (!url || !key) throw new Error('กรุณาตั้ง VITE_SUPABASE_URL และ VITE_SUPABASE_PUBLISHABLE_KEY ให้ครบ')
  let parsed: URL
  try { parsed = new URL(url) } catch { throw new Error('VITE_SUPABASE_URL ไม่ใช่ URL ที่ถูกต้อง') }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Supabase URL ต้องใช้ http หรือ https')
  if (key.startsWith('sb_secret_')) throw new Error('หน้าเว็บต้องใช้ Publishable key ห้ามใช้ Secret key')
  if (key.startsWith('eyJ')) {
    let claims: unknown
    try {
      const segment = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      claims = JSON.parse(atob(segment.padEnd(Math.ceil(segment.length / 4) * 4, '=')))
    } catch { throw new Error('Supabase API key ไม่ถูกต้อง') }
    if (!claims || typeof claims !== 'object' || !('role' in claims) || claims.role !== 'anon') {
      throw new Error('หน้าเว็บใช้ได้เฉพาะ Publishable key หรือ legacy anon key')
    }
  }
  client ??= createClient<Database>(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    global: {
      fetch: (input, options) => {
        const signal = options?.signal ?? (input instanceof Request ? input.signal : undefined)
        return fetch(input, { ...options, signal: AbortSignal.any([
          ...(signal ? [signal] : []), AbortSignal.timeout(15000),
        ]) })
      },
    },
  })
  return client
}

export function toPublicUser(user: SupabaseUser): User {
  const username: unknown = user.user_metadata.username
  return {
    id: user.id,
    username: typeof username === 'string' && username ? username : (user.email?.split('@')[0] ?? 'Player'),
    email: user.email ?? '', createdAt: user.created_at,
  }
}

const libraryKey = (userId: string) => ['supabase-library', userId] as const

export async function readRemoteLibrary(userId: string): Promise<number[]> {
  return queryClient.fetchQuery({
    queryKey: libraryKey(userId), staleTime: 0, retry: false,
    queryFn: async ({ signal }) => {
      const { data, error } = await getSupabase().from('game_library').select('game_id')
        .eq('user_id', userId).order('created_at', { ascending: true }).abortSignal(signal)
      if (error) throw new Error(error.message)
      if (!data || !data.every((row) => Number.isSafeInteger(row.game_id) && row.game_id > 0)) {
        throw new Error('รูปแบบข้อมูล Library จาก Supabase ไม่ถูกต้อง')
      }
      return [...new Set(data.map((row) => row.game_id))]
    },
  })
}

export type LibraryChange = { userId: string; action: 'add' | 'remove' | 'clear'; gameId?: number }

export async function writeRemoteLibrary(change: LibraryChange): Promise<void> {
  // TanStack Query tracks remote mutation state; Zustand retains collection IDs only.
  const mutation = queryClient.getMutationCache().build(queryClient, {
    mutationKey: ['supabase-library-write', change.userId], retry: false,
    mutationFn: async ({ userId, action, gameId }: LibraryChange) => {
      const table = getSupabase().from('game_library')
      if (action === 'add') {
        const { error } = await table.upsert({ user_id: userId, game_id: gameId! },
          { onConflict: 'user_id,game_id', ignoreDuplicates: true }).abortSignal(AbortSignal.timeout(15000))
        if (error) throw new Error(error.message)
      } else {
        let request = table.delete().eq('user_id', userId)
        if (action === 'remove') request = request.eq('game_id', gameId!)
        const { error } = await request.abortSignal(AbortSignal.timeout(15000))
        if (error) throw new Error(error.message)
      }
    },
  })
  await mutation.execute(change)
  await queryClient.invalidateQueries({ queryKey: libraryKey(change.userId), refetchType: 'none' })
}

export function clearRemoteCache(): void {
  queryClient.removeQueries({ queryKey: ['supabase-library'] })
  // Retire completed mutation records containing the old account ID.
  for (const mutation of queryClient.getMutationCache().getAll()) {
    if (mutation.options.mutationKey?.[0] === 'supabase-library-write' && mutation.state.status !== 'pending') {
      queryClient.getMutationCache().remove(mutation)
    }
  }
}

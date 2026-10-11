import { QueryClient } from '@tanstack/react-query'

// One cache shared by RAWG queries, Supabase queries and the React provider.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
})

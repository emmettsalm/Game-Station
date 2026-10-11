import { useSearchParams } from 'react-router'

/**
 * สลับดูสถานะต่างๆ ผ่าน URL ระหว่างพัฒนา UI
 *   ?state=loading | ?state=error | ?state=empty
 * TODO(เพื่อน): แทนด้วย isLoading / isError จาก TanStack Query
 */
export function useMockState() {
  const [params] = useSearchParams()
  const s = params.get('state')
  return { isLoading: s === 'loading', isError: s === 'error', isEmpty: s === 'empty' }
}

import { Navigate, useParams } from 'react-router'

export default function DealDetailPage() {
  const { dealId = '' } = useParams()

  const gameId = Number(
    dealId.replace('deal-', ''),
  )

  const isValidGameId =
    dealId.startsWith('deal-') &&
    Number.isInteger(gameId) &&
    gameId > 0

  return (
    <Navigate
      to={
        isValidGameId
          ? `/game/${gameId}`
          : '/deals'
      }
      replace
    />
  )
}
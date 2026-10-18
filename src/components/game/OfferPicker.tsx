import { useRef } from 'react'
import type { PriceOffer } from '../../types/game'
import { finalPrice } from '../../api/cheapshark'
import { baht } from '../../utils/format'

interface OfferPickerProps {
  offers: PriceOffer[]
  selectedId: string
  savedId?: string
  onSelect: (offerId: string) => void
}

const priceLabel = (offer: PriceOffer) => offer.price.type === 'free'
  ? 'ฟรี'
  : `${baht(finalPrice(offer.price))}${offer.price.discount > 0 ? ` (-${offer.price.discount}%)` : ''}`

function StoreIcon({ offer }: { offer: PriceOffer }) {
  return offer.storeIcon
    ? <img src={offer.storeIcon} alt="" className="w-6 h-6 object-contain shrink-0 rounded-sm" />
    : <span aria-hidden="true" className="w-6 h-6 grid place-items-center rounded-sm bg-base-300 shrink-0">🎮</span>
}

export default function OfferPicker({ offers, selectedId, savedId, onSelect }: OfferPickerProps) {
  const details = useRef<HTMLDetailsElement>(null)
  const selected = offers.find((offer) => offer.id === selectedId)
  return (
    <div>
      <span className="text-sm opacity-60">เลือกร้านค้า ({offers.length} ร้าน) · ราคาโดยประมาณ (บาท)</span>
      <details ref={details} className="relative w-full mt-1">
        <summary className="btn btn-outline w-full justify-between font-normal" aria-label="เลือกร้านค้า">
          <span className="flex items-center gap-2 min-w-0">
            {selected && <StoreIcon offer={selected} />}
            <span className="truncate">{selected ? `${selected.storeName} — ${priceLabel(selected)}` : 'เลือกร้านค้า'}</span>
          </span>
          <span aria-hidden="true" className="shrink-0">▾</span>
        </summary>
        <div className="absolute left-0 top-full mt-2 z-30 w-full max-w-full max-h-72 overflow-y-auto overflow-x-hidden rounded-box border border-base-300 bg-base-200 shadow-xl p-1">
          {offers.map((offer) => (
            <button key={offer.id} type="button"
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 w-full min-w-0 px-2 py-2 rounded-md text-left hover:bg-base-300 ${offer.id === selectedId ? 'bg-base-300' : ''}`}
              aria-current={offer.id === selectedId ? 'true' : undefined}
              onClick={() => { onSelect(offer.id); if (details.current) details.current.open = false }}>
              <span className="flex items-center gap-2 min-w-0">
                <StoreIcon offer={offer} />
                <span className="truncate">{offer.storeName}</span>
              </span>
              <span className="whitespace-nowrap text-sm">{priceLabel(offer)}{offer.id === savedId ? ' ✓' : ''}</span>
            </button>
          ))}
        </div>
      </details>
    </div>
  )
}

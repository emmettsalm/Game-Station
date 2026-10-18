import { useEffect, useRef, useState } from 'react'
import type { Screenshot } from '../../types/game'

interface ScreenshotGalleryProps {
  screenshots: Screenshot[]
  gameName: string
}

export default function ScreenshotGallery({ screenshots, gameName }: ScreenshotGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const activeScreenshot = activeIndex === null ? undefined : screenshots[activeIndex]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (activeScreenshot && !dialog.open) dialog.showModal()
    else if (!activeScreenshot && dialog.open) dialog.close()
  }, [activeScreenshot])

  const move = (step: number) => {
    setActiveIndex((current) => current === null || screenshots.length === 0
      ? null : (current + step + screenshots.length) % screenshots.length)
  }

  return (
    <>
      <p className="text-sm opacity-60">กดภาพเพื่อดูขนาดใหญ่</p>
      <div className="carousel carousel-center w-full gap-3 rounded-box">
        {screenshots.map((screenshot, index) => (
          <button key={screenshot.id} type="button" className="carousel-item overflow-hidden rounded-box
            focus-visible:outline-2 focus-visible:outline-primary" onClick={() => setActiveIndex(index)}
            aria-label={`เปิดภาพตัวอย่าง ${index + 1} ของ ${gameName}`}>
            <img src={screenshot.image} alt={`${gameName} ภาพตัวอย่าง ${index + 1}`} loading="lazy"
              className="h-48 md:h-60 w-auto object-cover transition hover:brightness-110" />
          </button>
        ))}
      </div>

      <dialog ref={dialogRef} className="modal" aria-labelledby="screenshot-dialog-title"
        onClose={() => setActiveIndex(null)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) }
          if (event.key === 'ArrowRight') { event.preventDefault(); move(1) }
        }}>
        <div className="modal-box w-11/12 max-w-6xl max-h-[92vh] overflow-hidden p-3 md:p-4">
          <div className="flex items-center justify-between gap-4">
            <h3 id="screenshot-dialog-title" className="min-w-0 truncate font-bold">ภาพตัวอย่าง · {gameName}</h3>
            <button type="button" className="btn btn-circle btn-sm" aria-label="ปิดภาพตัวอย่าง"
              onClick={() => setActiveIndex(null)} autoFocus>✕</button>
          </div>
          {activeScreenshot && (
            <>
              <div className="mt-3 flex items-center justify-center gap-2">
                {screenshots.length > 1 && <button type="button" className="btn btn-circle btn-sm shrink-0"
                  aria-label="ภาพก่อนหน้า" onClick={() => move(-1)}>‹</button>}
                <img src={activeScreenshot.image} alt={`${gameName} ภาพตัวอย่าง ${activeIndex! + 1}`}
                  className="min-w-0 max-h-[72vh] flex-1 object-contain" />
                {screenshots.length > 1 && <button type="button" className="btn btn-circle btn-sm shrink-0"
                  aria-label="ภาพถัดไป" onClick={() => move(1)}>›</button>}
              </div>
              <p className="mt-2 text-center text-sm opacity-70">
                {activeIndex! + 1} / {screenshots.length} · ใช้ปุ่มลูกศรเพื่อเลื่อนภาพ · Esc เพื่อปิด
              </p>
            </>
          )}
        </div>
        <form method="dialog" className="modal-backdrop"><button type="submit">ปิด</button></form>
      </dialog>
    </>
  )
}

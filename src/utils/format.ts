/** จัดรูปแบบเงินบาท เช่น 1290 → "฿1,290" */
export const baht = (n: number): string => `฿${Math.round(n).toLocaleString('th-TH')}`

/** จัดรูปแบบวันที่ภาษาไทย เช่น "31 ต.ค. 2569" */
export const thaiDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })

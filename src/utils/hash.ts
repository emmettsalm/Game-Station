/** hash ข้อความด้วย SHA-256 (ไม่เก็บรหัสผ่านเป็นข้อความตรงๆ) */
export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

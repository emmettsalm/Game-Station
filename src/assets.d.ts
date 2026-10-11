// ให้ TypeScript รู้จักไฟล์รูปนามสกุลตัวพิมพ์ใหญ่ เช่น IMG_6889.JPG
declare module '*.JPG' {
  const src: string
  export default src
}
declare module '*.PNG' {
  const src: string
  export default src
}

export interface Member {
  name: string
  nickname?: string     // ชื่อเล่น
  studentId: string
  role: string
  photo?: string
}

export interface ApiSource {
  name: string
  url: string
  usage: string
}

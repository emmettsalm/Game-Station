import type { ApiSource, Member } from '../types/about'

import photoKhachaphak from '../image/IMG_6889.JPG'
import photoDechathon from '../image/IMG_0449.jpg'
import photoEmmett from '../image/Emmett_Png.png'

// TODO: ใส่ชื่อเล่นของแต่ละคนในช่อง nickname (โจทย์กำหนดให้แสดงชื่อเล่น)
const members: Member[] = [
  { name: 'คชภัค ชีพสัตยากร',nickname: 'พัค' ,studentId: '1660701325', role: 'Frontend Developer & UI/UX Designer', photo: photoKhachaphak },
  { name: 'เดชาธร ธรรมชัชวาล',nickname: 'พี' ,studentId: '1660707215', role: 'Database Developer & Software Tester', photo: photoDechathon },
  { name: 'เอ็มเม็ต มีชัย แซลมอน',nickname: 'เอ็มเม็ต' ,studentId: '1660704444', role: 'Backend Developer & Deployment Engineer', photo: photoEmmett },
]

const sources: ApiSource[] = [
  { name: 'RAWG Video Games Database API', url: 'https://rawg.io/apidocs', usage: 'ข้อมูลเกม หมวดหมู่ และภาพตัวอย่าง' },
  { name: 'CheapShark API', url: 'https://apidocs.cheapshark.com/', usage: 'ราคาเกมและดีลจากร้านค้าต่างๆ (จำลองข้อมูลตามรูปแบบ API)' },
]


const initials = (name: string) => name.trim().charAt(0)

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold">ทีมผู้พัฒนา</h1>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((m) => (
          <div key={m.studentId} className="card bg-base-200 text-center">
            <div className="card-body items-center">
              {m.photo ? (
                <div className="avatar">
                  <div className="w-28 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                    <img src={m.photo} alt={m.name} className="object-cover" />
                  </div>
                </div>
              ) : (
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary text-primary-content w-28 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                    <span className="text-4xl">{initials(m.nickname ?? m.name)}</span>
                  </div>
                </div>
              )}
              <h2 className="card-title mt-3">{m.name}</h2>
              {m.nickname && <p className="opacity-70">ชื่อเล่น: {m.nickname}</p>}
              <p className="opacity-80">รหัสนักศึกษา {m.studentId}</p>
              <p className="mt-2">{m.role}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">API Attribution</h2>
        <div className="overflow-x-auto rounded-box">
          <table className="table bg-base-200">
            <thead>
              <tr><th>แหล่งข้อมูล</th><th>ใช้สำหรับ</th><th>เอกสาร</th></tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.name}>
                  <td className="font-semibold">{s.name}</td>
                  <td>{s.usage}</td>
                  <td>
                    <a className="link link-primary" href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

# เชื่อม Supabase หรือใช้ LocalStorage

ชุดนี้ใช้แทนตัวเชื่อม Backend API แบบกำหนดเองที่ส่งก่อนหน้า ใช้ Supabase Auth และ Data API ผ่าน SDK โดยไม่ต้องสร้าง server เพิ่ม
backend.ts ยังวางใน src/api/ เหมือนเดิม แต่เนื้อหาเปลี่ยนเป็นตัวเชื่อม Supabase แล้ว VITE_BACKEND_URL เดิมไม่ได้ใช้ในชุดนี้

## 1. วางไฟล์และติดตั้ง

วางไฟล์ที่ส่งตามตำแหน่งในตาราง โดยใช้ร่วมกับชุดไฟล์หน้า Home/Deals/Detail/Library ล่าสุดที่ส่งไว้ก่อนหน้า
LibraryPage.tsx จากชุด API/LocalStorage ก่อนหน้าใช้ต่อได้ ไม่มีการแก้ในรอบ Supabase นี้

| ไฟล์ | ตำแหน่ง / ส่วนที่แก้ |
| --- | --- |
| backend.ts | src/api/backend.ts: Supabase client, config, Library Data API และ TanStack Query mutations |
| queryClient.ts | src/api/queryClient.ts: เพิ่ม QueryClient กลาง ใช้ร่วมกันทั้ง RAWG และ Supabase |
| useAuthStore.ts | src/store/useAuthStore.ts: Supabase Auth หรือบัญชีเดโมเดิม และฟังการเปลี่ยน session |
| useLibraryStore.ts | src/store/useLibraryStore.ts: อ่าน/เพิ่ม/ลบ/ล้าง Library ของบัญชี; เก็บเฉพาะ ID |
| RootLayout.tsx | src/layouts/RootLayout.tsx: เริ่มตรวจ session และ unsubscribe listener เมื่อ unmount |
| LoginPage.tsx | src/pages/LoginPage.tsx: แสดงช่อง Login เป็นอีเมลเมื่อใช้ Supabase |
| RegisterPage.tsx | src/pages/RegisterPage.tsx: แสดงข้อความยืนยันอีเมลเมื่อยังไม่มี session |
| auth.ts | src/types/auth.ts: เพิ่มผลสมัครสมาชิกที่ต้องยืนยันอีเมล |
| main.tsx | src/main.tsx: ใช้ QueryClient กลางตัวเดียว |
| package.json / package-lock.json | โฟลเดอร์หลักข้าง src: เพิ่ม @supabase/supabase-js และล็อก dependency |
| schema.sql | เก็บสำเนาใน supabase/schema.sql แล้วคัดลอกเนื้อหาไปรันใน Supabase SQL Editor |
| BACKEND_SETUP.md | โฟลเดอร์หลัก: คู่มือนี้ |

ใช้ Node.js 22.12 ขึ้นไป หรือ Node.js 24 เพื่อรองรับ Vite และ SDK เวอร์ชันนี้ แล้วรัน:

```sh
npm ci
```

## 2. ยังไม่ใช้ Supabase

ใน .env เก็บ VITE_RAWG_KEY เดิมไว้ แล้วเพิ่ม:

```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_PUBLISHABLE_KEY=""
```

หากทั้งสองค่าว่างหรือไม่ได้กำหนด ระบบใช้ LocalStorage เดิม: gamestation-users, gamestation-auth และ gamestation-library
ถ้าใส่ค่าเพียงตัวเดียว ระบบจะแจ้งให้ตั้งค่าให้ครบ ไม่สลับกลับไปใช้บัญชีเดโม

## 3. ตั้งค่า Supabase

1. สร้างโปรเจกต์ Supabase หรือใช้โปรเจกต์ที่มีอยู่
2. ก่อนสมัครผ่านเว็บ ให้เปิด SQL Editor วางเนื้อหา schema.sql ทั้งไฟล์แล้วกด Run สคริปต์สร้าง profiles, game_library, trigger และ RLS
3. ใช้ Email/Password provider ใน Supabase Auth และตั้งรหัสผ่านขั้นต่ำอย่างน้อย 8 ตัวให้สอดคล้องกับแบบฟอร์ม
4. ตั้ง Site URL เป็น URL ของหน้าเว็บ เช่น http://localhost:5173 และอนุญาต Redirect URL http://localhost:5173/login หากเปิดยืนยันอีเมล เมื่อ deploy ให้เพิ่ม URL ของเว็บจริงและ /login ด้วย
5. คัดลอก Project URL และ Publishable key จากโปรเจกต์มาใส่ใน .env:

```env
VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_YOUR_KEY"
```

SDK รองรับ legacy anon key ด้วย แต่ควรใช้ Publishable key สำหรับโปรเจกต์ใหม่ ห้ามใช้ Secret key หรือ service_role key ในหน้าเว็บ โค้ดปฏิเสธ key ที่มีสิทธิ์ระดับ server

6. restart dev server:

```sh
npm run dev
```

หากเป็น production ต้อง build ใหม่ เพราะ Vite ฝังค่า .env ตอน build

สคริปต์ SQL ใช้กับโครงสร้างตารางตามไฟล์นี้ ถ้ามีตารางชื่อเดียวกันแต่คนละโครงสร้าง ต้องปรับ schema ให้ตรงก่อน
สคริปต์รันซ้ำได้โดยไม่ลบข้อมูลตาราง แต่ไม่ได้ย้ายบัญชีเดโมหรือ backfill profile ของบัญชี Supabase ที่สร้างมาก่อนรัน SQL

## 4. พฤติกรรมของระบบ

- โหมด Supabase: Login ด้วยอีเมล; username เป็นชื่อแสดงในเว็บและไม่ซ้ำกันแบบไม่แยกตัวพิมพ์ใหญ่/เล็ก โดย trigger + unique index ที่ Database ตรวจตอนสมัคร
- ถ้าเปิด Confirm email: สมัครแล้วขึ้นข้อความให้ตรวจอีเมล ยังไม่ถือว่า Login จนมี session หลังยืนยันอีเมลแล้ว Login ได้
- ถ้าปิด Confirm email: Supabase คืน session ตอนสมัคร ระบบจึง Login ให้ทันที
- Login สำเร็จ: อ่าน ID เกมจาก game_library เฉพาะ user_id ของบัญชีปัจจุบัน
- เพิ่ม/ลบเกม: รอ API ยืนยันก่อนเปลี่ยน ID ในหน้าเว็บ แล้วอ่านรายการล่าสุดอีกครั้ง หากบันทึกสำเร็จแต่โหลดล่าสุดล้มเหลว จะคงรายการที่ยืนยันแล้วและแสดง error ให้ลองโหลดใหม่
- ล้างทั้งหมด: ลบเฉพาะรายการของบัญชีตัวเอง
- ไม่มีการย้ายบัญชีหรือ Library จาก LocalStorage ไป Supabase อัตโนมัติ ข้อมูลเดโมเดิมยังอยู่เมื่อกลับไปโหมด LocalStorage
- ถ้าตั้งค่า Supabase แล้วเชื่อมไม่ได้ จะแจ้ง error และมีปุ่มลองใหม่ ไม่มีการกลับไปบันทึกลง LocalStorage เงียบ ๆ
- โหมด Supabase SDK จะเก็บ session/token ของตัวเองใน LocalStorage เพื่อให้ Login ต่อหลัง reload ได้ ไม่ได้เก็บรหัสผ่าน ส่วนข้อมูลผู้ใช้จริงและ Library อยู่ที่ Supabase
- TanStack Query ดูแลคำขออ่าน/เขียน Library และ cache; Zustand เก็บ client session และ collection IDs เท่านั้น ไม่เก็บรายละเอียดเกมจาก RAWG ซ้ำ
- หน้า Home/Deals จะแสดงได้สูงสุด 30 เกมที่จับคู่ RAWG กับ CheapShark และมีราคาจริง โหลดข้อมูลเพิ่มจาก CheapShark แบบแบ่งหน้า (สูงสุด 3 หน้า) ราคาแสดงเป็นเงินบาทโดยประมาณตามอัตรา Frankfurter

## 5. ตรวจหลังเชื่อมโปรเจกต์จริง

สมัครสมาชิก → ยืนยันอีเมลถ้าเปิดไว้ → Login → เพิ่มเกม → reload → ตรวจว่าเกมยังอยู่ → Logout
ทดสอบอีกบัญชีว่ามองไม่เห็น Library ของบัญชีแรก ดูข้อมูลจริงได้จาก Authentication Users และ Table Editor ของ game_library
หากขึ้น Database error ตอนสมัคร ให้ตรวจว่ารัน SQL แล้ว ชื่อผู้ใช้ไม่ซ้ำ และดู Auth logs; error การส่งอีเมล/โควตาอีเมลให้ตรวจการตั้งค่า Auth/SMTP ของโปรเจกต์

โค้ดผ่าน build/lint ทั้งค่า Supabase ว่างและมีค่า ทดสอบ SDK จริงกับ HTTP จำลอง และตรวจ SQL ด้วย PostgreSQL แบบฝังตัว รวมถึง RLS ป้องกันข้ามบัญชี
ยังไม่ได้สร้างหรือแก้โปรเจกต์ Supabase ของคุณ และยังไม่ได้ทดสอบกับ URL/key จริงของคุณ ต้องรัน SQL และตั้งค่าตามขั้นตอนด้านบนก่อนใช้งานจริง

เอกสารทางการ:
- https://supabase.com/docs/guides/auth/quickstarts/react
- https://supabase.com/docs/reference/javascript/auth-signup
- https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- https://supabase.com/docs/guides/auth/managing-user-data
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/getting-started/api-keys

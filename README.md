# 🎮 GameStation — Mini Project 2 (UI)

เว็บร้านเกมแนว Steam / Epic Games  
React 19 · Vite · TypeScript · React Router v7 · Tailwind CSS v4 · DaisyUI 5

ข้อมูลเกมมาจาก RAWG และราคาเกม PC/ร้านค้ามาจาก CheapShark ผ่าน `/api/cheapshark` ฝั่งเซิร์ฟเวอร์ ส่วนบัญชีและ Library ใช้ LocalStorage หรือ Supabase ตามการตั้งค่า

## เริ่มใช้งาน

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # เช็ก TypeScript
npm run lint     # เช็ก ESLint (ฟ้องถ้ามี any)
```

## ทดสอบสถานะต่างๆ (ใช้ถ่าย screenshot ได้)

| URL | ผลลัพธ์ |
|---|---|
| `/?state=loading` | Skeleton loader |
| `/?state=error` | Error + ปุ่มลองใหม่ |
| `/?state=empty` | Empty state |

ใช้ได้ทุกหน้า เช่น `/game/3?state=loading`, `/library?state=empty`

## โครงสร้าง

```
src/
├─ types/        Interface ของ Game, Deal, Member (ใช้ร่วมกับฝั่ง API)
├─ mocks/        บัญชีเดโมเมื่อไม่ได้ตั้ง Supabase
├─ components/
│  ├─ state/     GameCardSkeleton, DetailSkeleton, ErrorState, EmptyState
│  ├─ game/      GameCard, GameGrid, GameRow (แถวเลื่อนแบบ Netflix), HeroBanner, GenreTabs
│  ├─ deal/      DealCard
│  └─ common/    SearchBar, Pagination, ThemeToggle
├─ layouts/      RootLayout (Navbar + <Outlet/> + Footer)
├─ pages/        Home, GameDetail (/game/:id), Library, Deals, DealDetail (/deal/:dealId), Login, Register, About, NotFound
└─ router.tsx    createBrowserRouter
```

## สำหรับเพื่อนที่ทำ State / API

ค้นหาคำว่า `TODO(เพื่อน)` ทั้งโปรเจกต์ แต่ละหน้ามีบล็อก `===== MOCK =====` ให้แทนด้วย hooks จริง

| หน้า | แทน mock ด้วย |
|---|---|
| HomePage (โหมดแถว) | แต่ละ `<GameRow>` เรียก `useGames({ genre: slug })` ของตัวเอง แล้วส่ง `isLoading` / `isError` / `refetch` เข้า props · แถวยอดนิยมใช้ `ordering: '-added'` |
| HomePage (โหมด grid) | `useGames({ page, genre, search })`, `useGenres()`, `useLibraryStore` |
| GameDetailPage | `useGame(id)`, `useScreenshots(id)`, `useLibraryStore` |
| LibraryPage | ids จาก `useLibraryStore` → `useQueries` |
| RootLayout | `useLibraryStore((s) => s.wishlist.length)` |
| main.tsx | ครอบด้วย `<QueryClientProvider>` |

`onRetry={refetch}` แทน `window.location.reload()` ส่วน JSX ไม่ต้องแก้

ติดตั้ง `zustand` และ `@tanstack/react-query` ไว้ใน package.json แล้ว

## API Key

สร้างไฟล์ `.env` (ดูตัวอย่างใน `.env.example`) — ห้าม commit ไฟล์ `.env`

## ราคาและ Deals

- หน้า Store และ Deals เริ่มจากรายการเกมที่ CheapShark มีราคาจริง จับคู่ชื่อกับ RAWG เพื่ออ่านภาพ/รายละเอียด แล้วอ่านหน้าถัดไปจนได้ 30 เกมหรือจนข้อมูลหมด (สูงสุด 10 หน้า); Search ใช้เกมชุดเดียวกัน
- อ่านราคาหลายร้านของแต่ละเกมด้วย CheapShark Multiple Game Lookup แบบชุดละไม่เกิน 25 เกม เพื่อลดจำนวนคำขอ
- หน้า Store แสดงราคาที่ถูกที่สุด; หน้า Detail เลือกร้านพร้อมไอคอนและบันทึกร้านลง Library
- หากเพิ่มจากการ์ดหรือแบนเนอร์โดยไม่เลือก ร้านที่ถูกที่สุดในขณะเปิด Library จะถูกแสดง
- หน้า Deals แสดงเฉพาะเกมที่มีส่วนลดจริงจาก CheapShark โดยไม่สร้างวันหมดโปรขึ้นเอง
- CheapShark ส่งราคาเป็น USD ตัวกลางแปลงเป็นเงินบาทด้วยอัตรา USD/THB ล่าสุดจาก Frankfurter และแสดงว่าเป็นราคาโดยประมาณ
- เกมที่ไม่มีชื่อจับคู่ตรงกันใน RAWG จะไม่อยู่ในรายการ Store/Deals; หน้า Detail และ Library ของเกมเก่ายังแสดงว่าไม่พบราคาหาก CheapShark ไม่มีข้อมูล
- CheapShark จำกัดอัตราการเรียก API จึงเก็บผลชั่วคราวและแสดงข้อผิดพลาดพร้อมให้ลองใหม่เมื่อถูกจำกัดชั่วคราว
- ในโหมด Supabase รายการเกมเก็บที่ Supabase ส่วนร้านที่เลือกเก็บในเบราว์เซอร์เดียวกัน

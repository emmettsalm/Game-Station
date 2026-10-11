# 🎮 GameStation — Mini Project 2 (UI)

เว็บร้านเกมแนว Steam / Epic Games  
React 19 · Vite · TypeScript · React Router v7 · Tailwind CSS v4 · DaisyUI 5

> ตอนนี้ทุกหน้าใช้ **mock data** (`src/mocks/`) เพื่อพัฒนา UI ก่อนต่อ API จริง

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
├─ mocks/        ข้อมูลปลอม + hook จำลองสถานะ  ← ลบได้เมื่อต่อ API จริง
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

## หน้า Deals

ใช้ข้อมูลโปรโมชันจำลองของเราเอง (`src/mocks/deals.ts`) ราคาเป็นเงินบาท ไม่ได้เชื่อม API ภายนอก

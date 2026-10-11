import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useLibraryStore } from '../store/useLibraryStore'
import ThemeToggle from '../components/common/ThemeToggle'
import { useAuthStore } from '../store/useAuthStore'
import logo from '../image/logo.png'

interface NavItem {
  to: string
  label: string
}

const links: NavItem[] = [
  { to: '/', label: 'Store' },
  { to: '/deals', label: 'Deals' },
  { to: '/library', label: 'Library' },
  { to: '/about', label: 'About' },
]

// TODO(เพื่อน): เปลี่ยนเป็น useLibraryStore((s) => s.wishlist.length)

export default function RootLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const initialized = useAuthStore((s) => s.initialized)
  const sessionError = useAuthStore((s) => s.sessionError)
  const initialize = useAuthStore((s) => s.initialize)
  const listenForAuthChanges = useAuthStore((s) => s.listenForAuthChanges)
  const loadLibrary = useLibraryStore((s) => s.loadLibrary)
  const resetRemoteLibrary = useLibraryStore((s) => s.resetRemoteLibrary)
  const libraryError = useLibraryStore((s) => s.error)
  const libraryLoading = useLibraryStore((s) => s.loading)
  const libraryPending = useLibraryStore((s) => s.pending)

  useEffect(() => {
    const stopListening = listenForAuthChanges()
    void initialize()
    return stopListening
  }, [initialize, listenForAuthChanges])
  useEffect(() => {
    if (user) void loadLibrary(user.id)
    else resetRemoteLibrary()
  }, [user, loadLibrary, resetRemoteLibrary])
  const navigate = useNavigate()
  const { pathname } = useLocation()
  
  const libraryCount = useLibraryStore((state) =>
    user
      ? (state.libraryByUser[user.id]?.length ?? 0)
      : 0,
  )

  const handleLogout = async () => {
    await logout()
    if (!useAuthStore.getState().user) navigate('/', { replace: true })
  }

  // แท็บแบบเส้นขอบ (tabs-border) — หน้า /deal/:id ให้ไฮไลต์แท็บ Deals ด้วย
  const tabCls = (to: string) => ({ isActive }: { isActive: boolean }) =>
    `tab ${isActive || (to === '/deals' && pathname.startsWith('/deal/')) ? 'tab-active font-semibold' : ''}`

  return (
    <div className="min-h-screen flex flex-col">
      <header className="navbar bg-base-200/90 backdrop-blur sticky top-0 z-50 px-4 shadow">
        <div className="flex-1">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <img src={logo} alt="" className="h-9 w-auto rounded-md" />
            <span>Game<span className="text-primary">Station</span></span>
          </NavLink>
        </div>

        {/* Desktop */}
        <nav role="tablist" className="hidden md:flex tabs tabs-border">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} role="tab" className={tabCls(l.to)}>
              {/* ตัวเลขจำนวนเกมใน Library — ติดมุมขวาบนของตัวหนังสือ */}
              <span className="indicator">
                {l.to === '/library' && libraryCount > 0 && (
                  <span className="indicator-item translate-x-3/4 -translate-y-1/3 min-w-4 h-4 px-1 rounded-full
                                   bg-pink-500 text-white text-[10px] font-bold leading-4 text-center">
                    {libraryCount}
                  </span>
                )}
                {l.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* ผู้ใช้ — Desktop */}
        <div className="hidden md:block ml-1">
          {user ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-square avatar avatar-placeholder" aria-label="เมนูผู้ใช้">
                <div className="bg-primary text-primary-content w-9 rounded-xl">
                  <span className="font-bold uppercase">{user.username.charAt(0)}</span>
                </div>
              </div>
              <ul tabIndex={0} className="menu dropdown-content bg-base-200 rounded-box w-56 shadow-lg mt-2 z-50">
                <li className="menu-title">
                  <span className="text-base-content font-bold">{user.username}</span>
                  <span className="text-xs font-normal opacity-60">{user.email}</span>
                </li>
                <li><Link to="/library">My Library</Link></li>
                <li><button type="button" className="text-error" onClick={handleLogout}>ออกจากระบบ</button></li>
              </ul>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">เข้าสู่ระบบ</Link>
          )}
        </div>

        {/* Mobile */}
        <div className="dropdown dropdown-end md:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost text-xl" aria-label="เมนู">☰</div>
          <ul tabIndex={0} className="menu dropdown-content bg-base-200 rounded-box w-52 shadow-lg mt-2 z-50">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to === '/'}>
                  {l.label}
                  {l.to === '/library' && libraryCount > 0 && (
                    <span className="badge badge-sm border-0 bg-pink-500 text-white font-bold">{libraryCount}</span>
                  )}
                </NavLink>
              </li>
            ))}
            <li className="menu-title pt-3">บัญชี</li>
            {user ? (
              <>
                <li className="pointer-events-none"><span>{user.username}</span></li>
                <li><button type="button" className="text-error" onClick={handleLogout}>ออกจากระบบ</button></li>
              </>
            ) : (
              <>
                <li><NavLink to="/login">เข้าสู่ระบบ</NavLink></li>
                <li><NavLink to="/register">สมัครสมาชิก</NavLink></li>
              </>
            )}
          </ul>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {sessionError && (
          <div role="alert" className="alert alert-error mb-4">
            <span>{sessionError}</span>
            <button type="button" className="btn btn-sm" onClick={() => { void initialize() }}>ลองใหม่</button>
          </div>
        )}
        {libraryError && (
          <div role="alert" className="alert alert-error mb-4">
            <span>{libraryError}</span>
            <button type="button" className="btn btn-sm" disabled={libraryPending || libraryLoading}
              onClick={() => { if (user) void loadLibrary(user.id) }}>โหลด Library ใหม่</button>
          </div>
        )}
        {(libraryLoading || libraryPending) && (
          <p role="status" className="mb-4 text-sm">{libraryPending ? 'กำลังบันทึก Library...' : 'กำลังโหลด Library...'}</p>
        )}
        {initialized ? <Outlet /> : <p role="status">กำลังตรวจสอบการเข้าสู่ระบบ...</p>}
      </main>

      <footer className="bg-base-200 p-6 text-center text-sm opacity-80">
        <p>
          © 2026 GameStation · Data by{' '}
          <a className="link" href="https://rawg.io" target="_blank" rel="noreferrer">RAWG</a>
        </p>
      </footer>

      {/* ปุ่มสลับธีม ลอยมุมขวาล่าง */}
      <ThemeToggle />
    </div>
  )
}

import { createBrowserRouter } from 'react-router'
import RootLayout from './layouts/RootLayout'
import HomePage from './pages/HomePage'
import GameDetailPage from './pages/GameDetailPage'
import LibraryPage from './pages/LibraryPage'
import DealsPage from './pages/DealsPage'
import DealDetailPage from './pages/DealDetailPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RequireAuth from './components/auth/RequireAuth'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'game/:id', element: <GameDetailPage /> },
      { path: 'library', element: <RequireAuth><LibraryPage /></RequireAuth> },   // ต้องล็อกอินก่อน
      { path: 'deals', element: <DealsPage /> },
      { path: 'deal/:dealId', element: <DealDetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

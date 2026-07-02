import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { auth, isAdmin } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  // Telas administrativas: cliente é redirecionado para o catálogo de quartos.
  if (adminOnly && !isAdmin) return <Navigate to="/quartos" replace />
  return <Outlet />
}

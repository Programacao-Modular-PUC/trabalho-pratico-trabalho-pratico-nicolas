import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute() {
  const { auth } = useAuth()
  return auth ? <Outlet /> : <Navigate to="/login" replace />
}

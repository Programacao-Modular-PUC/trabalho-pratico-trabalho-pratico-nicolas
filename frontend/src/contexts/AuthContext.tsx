import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthState {
  token: string
  username: string
  role: 'ROLE_ADMIN' | 'ROLE_CLIENTE'
  clienteId?: number
}

interface AuthContextType {
  auth: AuthState | null
  login: (data: AuthState) => void
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    try {
      const saved = localStorage.getItem('auth')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (data: AuthState) => {
    setAuth(data)
    localStorage.setItem('auth', JSON.stringify(data))
  }

  const logout = () => {
    setAuth(null)
    localStorage.removeItem('auth')
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAdmin: auth?.role === 'ROLE_ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}

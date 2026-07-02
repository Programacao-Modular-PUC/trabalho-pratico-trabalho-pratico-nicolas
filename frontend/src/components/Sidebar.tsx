import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Home, BedDouble, Users, ClipboardList, CreditCard, History, CalendarRange, UserRound, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const adminLinks = [
  { to: '/',               label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/residencias',    label: 'Residências',    icon: Home },
  { to: '/quartos',        label: 'Quartos',        icon: BedDouble },
  { to: '/clientes',       label: 'Clientes',       icon: Users },
  { to: '/alugueis',       label: 'Aluguéis',       icon: ClipboardList },
  { to: '/historico',      label: 'Histórico',      icon: History },
  { to: '/disponibilidade',label: 'Disponibilidade', icon: CalendarRange },
  { to: '/pagamentos',     label: 'Pagamentos',     icon: CreditCard },
]

const clienteLinks = [
  { to: '/quartos',     label: 'Quartos',     icon: BedDouble },
  { to: '/alugueis',    label: 'Aluguéis',    icon: ClipboardList },
  { to: '/minha-conta', label: 'Minha Conta', icon: UserRound },
]

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { auth, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const links = isAdmin ? adminLinks : clienteLinks

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const roleLabel = auth?.role === 'ROLE_ADMIN' ? 'Administrador' : 'Cliente'

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col border-r border-border bg-card transition-transform duration-200 md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="px-5 py-6">
        <p className="text-base font-semibold">🏡 HospedaApp</p>
        <p className="text-xs text-muted-foreground mt-0.5">Sistema de Hospedagem</p>
      </div>

      <div className="h-px bg-border" />

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="h-px bg-border" />
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{auth?.username}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Sair"
          className="ml-2 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}

import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/':            { title: 'Dashboard',   subtitle: 'Visão geral do sistema' },
  '/residencias': { title: 'Residências', subtitle: 'Gerencie as residências cadastradas' },
  '/quartos':     { title: 'Quartos',     subtitle: 'Gerencie os quartos disponíveis' },
  '/clientes':    { title: 'Clientes',    subtitle: 'Gerencie os clientes cadastrados' },
  '/alugueis':    { title: 'Aluguéis',   subtitle: 'Gerencie reservas e aluguéis' },
  '/pagamentos':  { title: 'Pagamentos',  subtitle: 'Controle financeiro de pagamentos' },
}

export function Layout() {
  const { pathname } = useLocation()
  const { auth } = useAuth()
  const { title, subtitle } = titles[pathname] ?? { title: '', subtitle: '' }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[220px] flex flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-card px-6 py-4">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {subtitle} &nbsp;·&nbsp; Logado como <span className="font-medium">{auth?.username}</span>
          </p>
        </header>
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

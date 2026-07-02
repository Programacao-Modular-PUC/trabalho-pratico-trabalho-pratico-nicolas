import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'

const titles: Record<string, { title: string; subtitle: string }> = {
  '/':               { title: 'Dashboard',      subtitle: 'Visão geral do sistema' },
  '/residencias':    { title: 'Residências',    subtitle: 'Gerencie as residências cadastradas' },
  '/quartos':        { title: 'Quartos',        subtitle: 'Gerencie os quartos disponíveis' },
  '/clientes':       { title: 'Clientes',       subtitle: 'Gerencie os clientes cadastrados' },
  '/alugueis':       { title: 'Aluguéis',       subtitle: 'Gerencie reservas e aluguéis' },
  '/historico':      { title: 'Histórico',      subtitle: 'Histórico de aluguéis' },
  '/disponibilidade':{ title: 'Disponibilidade', subtitle: 'Ocupação dos quartos por período' },
  '/pagamentos':     { title: 'Pagamentos',     subtitle: 'Controle financeiro de pagamentos' },
  '/minha-conta':    { title: 'Minha Conta',    subtitle: 'Seus dados pessoais' },
}

export function Layout() {
  const { pathname } = useLocation()
  const { auth } = useAuth()
  const [open, setOpen] = useState(false)
  const { title, subtitle } = titles[pathname] ?? { title: '', subtitle: '' }

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Backdrop do drawer (só mobile) */}
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex flex-1 flex-col min-w-0 md:ml-[220px]">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card px-4 py-4 md:px-6">
          <button
            className="md:hidden -ml-1 rounded-md p-2 text-muted-foreground hover:bg-secondary"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate md:text-xl">{title}</h1>
            <p className="text-sm text-muted-foreground truncate">
              {subtitle}
              <span className="hidden sm:inline"> &nbsp;·&nbsp; Logado como <span className="font-medium">{auth?.username}</span></span>
            </p>
          </div>
        </header>
        <main className="flex-1 bg-background p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

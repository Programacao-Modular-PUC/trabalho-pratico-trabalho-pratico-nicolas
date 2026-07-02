import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
import Dashboard from '@/pages/Dashboard'
import Residencias from '@/pages/Residencias'
import Quartos from '@/pages/Quartos'
import QuartoDetalhe from '@/pages/QuartoDetalhe'
import Clientes from '@/pages/Clientes'
import Alugueis from '@/pages/Alugueis'
import AluguelNovo from '@/pages/AluguelNovo'
import Historico from '@/pages/Historico'
import Disponibilidade from '@/pages/Disponibilidade'
import Pagamentos from '@/pages/Pagamentos'
import CheckoutPagamento from '@/pages/CheckoutPagamento'
import MinhaConta from '@/pages/MinhaConta'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Acessível ao cliente e ao admin */}
              <Route path="quartos" element={<Quartos />} />
              <Route path="quartos/:id" element={<QuartoDetalhe />} />
              <Route path="alugueis" element={<Alugueis />} />
              <Route path="checkout/:aluguelId" element={<CheckoutPagamento />} />
              <Route path="minha-conta" element={<MinhaConta />} />

              {/* Apenas admin */}
              <Route element={<ProtectedRoute adminOnly />}>
                <Route index element={<Dashboard />} />
                <Route path="residencias" element={<Residencias />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="alugueis/novo" element={<AluguelNovo />} />
                <Route path="historico" element={<Historico />} />
                <Route path="disponibilidade" element={<Disponibilidade />} />
                <Route path="pagamentos" element={<Pagamentos />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

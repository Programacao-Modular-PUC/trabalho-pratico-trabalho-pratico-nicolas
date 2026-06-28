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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="residencias" element={<Residencias />} />
              <Route path="quartos" element={<Quartos />} />
              <Route path="quartos/:id" element={<QuartoDetalhe />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="alugueis" element={<Alugueis />} />
              <Route path="alugueis/novo" element={<AluguelNovo />} />
              <Route path="checkout/:aluguelId" element={<CheckoutPagamento />} />
              <Route path="historico" element={<Historico />} />
              <Route path="disponibilidade" element={<Disponibilidade />} />
              <Route path="pagamentos" element={<Pagamentos />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

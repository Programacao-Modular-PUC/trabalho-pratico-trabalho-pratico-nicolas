import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Pagination } from '@/components/Pagination'
import { useAuth } from '@/contexts/AuthContext'
import { api, Aluguel } from '@/services/api'
import { situacaoBadge } from '@/lib/aluguel'
import { identificacaoQuarto, brl } from '@/lib/quarto'

const fmt = (dt: string) => new Date(dt).toLocaleDateString('pt-BR')

export default function Alugueis() {
  const navigate = useNavigate()
  const { auth, isAdmin } = useAuth()
  const [items, setItems] = useState<Aluguel[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const load = (p = 0) => {
    const fetch = isAdmin
      ? api.alugueis.listar(p)
      : auth?.clienteId
        ? api.alugueis.listarPorCliente(auth.clienteId, p)
        : Promise.resolve({ content: [], page: 0, totalPages: 0, totalElements: 0, first: true, last: true })
    fetch.then(res => {
      setItems(res.content); setPage(res.page); setTotalPages(res.totalPages); setTotalElements(res.totalElements)
    }).catch(() => {})
  }
  useEffect(() => { load(0) }, [])

  const confirmarCancelar = async () => {
    if (!confirmId) return
    try { await api.alugueis.cancelar(confirmId); load(page) }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Erro ao cancelar') }
    finally { setConfirmId(null) }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => navigate('/alugueis/novo')}>
          <Plus className="h-4 w-4" /> Novo Aluguel
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {isAdmin && <TableHead>Cliente</TableHead>}
              <TableHead>Quarto</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Saída</TableHead>
              <TableHead>Diárias</TableHead>
              <TableHead>Valor Final</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} className="text-center text-muted-foreground py-8">
                  Nenhum aluguel registrado
                </TableCell>
              </TableRow>
            )}
            {items.map(a => {
              const badge = situacaoBadge(a)
              return (
                <TableRow key={a.id} className={a.situacao === 'CANCELADO' ? 'opacity-50' : ''}>
                  {isAdmin && <TableCell className="font-medium">{a.cliente?.nome ?? '—'}</TableCell>}
                  <TableCell>{a.quarto ? identificacaoQuarto(a.quarto) : '—'}</TableCell>
                  <TableCell>{fmt(a.dataEntrada)}</TableCell>
                  <TableCell>{fmt(a.dataSaida)}</TableCell>
                  <TableCell>{a.quantidadeDiarias}</TableCell>
                  <TableCell>{brl(a.valorFinal)}</TableCell>
                  <TableCell><Badge variant={badge.variant}>{badge.label}</Badge></TableCell>
                  <TableCell className="text-right">
                    {!isAdmin && a.pagamento?.status === 'PENDENTE' && a.situacao !== 'CANCELADO' && (
                      <Button size="sm" variant="outline" className="mr-1" onClick={() => navigate(`/checkout/${a.id}`)}>
                        Pagar
                      </Button>
                    )}
                    {a.situacao !== 'CANCELADO' && a.situacao !== 'ENCERRADO' && (
                      <Button size="sm" variant="ghost" onClick={() => setConfirmId(a.id!)}>
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={p => load(p)} />
      </Card>

      <ConfirmDialog
        open={confirmId !== null}
        title="Cancelar aluguel"
        description="Tem certeza que deseja cancelar este aluguel? O pagamento também será cancelado."
        confirmLabel="Cancelar Aluguel"
        cancelLabel="Voltar"
        onConfirm={confirmarCancelar}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

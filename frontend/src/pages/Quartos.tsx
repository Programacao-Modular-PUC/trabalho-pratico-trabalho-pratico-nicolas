import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Wrench, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Pagination } from '@/components/Pagination'
import { useAuth } from '@/contexts/AuthContext'
import { api, Quarto, Residencia } from '@/services/api'
import { tipoLabel, identificacaoQuarto, brl } from '@/lib/quarto'
import QuartosGaleria from '@/pages/QuartosGaleria'

type TipoQuarto = 'INDIVIDUAL' | 'CASAL' | 'FAMILIA'

// Cliente vê a galeria de cards; admin vê a gestão.
export default function Quartos() {
  const { isAdmin } = useAuth()
  return isAdmin ? <QuartosAdmin /> : <QuartosGaleria />
}

const emptyForm = {
  tipo: 'INDIVIDUAL' as TipoQuarto,
  residenciaId: '',
  valorBase: '',
  possuiArCondicionado: false,
  possuiHidromassagem: false,
  numeroCamas: '1',
  limiteHospedes: '1',
  tipoCama: 'CASAL',
  possuiBerco: false,
  capacidadeMaxima: '',
  quantidadeAmbientes: '1',
  numeroHospedes: '',
  listaCamas: '',
  imagens: '',
}

const statusBadge: Record<string, { label: string; cls: string }> = {
  DISPONIVEL: { label: 'Disponível', cls: 'bg-green-100 text-green-700' },
  OCUPADO: { label: 'Ocupado', cls: 'bg-red-100 text-red-700' },
  MANUTENCAO: { label: 'Manutenção', cls: 'bg-amber-100 text-amber-700' },
}

function QuartosAdmin() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Quarto[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [residencias, setResidencias] = useState<Residencia[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [error, setError] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const load = (tipo?: string, p = 0) => {
    api.quartos.listar(tipo, p, 9).then(res => {
      setItems(res.content); setPage(res.page); setTotalPages(res.totalPages); setTotalElements(res.totalElements)
    }).catch(() => {})
    api.residencias.listar().then(setResidencias).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const onFiltroTipo = (v: string) => {
    const tipo = v === 'TODOS' ? undefined : v
    setFiltroTipo(v === 'TODOS' ? '' : v)
    load(tipo, 0)
  }

  const save = async () => {
    try {
      const resId = Number(form.residenciaId)
      if (!resId) { setError('Selecione uma residência'); return }
      const imagens = form.imagens.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
      const base: Quarto = {
        valorBase: Number(form.valorBase),
        possuiArCondicionado: form.possuiArCondicionado,
        possuiHidromassagem: form.possuiHidromassagem,
        imagens,
      }
      if (form.tipo === 'INDIVIDUAL') {
        await api.quartos.criarIndividual(resId, { ...base, numeroCamas: Number(form.numeroCamas), limiteHospedes: Number(form.limiteHospedes) })
      } else if (form.tipo === 'CASAL') {
        await api.quartos.criarCasal(resId, { ...base, tipoCama: form.tipoCama as 'CASAL' | 'QUEEN' | 'KING', possuiBerco: form.possuiBerco })
      } else {
        await api.quartos.criarFamilia(resId, {
          ...base,
          capacidadeMaxima: Number(form.capacidadeMaxima),
          quantidadeAmbientes: Number(form.quantidadeAmbientes),
          numeroHospedes: Number(form.numeroHospedes),
          listaCamas: form.listaCamas.split(',').map(s => s.trim()).filter(Boolean),
        })
      }
      setOpen(false); load(filtroTipo || undefined, 0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  const confirmarDelete = async () => {
    if (!deleteId) return
    setDeleteError('')
    try { await api.quartos.deletar(deleteId); load(filtroTipo || undefined, page) }
    catch (e: unknown) { setDeleteError(e instanceof Error ? e.message : 'Erro ao excluir quarto') }
    finally { setDeleteId(null) }
  }

  const toggleManutencao = async (q: Quarto) => {
    const novo = q.status === 'MANUTENCAO' ? 'DISPONIVEL' : 'MANUTENCAO'
    try { await api.quartos.alterarStatus(q.id!, novo); load(filtroTipo || undefined, page) }
    catch (e: unknown) { alert(e instanceof Error ? e.message : 'Erro ao alterar status') }
  }

  const fi = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))
  const cb = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.checked }))

  const SimNao = ({ v }: { v?: boolean }) => (
    <span className={v ? 'text-green-600 font-medium' : 'text-muted-foreground'}>{v ? 'Sim' : 'Não'}</span>
  )

  return (
    <div className="space-y-4">
      {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="whitespace-nowrap">Filtrar por tipo:</Label>
          <Select value={filtroTipo || 'TODOS'} onValueChange={onFiltroTipo}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="INDIVIDUAL">Individual</SelectItem>
              <SelectItem value="CASAL">Casal</SelectItem>
              <SelectItem value="FAMILIA">Família</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setForm({ ...emptyForm }); setError(''); setOpen(true) }}>
          <Plus className="h-4 w-4" /> Novo Quarto
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.length === 0 && <p className="text-sm text-muted-foreground py-8">Nenhum quarto cadastrado.</p>}
        {items.map(q => {
          const badge = statusBadge[q.statusAtual ?? 'DISPONIVEL'] ?? statusBadge.DISPONIVEL
          const emManutencao = q.status === 'MANUTENCAO'
          return (
            <Card key={q.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{identificacaoQuarto(q)}</p>
                  <p className="text-sm text-muted-foreground">{tipoLabel[q.tipo ?? '']}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
              </div>
              <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Valor/diária:</span><span className="font-semibold">{brl(q.valorDiaria ?? q.valorBase)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ar-Cond.:</span><SimNao v={q.possuiArCondicionado} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Hidromassagem:</span><SimNao v={q.possuiHidromassagem} /></div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toggleManutencao(q)}>
                  {emManutencao ? <><RotateCcw className="h-3.5 w-3.5" /> Liberar</> : <><Wrench className="h-3.5 w-3.5" /> Manutenção</>}
                </Button>
                <Button size="sm" className="flex-1" disabled={emManutencao}
                  onClick={() => navigate(`/alugueis/novo?residencia=${q.residenciaId}&quarto=${q.id}`)}>
                  Alugar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(q.id!)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={p => load(filtroTipo || undefined, p)} />

      {/* Dialog de criação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Quarto</DialogTitle>
            <DialogDescription>Configure o tipo e as características do quarto.</DialogDescription>
          </DialogHeader>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Residência</Label>
              <Select value={form.residenciaId} onValueChange={v => setForm(p => ({ ...p, residenciaId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {residencias.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.endereco}, {r.numero}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v => setForm(p => ({ ...p, tipo: v as TipoQuarto }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  <SelectItem value="CASAL">Casal</SelectItem>
                  <SelectItem value="FAMILIA">Família</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Valor Base (R$)</Label>
              <Input type="number" value={form.valorBase} onChange={fi('valorBase')} placeholder="150" />
            </div>
            <div className="space-y-1 flex flex-col justify-end pb-1">
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.possuiArCondicionado} onChange={cb('possuiArCondicionado')} /> Ar-cond.
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.possuiHidromassagem} onChange={cb('possuiHidromassagem')} /> Hidro
                </label>
              </div>
            </div>

            {form.tipo === 'INDIVIDUAL' && <>
              <div className="space-y-1">
                <Label>Nº de Camas</Label>
                <Input type="number" min={1} value={form.numeroCamas} onChange={fi('numeroCamas')} />
              </div>
              <div className="space-y-1">
                <Label>Limite de Hóspedes</Label>
                <Input type="number" min={1} value={form.limiteHospedes} onChange={fi('limiteHospedes')} />
              </div>
            </>}

            {form.tipo === 'CASAL' && <>
              <div className="space-y-1">
                <Label>Tipo de Cama</Label>
                <Select value={form.tipoCama} onValueChange={v => setForm(p => ({ ...p, tipoCama: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASAL">Casal</SelectItem>
                    <SelectItem value="QUEEN">Queen</SelectItem>
                    <SelectItem value="KING">King</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 flex flex-col justify-end pb-1">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.possuiBerco} onChange={cb('possuiBerco')} /> Possui Berço
                </label>
              </div>
            </>}

            {form.tipo === 'FAMILIA' && <>
              <div className="space-y-1">
                <Label>Capacidade Máxima</Label>
                <Input type="number" min={1} value={form.capacidadeMaxima} onChange={fi('capacidadeMaxima')} />
              </div>
              <div className="space-y-1">
                <Label>Nº de Ambientes</Label>
                <Input type="number" min={1} value={form.quantidadeAmbientes} onChange={fi('quantidadeAmbientes')} />
              </div>
              <div className="space-y-1">
                <Label>Nº de Hóspedes</Label>
                <Input type="number" min={1} value={form.numeroHospedes} onChange={fi('numeroHospedes')} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Camas (separadas por vírgula)</Label>
                <Input value={form.listaCamas} onChange={fi('listaCamas')} placeholder="SOLTEIRO, CASAL, QUEEN" />
              </div>
            </>}

            <div className="col-span-2 space-y-1">
              <Label>Imagens (uma URL por linha)</Label>
              <textarea
                value={form.imagens}
                onChange={e => setForm(p => ({ ...p, imagens: e.target.value }))}
                rows={3}
                placeholder={'https://exemplo.com/foto1.jpg\nhttps://exemplo.com/foto2.jpg'}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              />
              <p className="text-xs text-muted-foreground">Opcional. Sem imagens, usamos uma foto padrão do tipo.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir quarto"
        description="Tem certeza que deseja excluir este quarto? Aluguéis ativos vinculados impedirão a exclusão."
        confirmLabel="Excluir"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

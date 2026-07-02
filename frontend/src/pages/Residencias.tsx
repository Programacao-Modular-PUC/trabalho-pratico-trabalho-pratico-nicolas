import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { api, Residencia } from '@/services/api'

const empty: Residencia = { endereco: '', numero: '', bairro: '', cep: '', telefone: '', email: '' }

export default function Residencias() {
  const [items, setItems] = useState<Residencia[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Residencia>(empty)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [busca, setBusca] = useState('')

  const reload = () => api.residencias.listar().then(setItems).catch(() => {})
  useEffect(() => { reload() }, [])

  const filtrados = items.filter(r => {
    if (!busca) return true
    const t = busca.toLowerCase()
    return r.endereco.toLowerCase().includes(t) || r.bairro.toLowerCase().includes(t)
  })

  const openNew  = () => { setForm(empty); setError(''); setOpen(true) }
  const openEdit = (r: Residencia) => { setForm({ ...r }); setError(''); setOpen(true) }

  const save = async () => {
    try {
      if (form.id) await api.residencias.atualizar(form.id, form)
      else await api.residencias.criar(form)
      setOpen(false); reload()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  const confirmarDelete = async () => {
    if (!deleteId) return
    setDeleteError('')
    try {
      await api.residencias.deletar(deleteId)
      reload()
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : 'Erro ao excluir residência.')
    } finally {
      setDeleteId(null)
    }
  }

  const field = (k: keyof Residencia) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input className="max-w-xs" placeholder="Buscar residência..." value={busca} onChange={e => setBusca(e.target.value)} />
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Nova Residência</Button>
      </div>

      {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endereço</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead>CEP</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Quartos</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma residência cadastrada</TableCell></TableRow>
            )}
            {filtrados.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.endereco}, {r.numero}</TableCell>
                <TableCell>{r.bairro}</TableCell>
                <TableCell>{r.cep}</TableCell>
                <TableCell>{r.telefone}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.totalQuartos ?? 0}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id!)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar Residência' : 'Nova Residência'}</DialogTitle>
            <DialogDescription>Preencha os dados da residência.</DialogDescription>
          </DialogHeader>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="col-span-2 space-y-1">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={field('endereco')} placeholder="Rua das Flores" />
            </div>
            <div className="space-y-1">
              <Label>Número</Label>
              <Input value={form.numero} onChange={field('numero')} placeholder="123" />
            </div>
            <div className="space-y-1">
              <Label>Bairro</Label>
              <Input value={form.bairro} onChange={field('bairro')} placeholder="Centro" />
            </div>
            <div className="space-y-1">
              <Label>CEP</Label>
              <Input value={form.cep} onChange={field('cep')} placeholder="00000-000" />
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={field('telefone')} placeholder="(73) 99999-9999" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Email</Label>
              <Input value={form.email} onChange={field('email')} placeholder="contato@exemplo.com" />
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
        title="Excluir residência"
        description="Esta ação não pode ser desfeita. Todos os quartos vinculados também serão excluídos."
        confirmLabel="Excluir"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

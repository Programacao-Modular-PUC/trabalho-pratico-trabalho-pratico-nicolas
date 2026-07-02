import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Pagination } from '@/components/Pagination'
import { api, Cliente } from '@/services/api'

const empty: Cliente = { nome: '', sobrenome: '', cpf: '', endereco: '', cep: '', telefone: '', email: '', dataNascimento: '' }

const nomeCompleto = (c: Cliente) => [c.nome, c.sobrenome].filter(Boolean).join(' ')
const inicial = (c: Cliente) => (c.nome?.[0] ?? '?').toUpperCase()

export default function Clientes() {
  const [items, setItems] = useState<Cliente[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [form, setForm] = useState<Cliente>(empty)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const reload = (p = 0) => api.clientes.listar(p).then(res => {
    setItems(res.content); setPage(res.page); setTotalPages(res.totalPages); setTotalElements(res.totalElements)
  }).catch(() => {})
  useEffect(() => { reload(0) }, [])

  const editar = (c: Cliente) => { setForm({ ...c }); setError('') }
  const novo = () => { setForm(empty); setError('') }

  const salvar = async () => {
    setError('')
    try {
      if (form.id) await api.clientes.atualizar(form.id, form)
      else await api.clientes.criar(form)
      novo(); reload(page)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    }
  }

  const confirmarDelete = async () => {
    if (!deleteId) return
    await api.clientes.deletar(deleteId).catch(() => {})
    setDeleteId(null)
    if (form.id === deleteId) novo()
    reload(page)
  }

  const field = (k: keyof Cliente) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ----- Lista ----- */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Clientes Cadastrados</h2>
        <p className="text-sm text-muted-foreground mb-4">{totalElements} cliente(s) no sistema</p>
        <div className="space-y-2">
          {items.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">Nenhum cliente cadastrado.</p>}
          {items.map(c => (
            <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                {inicial(c)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{nomeCompleto(c)}</p>
                <p className="text-xs text-muted-foreground">{c.cpf}</p>
                <p className="text-xs text-muted-foreground">{c.telefone}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => editar(c)}>Editar</Button>
              <Button size="sm" variant="ghost" onClick={() => setDeleteId(c.id!)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
        <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={p => reload(p)} />
      </Card>

      {/* ----- Formulário ----- */}
      <Card className="p-6 h-fit">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{form.id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            <p className="text-sm text-muted-foreground">Preencha os dados do cliente</p>
          </div>
          {form.id && <Button size="sm" variant="ghost" onClick={novo}>+ Novo</Button>}
        </div>

        {error && <p className="text-sm text-destructive mt-3">{error}</p>}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={field('nome')} placeholder="João" />
          </div>
          <div className="space-y-1">
            <Label>Sobrenome</Label>
            <Input value={form.sobrenome ?? ''} onChange={field('sobrenome')} placeholder="Silva" />
          </div>
          <div className="space-y-1">
            <Label>CPF</Label>
            <Input value={form.cpf} onChange={field('cpf')} placeholder="000.000.000-00" disabled={!!form.id} />
          </div>
          <div className="space-y-1">
            <Label>Data de nascimento</Label>
            <Input type="date" value={form.dataNascimento ?? ''} onChange={field('dataNascimento')} />
          </div>
          <div className="space-y-1">
            <Label>Telefone</Label>
            <Input value={form.telefone} onChange={field('telefone')} placeholder="(73) 99999-9999" />
          </div>
          <div className="space-y-1">
            <Label>E-mail</Label>
            <Input type="email" value={form.email} onChange={field('email')} placeholder="cliente@email.com" />
          </div>
          <div className="space-y-1">
            <Label>CEP</Label>
            <Input value={form.cep ?? ''} onChange={field('cep')} placeholder="00000-000" maxLength={9} />
          </div>
          <div className="space-y-1">
            <Label>Endereço</Label>
            <Input value={form.endereco} onChange={field('endereco')} placeholder="Rua, número, bairro" />
          </div>
        </div>

        <Button className="w-full mt-5" onClick={salvar}>{form.id ? 'Salvar Alterações' : 'Salvar Cliente'}</Button>
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        title="Excluir cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmarDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { UserRound, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, Cliente } from '@/services/api'

export default function MinhaConta() {
  const [form, setForm] = useState<Cliente | null>(null)
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    api.clientes.me()
      .then(setForm)
      .catch(e => setErro(e instanceof Error ? e.message : 'Não foi possível carregar seus dados.'))
  }, [])

  const field = (k: keyof Cliente) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => (f ? { ...f, [k]: e.target.value } : f))

  const salvar = async () => {
    if (!form) return
    setErro(''); setOk(false); setSalvando(true)
    try {
      const atualizado = await api.clientes.atualizarMe(form)
      setForm(atualizado); setOk(true)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setSalvando(false)
    }
  }

  if (erro && !form) return <p className="text-sm text-destructive py-12 text-center">{erro}</p>
  if (!form) return <p className="text-sm text-muted-foreground py-12 text-center">Carregando...</p>

  const inicial = (form.nome?.[0] ?? '?').toUpperCase()
  const nomeCompleto = [form.nome, form.sobrenome].filter(Boolean).join(' ')

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold">
            {inicial}
          </div>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2"><UserRound className="h-5 w-5" /> Minha Conta</h1>
            <p className="text-sm text-muted-foreground">{nomeCompleto || 'Atualize seus dados pessoais'}</p>
          </div>
        </div>

        {erro && <p className="text-sm text-destructive mt-4">{erro}</p>}
        {ok && (
          <p className="mt-4 flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Dados atualizados com sucesso.
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={field('nome')} />
          </div>
          <div className="space-y-1">
            <Label>Sobrenome</Label>
            <Input value={form.sobrenome ?? ''} onChange={field('sobrenome')} />
          </div>
          <div className="space-y-1">
            <Label>CPF</Label>
            <Input value={form.cpf} disabled title="O CPF não pode ser alterado" />
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
            <Input type="email" value={form.email} onChange={field('email')} />
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

        <Button className="mt-6" onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </Card>
    </div>
  )
}

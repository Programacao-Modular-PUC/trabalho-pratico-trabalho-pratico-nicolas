import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/services/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-border pb-1 mb-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>
    </div>
  )
}

export default function Cadastro() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nome: '',
    sobrenome: '',
    cpf: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3')
      .replace(/(\d{3})(\d{3})$/, '$1.$2')
      .replace(/(\d{3})$/, '$1')
  }

  const formatCep = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 8)
    return d.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  const buscarCep = async (cep: string) => {
    const raw = cep.replace(/\D/g, '')
    if (raw.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
      const data = await res.json()
      if (!data.erro) {
        const endereco = [data.logradouro, data.bairro, data.localidade].filter(Boolean).join(', ')
        setForm(f => ({ ...f, endereco }))
      }
    } catch { /* silencioso: usuário preenche manualmente */ }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const data = await api.auth.registro({
        username: form.username,
        password: form.password,
        nome: form.nome,
        sobrenome: form.sobrenome,
        cpf: form.cpf,
        dataNascimento: form.dataNascimento,
        email: form.email,
        telefone: form.telefone,
        cep: form.cep,
        endereco: form.endereco,
      })
      login({ token: data.token, username: data.username, role: data.role as 'ROLE_ADMIN' | 'ROLE_CLIENTE', clienteId: data.clienteId })
      // Registro sempre cria um CLIENTE → catálogo de quartos.
      navigate('/quartos', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-10 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <p className="text-3xl">🏡</p>
          <h1 className="text-2xl font-semibold mt-2">Criar conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Sistema de Hospedagem — Maraú, BA</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-5">

          {/* Dados de acesso */}
          <div>
            <SectionTitle>Dados de acesso</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field id="username" label="Nome de usuário">
                <Input
                  id="username"
                  value={form.username}
                  onChange={set('username')}
                  placeholder="meu_usuario"
                  autoComplete="username"
                  required
                />
              </Field>
              <Field id="password" label="Senha">
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="mínimo 6 caracteres"
                  autoComplete="new-password"
                  required
                />
              </Field>
              <Field id="confirmPassword" label="Confirmar senha">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="repita a senha"
                  autoComplete="new-password"
                  required
                />
              </Field>
            </div>
          </div>

          {/* Dados pessoais */}
          <div>
            <SectionTitle>Dados pessoais</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="nome" label="Nome">
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={set('nome')}
                  placeholder="João"
                  required
                />
              </Field>
              <Field id="sobrenome" label="Sobrenome">
                <Input
                  id="sobrenome"
                  value={form.sobrenome}
                  onChange={set('sobrenome')}
                  placeholder="Silva"
                  required
                />
              </Field>
              <Field id="cpf" label="CPF">
                <Input
                  id="cpf"
                  value={form.cpf}
                  onChange={e => setForm(f => ({ ...f, cpf: formatCpf(e.target.value) }))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </Field>
              <Field id="dataNascimento" label="Data de nascimento">
                <Input
                  id="dataNascimento"
                  type="date"
                  value={form.dataNascimento}
                  onChange={set('dataNascimento')}
                  required
                />
              </Field>
            </div>
          </div>

          {/* Contato */}
          <div>
            <SectionTitle>Contato</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="email" label="E-mail">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="joao@email.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field id="telefone" label="Telefone">
                <Input
                  id="telefone"
                  value={form.telefone}
                  onChange={set('telefone')}
                  placeholder="(75) 99999-9999"
                  required
                />
              </Field>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <SectionTitle>Endereço</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field id="cep" label="CEP">
                <Input
                  id="cep"
                  value={form.cep}
                  onChange={e => setForm(f => ({ ...f, cep: formatCep(e.target.value) }))}
                  onBlur={e => buscarCep(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  required
                />
              </Field>
              <div className="sm:col-span-2">
                <Field id="endereco" label="Endereço completo">
                  <Input
                    id="endereco"
                    value={form.endereco}
                    onChange={set('endereco')}
                    placeholder="Rua das Flores, 123 — Bairro Centro"
                    required
                  />
                </Field>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

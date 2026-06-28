import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { api, Residencia, Quarto, Cliente } from '@/services/api'
import { tipoLabel, identificacaoQuarto, brl } from '@/lib/quarto'
import { calcularDiarias } from '@/lib/aluguel'

const fmtData = (s: string) =>
  s ? new Date(s).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export default function AluguelNovo() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { auth, isAdmin } = useAuth()

  const [residencias, setResidencias] = useState<Residencia[]>([])
  const [quartos, setQuartos] = useState<Quarto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])

  const [residenciaId, setResidenciaId] = useState('')
  const [quartoId, setQuartoId] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [dataEntrada, setDataEntrada] = useState('')
  const [dataSaida, setDataSaida] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    api.residencias.listar().then(setResidencias).catch(() => {})
    if (isAdmin) api.clientes.listar(0, 200).then(r => setClientes(r.content)).catch(() => {})
  }, [])

  // Pré-seleção vinda do card de Quartos (?residencia=&quarto=)
  useEffect(() => {
    const r = params.get('residencia'); const q = params.get('quarto')
    if (r) selecionarResidencia(r, q ?? undefined)
  }, [])

  const selecionarResidencia = (id: string, preQuarto?: string) => {
    setResidenciaId(id); setQuartoId('')
    if (id) api.quartos.listarPorResidencia(Number(id)).then(qs => {
      setQuartos(qs)
      if (preQuarto && qs.some(q => String(q.id) === preQuarto)) setQuartoId(preQuarto)
    }).catch(() => {})
    else setQuartos([])
  }

  const quarto = useMemo(() => quartos.find(q => String(q.id) === quartoId), [quartos, quartoId])

  const diarias = useMemo(
    () => (dataEntrada && dataSaida ? calcularDiarias(dataEntrada, dataSaida) : 0),
    [dataEntrada, dataSaida],
  )

  // composição do valor da diária
  const base = quarto?.valorBase ?? 0
  const arAdd = quarto?.possuiArCondicionado ? 20 : 0
  const hidroAdd = quarto?.possuiHidromassagem ? 20 : 0
  const diaria = quarto?.valorDiaria ?? 0
  const outros = Math.max(0, Math.round((diaria - base - arAdd - hidroAdd) * 100) / 100)
  const total = diaria * diarias

  const confirmar = async () => {
    setErro('')
    const cli = isAdmin ? Number(clienteId) : auth?.clienteId
    if (!residenciaId || !quartoId) { setErro('Selecione a residência e o quarto.'); return }
    if (!cli) { setErro('Selecione o cliente.'); return }
    if (!dataEntrada || !dataSaida) { setErro('Informe as datas de entrada e saída.'); return }
    if (new Date(dataSaida) <= new Date(dataEntrada)) { setErro('A saída deve ser posterior à entrada.'); return }
    setSalvando(true)
    try {
      const aluguel = await api.alugueis.realizar(Number(residenciaId), Number(quartoId), cli, {
        dataEntrada: dataEntrada + ':00', dataSaida: dataSaida + ':00',
      })
      // Cliente segue para o checkout; admin (registro presencial) volta à lista.
      navigate(isAdmin ? '/alugueis' : `/checkout/${aluguel.id}`)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao realizar aluguel.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-1">
      <h1 className="text-xl font-bold">Realizar Aluguel</h1>
      <p className="text-sm text-muted-foreground mb-4">Preencha os dados para registrar um novo aluguel</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ----- Formulário ----- */}
        <Card className="lg:col-span-3 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Dados do Aluguel</h2>
          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <div className="space-y-1">
            <Label>Residência</Label>
            <Select value={residenciaId} onValueChange={v => selecionarResidencia(v)}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {residencias.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.endereco} — {r.bairro}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Quarto</Label>
            <Select value={quartoId} onValueChange={setQuartoId} disabled={!residenciaId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {quartos.map(q => (
                  <SelectItem key={q.id} value={String(q.id)}>
                    {identificacaoQuarto(q)} — {tipoLabel[q.tipo ?? '']} — {brl(q.valorDiaria)}/diária
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="space-y-1">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {clientes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}{c.sobrenome ? ` ${c.sobrenome}` : ''} — {c.cpf}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Data e Horário de Entrada</Label>
              <Input type="datetime-local" value={dataEntrada} onChange={e => setDataEntrada(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Data e Horário de Saída</Label>
              <Input type="datetime-local" value={dataSaida} onChange={e => setDataSaida(e.target.value)} />
            </div>
          </div>

          {diarias > 0 && (
            <div className="rounded-md bg-primary/5 border border-primary/15 p-3 text-xs text-muted-foreground">
              Regra de diárias: entrada às 12h; saída após 12h conta diária adicional.<br />
              Período selecionado → <span className="font-medium text-foreground">{diarias} diária(s)</span>.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate('/alugueis')}>Cancelar</Button>
            <Button className="flex-1" onClick={confirmar} disabled={salvando}>
              {salvando ? 'Processando...' : 'Confirmar Aluguel'}
            </Button>
          </div>
        </Card>

        {/* ----- Resumo (painel escuro) ----- */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-zinc-900 text-zinc-100 p-6 space-y-4">
            <h2 className="text-base font-semibold">Formulário de Aluguel</h2>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Resumo da Reserva</p>
              <Linha escuro label="Data e horário de entrada" valor={fmtData(dataEntrada)} />
              <Linha escuro label="Data e horário de saída" valor={fmtData(dataSaida)} />
              <Linha escuro label="Número de diárias" valor={diarias > 0 ? `${diarias} diárias` : '—'} />
            </div>

            <div className="border-t border-zinc-700 pt-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Composição do valor</p>
              {quarto ? <>
                <Linha escuro label={`Valor base (${tipoLabel[quarto.tipo ?? '']})`} valor={`${brl(base)}/diária`} />
                {arAdd > 0 && <Linha escuro label="Ar-condicionado" valor={`+ ${brl(arAdd)}/diária`} />}
                {hidroAdd > 0 && <Linha escuro label="Hidromassagem" valor={`+ ${brl(hidroAdd)}/diária`} />}
                {outros > 0 && <Linha escuro label="Outros adicionais" valor={`+ ${brl(outros)}/diária`} />}
                <div className="flex justify-between font-semibold pt-1">
                  <span>Valor por diária</span><span>{brl(diaria)}</span>
                </div>
                <Linha escuro label="Número de diárias" valor={diarias > 0 ? `× ${diarias}` : '—'} />
              </> : <p className="text-sm text-zinc-400">Selecione um quarto para ver os valores.</p>}
            </div>

            <div className="border-t border-zinc-700 pt-3">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Total a pagar</p>
              <p className="text-3xl font-bold mt-1">{brl(total)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Linha({ label, valor }: { label: string; valor: string; escuro?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="font-medium">{valor}</span>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { api, Aluguel } from '@/services/api'
import { situacaoBadge } from '@/lib/aluguel'
import { identificacaoQuarto, brl } from '@/lib/quarto'

const fmt = (dt: string) => new Date(dt).toLocaleDateString('pt-BR')
const mesLabel = (s: string) => {
  const d = new Date(s)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^./, c => c.toUpperCase())
}
const mesChave = (s: string) => s.slice(0, 7) // YYYY-MM

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex-1 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </Card>
  )
}

export default function Historico() {
  const [todos, setTodos] = useState<Aluguel[]>([])
  const [mes, setMes] = useState('TODOS')
  const [status, setStatus] = useState('TODOS')
  const [quartoFiltro, setQuartoFiltro] = useState('TODOS')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    api.alugueis.listar(0, 1000).then(r => setTodos(r.content)).catch(() => {})
  }, [])

  const meses = useMemo(() => {
    const set = new Map<string, string>()
    todos.forEach(a => set.set(mesChave(a.dataEntrada), mesLabel(a.dataEntrada)))
    return [...set.entries()].sort().reverse()
  }, [todos])

  const quartos = useMemo(() => {
    const set = new Map<string, string>()
    todos.forEach(a => { if (a.quarto) set.set(String(a.quarto.id), identificacaoQuarto(a.quarto)) })
    return [...set.entries()]
  }, [todos])

  const filtrados = useMemo(() => todos.filter(a => {
    if (mes !== 'TODOS' && mesChave(a.dataEntrada) !== mes) return false
    if (status !== 'TODOS' && a.situacao !== status) return false
    if (quartoFiltro !== 'TODOS' && String(a.quarto?.id) !== quartoFiltro) return false
    if (busca && !(a.cliente?.nome ?? '').toLowerCase().includes(busca.toLowerCase())) return false
    return true
  }), [todos, mes, status, quartoFiltro, busca])

  const ativos = filtrados.filter(a => a.situacao !== 'CANCELADO')
  const receita = ativos.reduce((s, a) => s + (a.valorFinal ?? 0), 0)
  const diarias = ativos.reduce((s, a) => s + (a.quantidadeDiarias ?? 0), 0)
  const clientesUnicos = new Set(filtrados.map(a => a.cliente?.id).filter(Boolean)).size

  const exportarCSV = () => {
    const head = ['Cliente', 'Quarto', 'Entrada', 'Saida', 'Diarias', 'Valor Final', 'Situacao']
    const linhas = filtrados.map(a => [
      a.cliente?.nome ?? '', a.quarto ? identificacaoQuarto(a.quarto) : '',
      fmt(a.dataEntrada), fmt(a.dataSaida), String(a.quantidadeDiarias ?? ''),
      String(a.valorFinal ?? ''), situacaoBadge(a).label,
    ])
    const csv = [head, ...linhas].map(l => l.map(c => `"${c}"`).join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'historico-alugueis.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Filtrar por:</span>
        <Select value={mes} onValueChange={setMes}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os meses</SelectItem>
            {meses.map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="ATIVO">Ativo</SelectItem>
            <SelectItem value="RESERVADO">Reservado</SelectItem>
            <SelectItem value="ENCERRADO">Encerrado</SelectItem>
            <SelectItem value="CANCELADO">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={quartoFiltro} onValueChange={setQuartoFiltro}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os quartos</SelectItem>
            {quartos.map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input className="w-48" placeholder="Buscar cliente..." value={busca} onChange={e => setBusca(e.target.value)} />
        <Button variant="outline" className="ml-auto" onClick={exportarCSV}>
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total de Aluguéis" value={String(filtrados.length)} />
        <Stat label="Receita Total" value={brl(receita)} />
        <Stat label="Diárias Totais" value={String(diarias)} />
        <Stat label="Clientes Únicos" value={String(clientesUnicos)} />
      </div>

      {/* Tabela */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Quarto</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Saída</TableHead>
              <TableHead>Diárias</TableHead>
              <TableHead>Valor Final</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum aluguel encontrado</TableCell></TableRow>
            )}
            {filtrados.map(a => {
              const badge = situacaoBadge(a)
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.cliente?.nome ?? '—'}</TableCell>
                  <TableCell>{a.quarto ? identificacaoQuarto(a.quarto) : '—'}</TableCell>
                  <TableCell>{fmt(a.dataEntrada)}</TableCell>
                  <TableCell>{fmt(a.dataSaida)}</TableCell>
                  <TableCell>{a.quantidadeDiarias}</TableCell>
                  <TableCell>{brl(a.valorFinal)}</TableCell>
                  <TableCell><Badge variant={badge.variant}>{badge.label}</Badge></TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

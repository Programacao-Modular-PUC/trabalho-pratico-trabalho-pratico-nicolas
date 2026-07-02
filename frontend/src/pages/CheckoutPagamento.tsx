import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QrCode, CreditCard, Banknote, CheckCircle2, Copy, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, Aluguel } from '@/services/api'
import { identificacaoQuarto, tipoLabel, brl } from '@/lib/quarto'

type Metodo = 'PIX' | 'CARTAO' | 'DINHEIRO'
const fmt = (s?: string) => (s ? new Date(s).toLocaleString('pt-BR') : '—')
const PIX_CODE = '00020126BR.GOV.BCB.PIX-HOSPEDAAPP-MARAU-BA5204000053039865802BR6009MARAU-BA62070503***6304AB12'

export default function CheckoutPagamento() {
  const { aluguelId } = useParams<{ aluguelId: string }>()
  const navigate = useNavigate()

  const [aluguel, setAluguel] = useState<Aluguel | null>(null)
  const [metodo, setMetodo] = useState<Metodo>('PIX')
  const [card, setCard] = useState({ numero: '', nome: '', validade: '', cvv: '' })
  const [pago, setPago] = useState(false)
  const [erro, setErro] = useState('')
  const [processando, setProcessando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!aluguelId) return
    api.alugueis.buscar(Number(aluguelId))
      .then(a => { setAluguel(a); if (a.pagamento?.status === 'CONFIRMADO') setPago(true) })
      .catch(() => setErro('Não foi possível carregar a reserva.'))
  }, [aluguelId])

  const pagar = async () => {
    setErro('')
    const pagId = aluguel?.pagamento?.id
    if (!pagId) { setErro('Pagamento não encontrado para esta reserva.'); return }
    if (metodo === 'CARTAO' && (!card.numero || !card.nome || !card.validade || !card.cvv)) {
      setErro('Preencha os dados do cartão.'); return
    }
    setProcessando(true)
    try {
      await api.pagamentos.pagar(pagId, metodo)
      setPago(true)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao processar o pagamento.')
    } finally {
      setProcessando(false)
    }
  }

  if (erro && !aluguel) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/alugueis')}><ArrowLeft className="h-4 w-4" /> Voltar</Button>
        <p className="text-sm text-destructive">{erro}</p>
      </div>
    )
  }
  if (!aluguel) return <p className="text-sm text-muted-foreground py-12 text-center">Carregando reserva...</p>

  const q = aluguel.quarto
  const total = aluguel.valorFinal ?? aluguel.pagamento?.valorPago ?? 0

  // ----- Sucesso -----
  if (pago) {
    return (
      <div className="max-w-md mx-auto py-10 text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Pagamento confirmado!</h1>
        <p className="text-muted-foreground">
          Sua reserva do quarto {q ? identificacaoQuarto(q) : ''} está garantida.
          Total pago: <span className="font-semibold text-foreground">{brl(total)}</span>.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="outline" onClick={() => navigate('/quartos')}>Ver mais quartos</Button>
          <Button onClick={() => navigate('/alugueis')}>Meus aluguéis</Button>
        </div>
      </div>
    )
  }

  const metodos: { id: Metodo; label: string; icon: typeof QrCode; desc: string }[] = [
    { id: 'PIX', label: 'Pix', icon: QrCode, desc: 'Aprovação imediata' },
    { id: 'CARTAO', label: 'Cartão de crédito', icon: CreditCard, desc: 'Visa, Master, Elo' },
    { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote, desc: 'Pagar na recepção' },
  ]

  return (
    <div className="space-y-1">
      <h1 className="text-xl font-bold">Pagamento</h1>
      <p className="text-sm text-muted-foreground mb-4">Escolha como deseja pagar sua reserva</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ----- Métodos ----- */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {metodos.map(m => (
              <button key={m.id} onClick={() => setMetodo(m.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${metodo === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                <m.icon className={`h-5 w-5 mb-2 ${metodo === m.id ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </button>
            ))}
          </div>

          <Card className="p-6">
            {erro && <p className="text-sm text-destructive mb-3">{erro}</p>}

            {metodo === 'PIX' && (
              <div className="flex flex-col items-center text-center space-y-3">
                <p className="font-medium">Escaneie o QR Code para pagar</p>
                <div className="h-44 w-44 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-secondary/40">
                  <QrCode className="h-24 w-24 text-foreground/70" />
                </div>
                <div className="w-full">
                  <Label className="text-xs">Pix copia e cola</Label>
                  <div className="flex gap-2 mt-1">
                    <Input readOnly value={PIX_CODE} className="text-xs" />
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(PIX_CODE); setCopiado(true) }}>
                      <Copy className="h-4 w-4" /> {copiado ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Após pagar no seu banco, confirme abaixo.</p>
              </div>
            )}

            {metodo === 'CARTAO' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Número do cartão</Label>
                  <Input placeholder="0000 0000 0000 0000" value={card.numero}
                    onChange={e => setCard(c => ({ ...c, numero: e.target.value }))} maxLength={19} />
                </div>
                <div className="space-y-1">
                  <Label>Nome impresso no cartão</Label>
                  <Input placeholder="NOME COMPLETO" value={card.nome}
                    onChange={e => setCard(c => ({ ...c, nome: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Validade</Label>
                    <Input placeholder="MM/AA" value={card.validade}
                      onChange={e => setCard(c => ({ ...c, validade: e.target.value }))} maxLength={5} />
                  </div>
                  <div className="space-y-1">
                    <Label>CVV</Label>
                    <Input placeholder="123" value={card.cvv}
                      onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))} maxLength={4} />
                  </div>
                </div>
              </div>
            )}

            {metodo === 'DINHEIRO' && (
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Você optou por <span className="font-medium text-foreground">pagar em dinheiro na recepção</span>.</p>
                <p>Ao confirmar, a reserva é registrada como paga. Apresente-se na recepção com o valor de <span className="font-medium text-foreground">{brl(total)}</span> no check-in.</p>
              </div>
            )}

            <Button className="w-full mt-5" onClick={pagar} disabled={processando}>
              {processando ? 'Processando...' : `Pagar ${brl(total)}`}
            </Button>
          </Card>
        </div>

        {/* ----- Resumo ----- */}
        <div className="lg:col-span-2">
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-semibold">Resumo da reserva</h2>
            {q && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{identificacaoQuarto(q)}</p>
                  <p className="text-xs text-muted-foreground">{tipoLabel[q.tipo ?? '']}</p>
                  {q.residenciaEndereco && <p className="text-xs text-muted-foreground">{q.residenciaEndereco}</p>}
                </div>
              </div>
            )}
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <Linha label="Entrada" valor={fmt(aluguel.dataEntrada)} />
              <Linha label="Saída" valor={fmt(aluguel.dataSaida)} />
              <Linha label="Diárias" valor={`${aluguel.quantidadeDiarias ?? 0}`} />
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-baseline">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold">{brl(total)}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{valor}</span>
    </div>
  )
}

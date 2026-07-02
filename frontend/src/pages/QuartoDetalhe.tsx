import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowLeft, Wind, Waves, MapPin, BedDouble, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { api, Quarto } from '@/services/api'
import { tipoLabel, imagensDoQuarto, brl } from '@/lib/quarto'

export default function QuartoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { auth } = useAuth()

  const [quarto, setQuarto] = useState<Quarto | null>(null)
  const [erro, setErro] = useState('')
  const [idx, setIdx] = useState(0)

  // estado do aluguel
  const [dataEntrada, setDataEntrada] = useState('')
  const [dataSaida, setDataSaida] = useState('')
  const [aluguelErro, setAluguelErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!id) return
    api.quartos.buscar(Number(id))
      .then(q => { setQuarto(q); setIdx(0) })
      .catch(() => setErro('Não foi possível carregar este quarto.'))
  }, [id])

  const imagens = useMemo(() => (quarto ? imagensDoQuarto(quarto) : []), [quarto])
  const podeAlugar = !!auth?.clienteId

  if (erro) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate('/quartos')}><ArrowLeft className="h-4 w-4" /> Voltar</Button>
        <p className="text-sm text-destructive">{erro}</p>
      </div>
    )
  }
  if (!quarto) return <p className="text-sm text-muted-foreground py-12 text-center">Carregando...</p>

  const prev = () => setIdx(i => (i - 1 + imagens.length) % imagens.length)
  const next = () => setIdx(i => (i + 1) % imagens.length)

  const alugar = async () => {
    setAluguelErro('')
    if (!quarto.residenciaId) { setAluguelErro('Quarto sem residência vinculada.'); return }
    if (!dataEntrada || !dataSaida) { setAluguelErro('Informe as datas de entrada e saída.'); return }
    if (new Date(dataSaida) <= new Date(dataEntrada)) { setAluguelErro('A data de saída deve ser posterior à de entrada.'); return }
    setSalvando(true)
    try {
      const aluguel = await api.alugueis.realizar(quarto.residenciaId, quarto.id!, auth!.clienteId!, {
        dataEntrada: dataEntrada + ':00',
        dataSaida: dataSaida + ':00',
      })
      navigate(`/checkout/${aluguel.id}`)
    } catch (e: unknown) {
      setAluguelErro(e instanceof Error ? e.message : 'Erro ao realizar aluguel.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" onClick={() => navigate('/quartos')} className="-ml-2">
        <ArrowLeft className="h-4 w-4" /> Voltar aos quartos
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ----- Carrossel ----- */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-secondary">
            <img src={imagens[idx]} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
            {imagens.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow hover:bg-background">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow hover:bg-background">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-xs">
                  {idx + 1} / {imagens.length}
                </div>
              </>
            )}
          </div>
          {imagens.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagens.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${i === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={url} alt={`Miniatura ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ----- Informações ----- */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">{tipoLabel[quarto.tipo ?? ''] ?? quarto.tipo}</Badge>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BedDouble className="h-6 w-6 text-primary" /> Quarto {tipoLabel[quarto.tipo ?? '']}
            </h1>
            {quarto.residenciaEndereco && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {quarto.residenciaEndereco}
                {quarto.residenciaBairro ? ` — ${quarto.residenciaBairro}` : ''}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{brl(quarto.valorDiaria ?? quarto.valorBase)}</span>
            <span className="text-sm text-muted-foreground">por diária</span>
          </div>

          {/* características */}
          <Card className="p-4 space-y-2 text-sm">
            <Caracteristica label="Valor base" valor={brl(quarto.valorBase)} />
            {quarto.tipo === 'INDIVIDUAL' && <>
              <Caracteristica label="Camas" valor={String(quarto.numeroCamas ?? 1)} />
              <Caracteristica label="Limite de hóspedes" valor={String(quarto.limiteHospedes ?? 1)} />
            </>}
            {quarto.tipo === 'CASAL' && <>
              <Caracteristica label="Tipo de cama" valor={quarto.tipoCama ?? 'Casal'} />
              <Caracteristica label="Berço" valor={quarto.possuiBerco ? 'Sim' : 'Não'} />
            </>}
            {quarto.tipo === 'FAMILIA' && <>
              <Caracteristica label="Capacidade máxima" valor={String(quarto.capacidadeMaxima ?? 0)} />
              <Caracteristica label="Hóspedes" valor={String(quarto.numeroHospedes ?? 0)} />
              <Caracteristica label="Ambientes" valor={String(quarto.quantidadeAmbientes ?? 1)} />
              {quarto.listaCamas && quarto.listaCamas.length > 0 &&
                <Caracteristica label="Camas" valor={quarto.listaCamas.join(', ')} />}
            </>}
          </Card>

          {/* adicionais */}
          <div className="flex flex-wrap gap-2">
            {quarto.possuiArCondicionado && (
              <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                <Wind className="h-3.5 w-3.5" /> Ar-condicionado
              </span>
            )}
            {quarto.possuiHidromassagem && (
              <span className="flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs text-cyan-700">
                <Waves className="h-3.5 w-3.5" /> Hidromassagem
              </span>
            )}
          </div>

          {/* ----- Alugar ----- */}
          {podeAlugar ? (
            <Card className="p-4 space-y-3">
              <p className="font-semibold text-sm">Alugar este quarto</p>
              {aluguelErro && <p className="text-xs text-destructive">{aluguelErro}</p>}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Entrada</Label>
                  <Input type="datetime-local" value={dataEntrada} onChange={e => setDataEntrada(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Saída</Label>
                  <Input type="datetime-local" value={dataSaida} onChange={e => setDataSaida(e.target.value)} />
                </div>
              </div>
              <Button className="w-full" onClick={alugar} disabled={salvando}>
                <Check className="h-4 w-4" /> {salvando ? 'Processando...' : 'Confirmar aluguel'}
              </Button>
            </Card>
          ) : (
            <p className="text-xs text-muted-foreground">Entre como cliente para alugar este quarto.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Caracteristica({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{valor}</span>
    </div>
  )
}

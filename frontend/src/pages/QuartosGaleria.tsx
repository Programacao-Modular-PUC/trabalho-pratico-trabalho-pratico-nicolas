import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wind, Waves, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Pagination } from '@/components/Pagination'
import { api, Quarto } from '@/services/api'
import { tipoLabel, imagensDoQuarto, brl, detalhesQuarto } from '@/lib/quarto'

export default function QuartosGaleria() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Quarto[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [loading, setLoading] = useState(true)

  const load = (tipo?: string, p = 0) => {
    setLoading(true)
    api.quartos.listar(tipo, p, 9).then(res => {
      setItems(res.content); setPage(res.page); setTotalPages(res.totalPages); setTotalElements(res.totalElements)
    }).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const onFiltro = (v: string) => {
    const tipo = v === 'TODOS' ? undefined : v
    setFiltroTipo(v === 'TODOS' ? '' : v)
    load(tipo, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label className="whitespace-nowrap">Filtrar por tipo:</Label>
        <Select value={filtroTipo || 'TODOS'} onValueChange={onFiltro}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os quartos</SelectItem>
            <SelectItem value="INDIVIDUAL">Individual</SelectItem>
            <SelectItem value="CASAL">Casal</SelectItem>
            <SelectItem value="FAMILIA">Família</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-12 text-center">Carregando quartos...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">Nenhum quarto disponível.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(q => {
            const capa = imagensDoQuarto(q)[0]
            return (
              <button
                key={q.id}
                onClick={() => navigate(`/quartos/${q.id}`)}
                className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={capa}
                    alt={`Quarto ${tipoLabel[q.tipo ?? '']}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge variant="secondary" className="absolute top-2 left-2 shadow-sm">
                    {tipoLabel[q.tipo ?? ''] ?? q.tipo}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  {q.residenciaBairro && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {q.residenciaBairro}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">{detalhesQuarto(q)}</p>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-lg font-bold">{brl(q.valorDiaria ?? q.valorBase)}</span>
                      <span className="text-xs text-muted-foreground"> /diária</span>
                    </div>
                    <div className="flex gap-1.5">
                      {q.possuiArCondicionado && <Wind className="h-4 w-4 text-blue-500" />}
                      {q.possuiHidromassagem && <Waves className="h-4 w-4 text-cyan-500" />}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={p => load(filtroTipo || undefined, p)} />
    </div>
  )
}

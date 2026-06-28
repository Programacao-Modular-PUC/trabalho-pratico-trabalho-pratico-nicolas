const BASE = '/api'

function getToken(): string | null {
  try {
    const saved = localStorage.getItem('auth')
    return saved ? JSON.parse(saved).token : null
  } catch {
    return null
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })

  // Token expirado ou sem permissão — deslogar e redirecionar
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('auth')
    window.location.href = '/login'
    throw new Error(res.status === 401 ? 'Sessão expirada. Faça login novamente.' : 'Acesso negado.')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ erro: res.statusText }))
    throw new Error(err.erro ?? 'Erro na requisição')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ---------- Types ----------
export interface PageResponse<T> {
  content: T[]
  page: number
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
}

export interface Residencia {
  id?: number
  endereco: string
  numero: string
  bairro: string
  cep: string
  telefone: string
  email: string
  quartos?: Quarto[]
}

export interface Quarto {
  id?: number
  tipo?: 'INDIVIDUAL' | 'CASAL' | 'FAMILIA'
  valorBase: number
  valorDiaria?: number
  possuiArCondicionado: boolean
  possuiHidromassagem: boolean
  status?: 'DISPONIVEL' | 'MANUTENCAO'
  statusAtual?: 'DISPONIVEL' | 'OCUPADO' | 'MANUTENCAO'
  imagens?: string[]
  residenciaId?: number
  residenciaEndereco?: string
  residenciaBairro?: string
  // Individual
  numeroCamas?: number
  limiteHospedes?: number
  // Casal
  tipoCama?: 'CASAL' | 'QUEEN' | 'KING'
  possuiBerco?: boolean
  // Familia
  capacidadeMaxima?: number
  quantidadeAmbientes?: number
  numeroHospedes?: number
  listaCamas?: string[]
}

export interface Cliente {
  id?: number
  nome: string
  sobrenome?: string
  cpf: string
  endereco: string
  cep?: string
  telefone: string
  email: string
  dataNascimento?: string
}

export interface Aluguel {
  id?: number
  quarto?: Quarto
  cliente?: Cliente
  dataEntrada: string
  dataSaida: string
  quantidadeDiarias?: number
  valorFinal?: number
  status?: 'ATIVO' | 'CANCELADO'
  situacao?: 'RESERVADO' | 'ATIVO' | 'ENCERRADO' | 'CANCELADO'
  pagamento?: Pagamento
}

export interface DisponibilidadeDia {
  dia: string
  status: 'DISPONIVEL' | 'OCUPADO' | 'RESERVADO' | 'MANUTENCAO'
}

export interface DisponibilidadeQuarto {
  quartoId: number
  tipo: 'INDIVIDUAL' | 'CASAL' | 'FAMILIA'
  status: 'DISPONIVEL' | 'MANUTENCAO'
  dias: DisponibilidadeDia[]
}

export interface Pagamento {
  id?: number
  aluguelId?: number
  clienteNome?: string
  valorPago: number
  dataPagamento?: string
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO'
  formaPagamento?: 'PIX' | 'CARTAO' | 'DINHEIRO'
}

export interface AuthResponse {
  token: string
  username: string
  role: string
  clienteId?: number
}

// ---------- API ----------
export const api = {
  auth: {
    login: (data: { username: string; password: string }) =>
      request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    registro: (data: {
      username: string; password: string;
      nome: string; sobrenome: string; cpf: string;
      email: string; telefone: string; endereco: string;
      cep: string; dataNascimento: string;
    }) => request<AuthResponse>('/auth/registro', { method: 'POST', body: JSON.stringify(data) }),
  },
  residencias: {
    listar: () => request<Residencia[]>('/residencias'),
    buscar: (id: number) => request<Residencia>(`/residencias/${id}`),
    criar: (data: Residencia) => request<Residencia>('/residencias', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id: number, data: Residencia) => request<Residencia>(`/residencias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletar: (id: number) => request<void>(`/residencias/${id}`, { method: 'DELETE' }),
    historico: (id: number) => request<Aluguel[]>(`/residencias/${id}/historico`),
  },
  quartos: {
    listar: (tipo?: string, page = 0, size = 10) => {
      const params = new URLSearchParams({ page: String(page), size: String(size) })
      if (tipo) params.set('tipo', tipo)
      return request<PageResponse<Quarto>>(`/quartos?${params}`)
    },
    listarPorResidencia: (residenciaId: number) => request<Quarto[]>(`/quartos/residencia/${residenciaId}`),
    buscar: (id: number) => request<Quarto>(`/quartos/${id}`),
    disponibilidade: (inicio: string, fim: string) =>
      request<DisponibilidadeQuarto[]>(`/quartos/disponibilidade?inicio=${inicio}&fim=${fim}`),
    alterarStatus: (id: number, valor: 'DISPONIVEL' | 'MANUTENCAO') =>
      request<Quarto>(`/quartos/${id}/status?valor=${valor}`, { method: 'PATCH' }),
    criarIndividual: (residenciaId: number, data: Quarto) =>
      request<Quarto>(`/quartos/individual/${residenciaId}`, { method: 'POST', body: JSON.stringify(data) }),
    criarCasal: (residenciaId: number, data: Quarto) =>
      request<Quarto>(`/quartos/casal/${residenciaId}`, { method: 'POST', body: JSON.stringify(data) }),
    criarFamilia: (residenciaId: number, data: Quarto) =>
      request<Quarto>(`/quartos/familia/${residenciaId}`, { method: 'POST', body: JSON.stringify(data) }),
    deletar: (id: number) => request<void>(`/quartos/${id}`, { method: 'DELETE' }),
  },
  clientes: {
    listar: (page = 0, size = 10) => request<PageResponse<Cliente>>(`/clientes?page=${page}&size=${size}`),
    buscar: (id: number) => request<Cliente>(`/clientes/${id}`),
    criar: (data: Cliente) => request<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(data) }),
    atualizar: (id: number, data: Cliente) => request<Cliente>(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletar: (id: number) => request<void>(`/clientes/${id}`, { method: 'DELETE' }),
  },
  alugueis: {
    listar: (page = 0, size = 10) => request<PageResponse<Aluguel>>(`/alugueis?page=${page}&size=${size}`),
    buscar: (id: number) => request<Aluguel>(`/alugueis/${id}`),
    listarPorCliente: (clienteId: number, page = 0, size = 10) =>
      request<PageResponse<Aluguel>>(`/alugueis/cliente/${clienteId}?page=${page}&size=${size}`),
    realizar: (residenciaId: number, quartoId: number, clienteId: number, data: Pick<Aluguel, 'dataEntrada' | 'dataSaida'>) =>
      request<Aluguel>(`/alugueis/residencia/${residenciaId}/quarto/${quartoId}/cliente/${clienteId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    cancelar: (id: number) => request<Aluguel>(`/alugueis/${id}/cancelar`, { method: 'PATCH' }),
  },
  pagamentos: {
    listar: (page = 0, size = 10) => request<PageResponse<Pagamento>>(`/pagamentos?page=${page}&size=${size}`),
    buscar: (id: number) => request<Pagamento>(`/pagamentos/${id}`),
    confirmar: (id: number) => request<Pagamento>(`/pagamentos/${id}/confirmar`, { method: 'PATCH' }),
    pagar: (id: number, forma: 'PIX' | 'CARTAO' | 'DINHEIRO') =>
      request<Pagamento>(`/pagamentos/${id}/pagar?forma=${forma}`, { method: 'PATCH' }),
  },
}

# Sistema de Hospedagem — Maraú/BA

Trabalho Prático da disciplina de **Programação Modular** — Bacharelado em Engenharia de Software, PUC Minas.

Sistema de gerenciamento de hospedagens para a região de Maraú (BA), onde moradores
locais oferecem quartos em suas residências. O projeto contempla modelagem orientada a
objetos, arquitetura em camadas, API REST com Spring Boot, persistência em MySQL, testes
automatizados e uma interface web completa.

- **Aluno:** Nicolas Kiffer de Oliveira Soares
- **Stack:** Spring Boot (backend) + React/TypeScript (frontend) + MySQL

---

## Sumário

- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Modelo de domínio](#modelo-de-domínio)
- [Regras de negócio](#regras-de-negócio)
- [Como executar](#como-executar)
- [Usuários padrão](#usuários-padrão)
- [Dados de simulação (seed)](#dados-de-simulação-seed)
- [Principais endpoints](#principais-endpoints)
- [Testes](#testes)
- [Padrões de projeto](#padrões-de-projeto)
- [Estrutura do projeto](#estrutura-do-projeto)

---

## Arquitetura

O sistema segue **arquitetura em camadas** no backend e consome a API por um frontend SPA:

```
Frontend (React/Vite :5173)  ──HTTP/JSON (Bearer JWT)──►  API REST (Spring Boot :8080)
                                                              │
                                          Controller → Service → Repository → Model
                                                              │
                                                        MySQL (:3306)
```

- **Controller** — expõe os endpoints REST e a autorização por papel.
- **Service** — regras de negócio (cálculo de diárias, disponibilidade, pagamentos).
- **Repository** — acesso a dados via Spring Data JPA.
- **Model** — entidades de domínio com as regras de cálculo encapsuladas.

## Tecnologias

**Backend**
- Java 21, Spring Boot 3.4.5, Maven
- Spring Web, Spring Data JPA / Hibernate
- Spring Security + JWT (JJWT 0.12.3)
- MySQL (produção) e H2 (testes)
- Lombok, Jackson (+ módulo Hibernate6)
- JUnit 5 / Mockito / MockMvc

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix UI)
- React Router v6

## Funcionalidades

- **Autenticação e autorização** com JWT e dois papéis: `ADMIN` e `CLIENTE`
- **Residências** — CRUD com busca e contagem de quartos
- **Quartos** — três tipos (Individual, Casal, Família) com galeria de fotos e status (Disponível/Ocupado/Manutenção)
- **Clientes** — cadastro completo (com auto-preenchimento de endereço via ViaCEP)
- **Aluguéis** — realização com cálculo automático de diárias e valor, cancelamento e situação derivada (Reservado/Ativo/Encerrado/Cancelado)
- **Pagamentos** — checkout estilo Airbnb (Pix, Cartão, Dinheiro); o cliente paga o próprio aluguel, o admin acompanha; recibo
- **Disponibilidade** — grade de ocupação quarto × dia por período
- **Histórico** — filtros por mês/status/quarto/cliente e exportação CSV
- **Dashboard** — visão geral com métricas

> Observação: o frontend, a autenticação e o checkout são **extras** — o escopo
> obrigatório do TP é a API REST + modelo + testes.

## Modelo de domínio

A hierarquia de quartos usa **herança JOINED** (uma tabela base + tabelas filhas):

| Tipo | Regras de cálculo da diária |
|------|------------------------------|
| **Individual** | valor base + adicional por cama (1 cama = só base); sem berço |
| **Casal** | adicional por tipo de cama (Casal vs Queen/King) + adicional opcional de berço |
| **Família** | percentual sobre o base proporcional ao nº de hóspedes + desconto progressivo para grupos |

Atributos comuns a todos os quartos: `id`, `valorBase`, `possuiArCondicionado`, `possuiHidromassagem`.
Adicionais de ar-condicionado e hidromassagem somam um valor fixo à diária.

## Regras de negócio

1. **Diárias iniciam às 12h.** Saída após as 12h adiciona uma diária; o mínimo é 1 diária.
2. O **valor da diária não é informado** — é calculado (valor base + tipo + adicionais).
3. Um quarto **não pode ser alugado se já estiver ocupado** no período.
4. É possível realizar **reservas futuras**.
5. Todo **aluguel gera um pagamento** associado (inicialmente pendente).
6. O **formulário de aluguel** é exibido com data de entrada/saída, número de diárias e total a pagar.

## Como executar

### Pré-requisitos
- Java 21+ e Maven (o projeto inclui o wrapper `mvnw`)
- Node.js 18+ e npm
- MySQL 8 em execução (`localhost:3306`, usuário `root` sem senha por padrão)

> O banco `hospedagem` é criado automaticamente (`createDatabaseIfNotExist=true`) e o
> schema é gerado/atualizado pelo Hibernate (`ddl-auto=update`).

### Backend

```bash
cd backend/hospedagem
./mvnw spring-boot:run        # Windows: .\mvnw.cmd spring-boot:run
```
A API sobe em `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```
A aplicação abre em `http://localhost:5173` (as chamadas `/api` são encaminhadas para a porta 8080).

## Usuários padrão

Criados automaticamente na primeira execução (classe `DataInitializer`):

| Usuário    | Senha       | Papel         |
|------------|-------------|---------------|
| `admin`    | `admin123`  | ADMIN         |
| `cliente`  | `cliente123`| CLIENTE       |

Novos clientes podem se cadastrar pela tela de cadastro (cria `Cliente` + `Usuario` vinculados).

## Dados de simulação (seed)

Para popular o sistema com dados de exemplo (5 clientes, 15 residências, 15 quartos,
aluguéis e pagamentos), execute os scripts no MySQL Workbench/DBeaver:

```
backend/hospedagem/seed_simulacao.sql   # clientes, residências, quartos, aluguéis, pagamentos
backend/hospedagem/seed_imagens.sql     # fotos dos quartos (rode após o backend criar a tabela quarto_imagens)
```
Os 5 clientes do seed têm login `cliente1`…`cliente5` com senha `senha123`.

## Principais endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Autenticação (retorna JWT) |
| POST | `/auth/registro` | Cadastro de cliente |
| GET/POST/PUT/DELETE | `/residencias` | CRUD de residências |
| GET/POST/DELETE | `/quartos` | Quartos (com filtro por tipo e paginação) |
| GET | `/quartos/disponibilidade?inicio=&fim=` | Grade de ocupação no período |
| PATCH | `/quartos/{id}/status` | Alterna manutenção/disponível |
| GET/POST/PUT/DELETE | `/clientes` | CRUD de clientes |
| GET | `/alugueis` · `/alugueis/cliente/{id}` | Lista (todos / por cliente) |
| POST | `/alugueis/residencia/{r}/quarto/{q}/cliente/{c}` | Realiza aluguel |
| PATCH | `/alugueis/{id}/cancelar` | Cancela aluguel |
| GET | `/pagamentos` | Lista de pagamentos |
| PATCH | `/pagamentos/{id}/pagar?forma=` | Cliente paga (PIX/CARTAO/DINHEIRO) |
| PATCH | `/pagamentos/{id}/confirmar` | Admin confirma recebimento |

Todos os endpoints (exceto `/auth/**`) exigem o header `Authorization: Bearer <token>`.

## Testes

São **39 testes automatizados** (unitários com Mockito e de integração com H2 + MockMvc),
cobrindo cálculo de diárias por tipo, regras de berço, limites de hóspedes,
disponibilidade, exceções personalizadas e segurança da API.

```bash
cd backend/hospedagem
./mvnw test
```

Há também um **relatório HTML** pronto em `docs/relatorio-testes-junit.html`.

## Padrões de projeto

- **MVC / Camadas** — separação Controller / Service / Repository / Model.
- **Template Method** — `Quarto.calcularValorDiaria()` é abstrato e cada subtipo
  implementa sua própria fórmula.
- **Repository** — abstração de persistência via Spring Data JPA.
- **DTO** — objetos de transferência (`PageResponse`, `DisponibilidadeQuarto`, etc.)
  desacoplam a API das entidades.
- **Tratamento centralizado de exceções** — `@RestControllerAdvice` com exceções
  personalizadas (`QuartoIndisponivelException`, `CapacidadeExcedidaException`,
  `DataInvalidaException`, `RecursoNaoPermitidoException`).

## Estrutura do projeto

```
.
├── backend/hospedagem/        # API REST (Spring Boot)
│   ├── src/main/java/.../      
│   │   ├── controller/         # endpoints REST
│   │   ├── service/            # regras de negócio
│   │   ├── repository/         # acesso a dados (Spring Data JPA)
│   │   ├── model/              # entidades de domínio
│   │   ├── dto/                # objetos de transferência
│   │   ├── security/           # JWT, filtro e configuração
│   │   ├── exception/          # exceções personalizadas + handler global
│   │   └── config/             # inicialização e beans
│   ├── src/test/java/...       # testes JUnit
│   ├── seed_simulacao.sql      # dados de exemplo
│   └── seed_imagens.sql        # fotos dos quartos
├── frontend/                   # SPA (React + Vite + Tailwind)
│   └── src/
│       ├── pages/              # telas
│       ├── components/         # componentes reutilizáveis + UI (shadcn)
│       ├── contexts/           # autenticação
│       ├── services/           # cliente da API
│       └── lib/                # utilidades de domínio
└── docs/                       # protótipos, diagrama de classes, cartões CRC, relatório de testes
```

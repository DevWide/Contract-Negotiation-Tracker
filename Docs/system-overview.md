# Visão Geral do Sistema — Contract Negotiation Tracker

## 1. O que é?

O **Contract Negotiation Tracker** é uma SPA (Single Page Application) client-side desenvolvida para profissionais jurídicos, equipes de procurement e negociadores comerciais. Permite o acompanhamento cláusula por cláusula de negociações de contratos em múltiplas rodadas, com histórico completo de versões e comparação visual de diferenças.

> ⚠️ Protótipo inicial — destinado a demonstração e experimentação com dados sintéticos/fictícios apenas.

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite |
| Estilização | Tailwind CSS + Radix UI |
| Gerenciamento de Estado | React Context + custom hooks |
| Persistência | localStorage do browser (sem backend) |
| Parsing de Documentos | JSZip (DOCX), PDF.js (PDF) |
| Gráficos | Recharts |
| Animações | Framer Motion |
| Ícones | Lucide React |
| Gerenciador de Pacotes | pnpm 10.4.1+ (obrigatório) |

---

## 3. Arquitetura

```
negotiation-tracker/
├── client/                    # SPA Frontend
│   ├── src/
│   │   ├── components/        # Componentes de UI
│   │   │   ├── ui/            # Primitivos base (shadcn/ui)
│   │   │   └── onboarding/    # Componentes de onboarding
│   │   ├── contexts/          # Providers de contexto React
│   │   ├── hooks/             # Hooks customizados
│   │   ├── lib/               # Funções utilitárias
│   │   ├── pages/             # Componentes de página
│   │   ├── types/             # Definições de tipos TypeScript
│   │   └── data/              # Dados de exemplo/seed
│   └── public/                # Assets estáticos
├── server/                    # Servidor Express (opcional)
├── shared/                    # Constantes compartilhadas
└── Docs/                      # Documentação
```

---

## 4. Módulos Principais

### 4.1 Gestão de Contratos
- Criar, editar e deletar contratos
- Campos: Nome, Contraparte, Descrição, Fonte do Documento (Nosso Papel / Papel da Contraparte)
- Rastreamento de ball-in-court: indica qual parte precisa agir ("Ball with Us" / "Ball with Them")
- Suporte a múltiplos contratos com seletor no header

### 4.2 Gestão de Cláusulas — Modelo de 3 Textos

Cada cláusula rastreia **três versões simultâneas**:

| Versão | Descrição |
|---|---|
| **Nosso Template** | Ponto de partida original (template ou primeiro rascunho) |
| **Markup Deles** | Texto proposto atual pela contraparte |
| **Nossa Resposta** | Nossa proposta de resposta atual |

Metadados adicionais: Status, Prioridade, Responsável, Nível de Risco, Categoria de Impacto, Número da Cláusula, Tópico, Resumo do Problema.

**Valores de Status:** `Sem Alterações` · `Em Discussão` · `Acordado` · `Escalado` · `Bloqueado`

### 4.3 Comparação Visual e Diff
- Visualizações lado a lado e inline
- Três pares de comparação: Baseline ↔ Deles · Deles ↔ Nosso · Baseline ↔ Nosso
- Estatísticas de diff no nível de palavras (adicionadas/removidas/alteradas)
- Modo de tela cheia

### 4.4 Negociação Multi-Rodada
- Snapshots de versão por cláusula por rodada
- Atribuição de parte (Nosso Counter / Proposta Deles)
- Restauração de versão (rollback para qualquer estado anterior)

### 4.5 Playbook
- Posições pré-definidas para tipos comuns de cláusulas
- Estratégias de fallback e linhas vermelhas
- Rastreamento de objeções da contraparte
- Linkável a partir do menu de contexto da cláusula
- Busca por texto completo

### 4.6 Templates
- Templates reutilizáveis com cláusulas pré-definidas
- Importação de DOCX, PDF ou TXT
- Detecção automática de cláusulas
- Criação de contratos baseada em templates

### 4.7 Dashboard e Analytics
- Distribuição de status das cláusulas
- Barra de progresso de conclusão
- Gráfico donut de distribuição por prioridade
- Cards clicáveis filtram a tabela de cláusulas

### 4.8 Timeline
- Log de eventos do ciclo de vida da negociação
- Tipos de evento: Criado · Enviado · Recebido · Revisão · Escalado · Assinado
- Notas por evento
- Visualização horizontal da timeline

---

## 5. Persistência (chaves do localStorage)

| Chave | Dados |
|---|---|
| `negotiation-tracker-contracts` | Todos os contratos e suas cláusulas |
| `negotiation-tracker-templates` | Templates salvos |
| `negotiation-tracker-playbook` | Tópicos do playbook |
| `negotiation-tracker-columns` | Configuração de colunas |
| `negotiation-tracker-impact-categories` | Categorias de impacto customizadas |

> Para resetar todos os dados: DevTools → Application → Local Storage → Clear All

---

## 6. Fluxos Principais

### Fluxo 1 — Criar um Contrato
`Dropdown do header → New Contract → Preencher detalhes → Create Contract`

### Fluxo 2 — Adicionar e Editar Cláusulas
`Add Clause → Preencher modelo de 3 textos → Definir metadados → Save → Edição inline`

### Fluxo 3 — Comparar Versões
`Linha da cláusula → Ícone de comparação (↔) → Selecionar par de comparação → Alternar modo de visualização`

### Fluxo 4 — Gerenciar Rodadas de Negociação
`Modal de comparação → Aba Version History → Salvar versão → Restaurar versão`

### Fluxo 5 — Usar o Playbook
`Expandir painel Playbook → Buscar tópico → Ver orientação → Linkar à cláusula`

### Fluxo 6 — Criar e Aplicar Template
`Avatar → Templates → Criar / Importar → Aplicar ao criar novo contrato`

### Fluxo 7 — Rastrear Eventos da Timeline
`Expandir Timeline → Add Event → Preencher tipo + notas → Revisar histórico`

### Fluxo 8 — Filtragem pelo Dashboard
`Clique em card do dashboard → Tabela de cláusulas filtra pelo status selecionado`

---

## 7. Riscos e Pontos de Atenção

| Área | Risco |
|---|---|
| Persistência apenas em localStorage | Dados perdidos ao limpar o browser; sem sincronização entre dispositivos |
| Sem autenticação | Sem isolamento de usuários; todos os dados compartilhados no mesmo browser |
| Sem validação de backend | Toda a validação é client-side |
| Importação DOCX/PDF | Qualidade do parser depende da estrutura do documento |
| Disclaimer de protótipo | Não está pronto para produção; sem garantias de segurança |
| pnpm 10.4.1+ obrigatório | Instalação falha silenciosamente no pnpm 8/9 |
| Modal de onboarding | Reaparece toda vez que o localStorage é limpo — impacta automação |
| Ausência de data-testid | Elementos duplicados causam violações de modo estrito no Playwright |
# Plano de Testes — Contract Negotiation Tracker

**Projeto:** Contract Negotiation Tracker  
**Preparado por:** Rafael Barbosa  
**Data:** Abril 2026  
**Ferramenta:** Playwright (E2E)  
**Ambiente:** localhost:3000 (pnpm dev)

---

## 1. Escopo

Este plano de testes cobre os testes funcionais end-to-end do Contract Negotiation Tracker. Como a aplicação não possui backend, o escopo de testes foca em:

- Interações de UI e fluxos de usuário
- Gerenciamento e persistência do estado no localStorage
- Integridade dos dados entre operações (criar, editar, deletar)
- Funcionalidades de comparação visual e diff
- Integração entre módulos (ex: filtros do dashboard refletindo estados das cláusulas)

**Fora do escopo (v1):**
- Testes de performance/carga
- Auditoria de acessibilidade (WCAG)
- Testes mobile/responsivo
- Edge cases de importação DOCX/PDF

---

## 2. Estratégia de Testes

### 2.1 Abordagem

Dado que a arquitetura é localStorage-only, o risco principal é a **corrupção de estado** — dados que não persistem corretamente, estado que vaza entre contratos, ou UI que diverge dos dados armazenados. A suite de testes prioriza:

1. **Fluxos happy path** — jornadas principais do usuário devem funcionar end-to-end
2. **Persistência de estado** — dados sobrevivem ao reload da página
3. **Isolamento de estado** — limpar o storage reseta o app para estado vazio
4. **Consistência UI ↔ Dados** — contadores do dashboard refletem status reais das cláusulas
5. **Edge cases** — estados vazios, textos longos, caracteres especiais

### 2.2 Estratégia de Isolamento de Testes

Cada suite limpa o localStorage antes da execução via `page.evaluate(() => localStorage.clear())` + reload da página. Isso garante independência entre os testes sem necessidade de teardown de banco de dados.

### 2.3 Ferramentas

| Ferramenta | Propósito |
|---|---|
| Playwright | Automação de browser E2E |
| Page Object Model | Camada de abstração para seletores de UI |
| Playwright Fixtures | Setup/teardown do localStorage |
| GitHub Actions | Execução em CI a cada push |

---

## 3. Suites de Testes

### Suite 01 — Contract CRUD (`01-contract-crud.spec.ts`)

**Prioridade:** Crítica

| ID | Caso de Teste | Tipo |
|---|---|---|
| TC-01 | Criar novo contrato com todos os campos obrigatórios | Happy path |
| TC-03 | Contrato aparece no dropdown do header após criação | Integração |
| TC-06 | Dados do contrato persistem após reload da página | Persistência |
| TC-08 | Switch de ball-in-court alterna entre "Ball with Us" e "Ball with Them" | Happy path |
| TC-08b | Estado do ball-in-court persiste após reload | Persistência |
| TC-09 | Alternar entre contratos carrega os dados corretos | Isolamento |
| TC-44 | Chave localStorage é populada ao carregar o app | Técnico |

---

### Suite 02 — Gestão de Cláusulas (`02-clause-management.spec.ts`)

**Prioridade:** Crítica

| ID | Caso de Teste | Tipo |
|---|---|---|
| TC-10 | Adicionar cláusula com os três campos de texto preenchidos | Happy path |
| TC-12 | Cláusula aparece na tabela após criação | Happy path |
| TC-16 | Dados da cláusula persistem após reload da página | Persistência |
| TC-17 | Formulário fecha após criação bem-sucedida de cláusula | UX |
| TC-18 | Atalho Ctrl+N abre o formulário de nova cláusula | UX |
| TC-19 | Busca filtra a tabela de cláusulas por texto | Funcional |
| TC-19b | Limpar busca restaura a lista completa de cláusulas | Funcional |

---

### Suite 06 — Persistência localStorage (`06-persistence.spec.ts`)

**Prioridade:** Crítica

| ID | Caso de Teste | Tipo |
|---|---|---|
| TC-42 | Contratos demo presentes no carregamento inicial | Persistência |
| TC-43 | Cláusula criada pelo usuário persiste após reload | Persistência |
| TC-44 | Chave negotiation-tracker-contracts existe no localStorage | Técnico |
| TC-44b | Dados do localStorage têm estrutura JSON válida | Técnico |
| TC-46 | Múltiplas cláusulas persistem após reload | Persistência |
| TC-47 | Estado do ball-in-court persiste após reload | Persistência |

---

## 4. Priorização por Risco

| Risco | Impacto | Probabilidade | Prioridade |
|---|---|---|---|
| Perda de dados no localStorage ao limpar browser | Alto | Alto | P1 |
| Contadores do dashboard fora de sincronia com cláusulas | Alto | Médio | P1 |
| Dados do modelo de 3 textos não salvos corretamente | Alto | Baixo | P1 |
| Restauração de versão sobrescrevendo cláusula errada | Alto | Baixo | P1 |
| Modal de comparação mostrando par de diff incorreto | Médio | Médio | P2 |
| Edição inline não persistindo | Médio | Médio | P2 |
| Falha no parsing de importação de template | Baixo | Médio | P3 |

---

## 5. Critérios de Entrada e Saída

**Critérios de entrada:**
- Aplicação rodando localmente em `http://localhost:3000`
- `pnpm dev` inicia sem erros
- Playwright instalado e configurado

**Critérios de saída:**
- Suites 01, 02 e 06 passando (prioridade crítica)
- Nenhum bug P1 em aberto
- Todos os testes de persistência verdes

---

## 6. Ambiente de Testes

- SO:          macOS (Apple Silicon M4)
- Node:        22.x
- pnpm:        10.4.1
- Browser:     Chromium (padrão Playwright)
- Base URL:    http://localhost:3000
- CI:          GitHub Actions (ubuntu-latest)

---

## 7. Itens Fora do Escopo (Trabalho Futuro)

- Automação de CRUD do Playbook
- E2E de importação de templates (DOCX/PDF)
- Gerenciamento de Configurações / Categorias de Impacto
- Validação de importação/exportação CSV
- Regressão visual do modo escuro
- Cobertura completa de navegação por teclado
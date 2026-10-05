# Tasks: Flujo de pedido cliente

**Input**: Design documents from `/specs/20261002-233116-cliente-pedido-flujo/`
- plan.md (required), spec.md (required for user stories)
- research.md, data-model.md, contracts/api-gateway.json, quickstart.md
- constitution.md (v1.0.0)

**Prerequisites**: plan.md, spec.md  
**Tests**: OPTIONAL per spec; we will include component/integration tests (Vitest + RTL).  
**Organization**: Tasks grouped by user story (P1..P2) for independent delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1..US6 mapping to spec user stories
- Exact file paths included

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project init + tooling (Vite React TS, Vitest, RTL, axios, router)

- [ ] T001 Create Vite React + TS project structure (if missing) per plan; verify `package.json`, `tsconfig*.json`, `vite.config.ts`
- [ ] T002 Install dependencies: `axios`, `react-router-dom@6`. Dev deps: `vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `@types/node`
- [ ] T003 [P] Configure Vitest in `vite.config.ts` (jsdom, globals optional)
- [ ] T004 [P] Add `.env.example` with `VITE_API_URL=http://localhost:8080`
- [ ] T005 [P] Setup lint/format base (eslint/prettier if present; else document)

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infra used by all stories

- [ ] T006 Create API client with interceptor in `src/services/api.ts` (axios instance, baseURL from `VITE_API_URL`, request interceptor adds `Authorization: Bearer {token}` only when token exists; response interceptor normalizes uniform error `{error,codigo,timestamp}`)
- [ ] T007 [P] Create Auth types and context in `src/types/auth.ts`, `src/contexts/AuthContext.tsx` (token/rol/usuarioId, login/logout, isAuthenticated, localStorage persistence)
- [ ] T008 [P] Create types: `src/types/plato.ts`, `src/types/pedido.ts`, `src/types/pago.ts`
- [ ] T009 [P] Create error utils in `src/utils/errors.ts` (map uniform error to user message español)
- [ ] T010 Create router + app shell in `src/App.tsx`, `src/main.tsx` with routes Login/Menu/Carrito/Pedido/Pago and protected routes
- [ ] T011 [P] Create carrito hook/context in `src/hooks/useCarrito.ts` (add/update/remove/clear, total calculado, items)

**Checkpoint**: Foundation ready

## Phase 3: User Story 1 - Iniciar sesión (Priority: P1) [US1]

**Goal**: Login contra gateway, guardar token.  
**Independent Test**: Login exitoso/fallido, token guardado, header añadido.

### Tests (optional but recommended)
- [ ] T012 [P] [US1] Component test Login in `src/components/Login/Login.test.tsx` (éxito/fracaso, español)

### Implementation
- [ ] T013 [P] [US1] Auth service in `src/services/auth.ts` (POST `/usuarios/login`)
- [ ] T014 [US1] Login component in `src/components/Login/Login.tsx` (form correo/contraseña)
- [ ] T015 [US1] Integrar login con AuthContext + redirección post-login

**Checkpoint**: US1 independiente

## Phase 4: User Story 2 - Ver menú público (Priority: P1) [US2]

**Goal**: Menú público (sin login) desde gateway.  
**Independent Test**: Carga pública, muestra categoría/nombre/descripción/precio.

### Tests
- [ ] T016 [P] [US2] Component test Menu in `src/components/Menu/Menu.test.tsx`

### Implementation
- [ ] T017 [P] [US2] Platos service in `src/services/platos.ts` (GET `/platos`, GET `/categorias`)
- [ ] T018 [US2] Menu component in `src/components/Menu/Menu.tsx` (listado + añadir a carrito)

**Checkpoint**: US1+US2 independientes

## Phase 5: User Story 3 - Gestionar carrito local (Priority: P1) [US3]

**Goal**: Carrito local React state (añadir/quitar/cambiar).  
**Independent Test**: Modificar cantidades, cálculo total, carrito vacío bloquea confirmación.

### Tests
- [ ] T019 [P] [US3] Hook test useCarrito in `src/hooks/useCarrito.test.ts`

### Implementation
- [ ] T020 [US3] Carrito component in `src/components/Carrito/Carrito.tsx` (resumen, acciones)

**Checkpoint**: US3 independiente con hooks existentes

## Phase 6: User Story 4 - Crear pedido (Priority: P1) [US4]

**Goal**: POST `/pedidos` con dirección + líneas (requiere auth).  
**Independent Test**: Creación exitosa, validaciones.

### Tests
- [ ] T021 [P] [US4] Integration test pedidos service in `src/services/pedidos.test.ts` (mock axios)
- [ ] T022 [P] [US4] Component test Pedido in `src/components/Pedido/Pedido.test.tsx`

### Implementation
- [ ] T023 [P] [US4] Pedidos service in `src/services/pedidos.ts` (POST `/pedidos`, GET `/pedidos/{id}`)
- [ ] T024 [US4] Pedido component in `src/components/Pedido/Pedido.tsx` (form dirección, confirmar)

**Checkpoint**: US4 funcional

## Phase 7: User Story 5 - Flujo de pago (Priority: P1) [US5]

**Goal**: POST `/pagos` + POST `/pagos/{pagoId}/intentos`, mostrar EXITOSO/FALLIDO.  
**Independent Test**: Flujo completo, selección metodoPago (efectivo/tarjeta).

### Tests
- [ ] T025 [P] [US5] Integration test pagos in `src/services/pagos.test.ts`
- [ ] T026 [P] [US5] Component test Pago in `src/components/Pago/Pago.test.tsx`

### Implementation
- [ ] T027 [P] [US5] Pagos service in `src/services/pagos.ts` (crear pago + procesar intento)
- [ ] T028 [US5] Pago component in `src/components/Pago/Pago.tsx` (selección método, procesar, resultado)

**Checkpoint**: US5 completo

## Phase 8: User Story 6 - Ver estado del pedido (Priority: P2) [US6]

**Goal**: GET `/pedidos/{id}`, mostrar PENDIENTE/CONFIRMADO/CANCELADO.  
**Independent Test**: Consulta estado.

### Tests
- [ ] T029 [P] [US6] Component test estado in `src/components/Pedido/EstadoPedido.test.tsx`

### Implementation
- [ ] T030 [US6] Vista estado pedido (integrar en Pedido o componente separado `src/components/Pedido/EstadoPedido.tsx`)

**Checkpoint**: Todas historias independientes

## Phase 9: Polish & Cross-Cutting

- [ ] T031 [P] Actualizar `README.md` con instrucciones (VITE_API_URL, dev, tests)
- [ ] T032 [P] Añadir `src/index.css` estilos básicos (HTML semántico, CSS propio)
- [ ] T033 Ejecutar quickstart.md: build/lint/tests si existen
- [ ] T034 Verificar cumplimiento constitución (gateway-only, JWT, errores uniformes, español)

## Dependencies & Execution Order

### Phases
- Phase 1 (Setup) → Phase 2 (Foundational) [BLOCKS stories]
- Phase 2 → Phases 3–8 (stories P1–P2) pueden ejecutarse en paralelo entre historias tras foundation
- Phase 9 tras historias completas

### Within stories
- Tests → Implementation (TDD recomendado)
- Models/types → Services → Components → Integration

### Parallel opportunities
- [P] tasks: diferentes archivos, sin dependencias
- Tras Phase 2: US1–US5 pueden iniciarse en paralelo (distintos componentes/servicios)
- US6 depende de servicios pedidos (ya existen) - puede correr paralelo

## Implementation Strategy

**MVP**: US1+US2+US3+US4+US5 (todas P1) → validar flujo completo.  
**Incremental**: añadir US6 (P2).  
**TDD**: escribir tests primero (fallan) → implementar → verde → refactor.

---

*Based on Constitution v1.0.0, Spec, Plan, Research, Data Model, Contracts*

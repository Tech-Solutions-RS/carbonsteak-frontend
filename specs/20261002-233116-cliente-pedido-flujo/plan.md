# Implementation Plan: Flujo de pedido cliente

**Branch**: cliente-pedido-flujo  
**Specification**: [spec.md](./spec.md)  
**Created**: 2026-10-02  
**Status**: Draft

## Summary

Implementar flujo cliente completo en React + Vite para CarbonSteak: login con JWT, menú público, carrito local en React state, creación de pedido, flujo de pago (POST pagos + intento), y vista de estado. Usar gateway http://localhost:8080 exclusivamente, token en localStorage + AuthContext, API client centralizado (fetch/axios) con interceptor para header Authorization y manejo uniforme de errores `{ error, codigo, timestamp }`. Componentes por pantalla: Login, Menu, Carrito, Pedido, Pago.

## Technical Context

**Language/Version**: TypeScript/JavaScript (React 18+ con Vite)  
**Primary Dependencies**: react, vite, react-router-dom (asumido para navegación), axios o fetch nativo  
**Storage**: localStorage (JWT), React state (carrito)  
**Testing**: [NEEDS CLARIFICATION: framework de tests (Vitest/Jest/Testing Library)]  
**Target Platform**: Web (navegador)  
**Project Type**: single-page application frontend  
**Performance Goals**: carga catálogo sin bloqueo, navegación fluida  
**Constraints**: gateway-only 8080, sin UI pesado, español, JWT en cada petición protegida  
**Scale/Scope**: etapa 1 - solo flujo cliente

## Constitution Check

**Simplicity**:
- Projects: 1 SPA frontend (Vite) - yes
- Using framework directly (React) - yes
- Single data model scope (cliente flujo) - yes
- Avoiding patterns until necessary - yes

**Architecture**:
- EVERY feature as library? Frontend app; componentes y servicios como módulos reutilizables - yes
- Libraries listed: auth (AuthContext), api (client/interceptor), carrito (state/hooks), features (Login/Menu/Carrito/Pedido/Pago)
- CLI per library? N/A (frontend) - acceptable
- Library docs: brief README per módulo - yes

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor enforced - yes
- Git commits show tests before implementation? [NEEDS CLARIFICATION: commit policy]
- Order: Contract→Integration→E2E? Frontend: unit/component + integration con mocks - planned
- Real dependencies for integration? Mock gateway responses - yes
- Integration tests for: auth flow, pedidos, pagos, menú - yes

**Observability**:
- Structured logging in español? Console logs mínimos, errores formateados - yes

**Versioning**:
- Versioning: SemVer if libs - app version in package.json - yes

**Additional Constraints (from constitution)**:
- Gateway-only 8080 - yes
- JWT Bearer en protegidas - yes
- Roles lowercase - yes
- Errores uniformes {error,codigo,timestamp} - yes
- Sin UI pesado - yes
- Español - yes

## Project Structure

### Documentation (this feature)
```
specs/20261002-233116-cliente-pedido-flujo/
├── plan.md              # This file (/speckit.plan)
├── research.md          # Phase 0 output (/speckit.plan)
├── data-model.md        # Phase 1 output (/speckit.plan)
├── quickstart.md        # Phase 1 output (/speckit.plan)
├── contracts/           # Phase 1 output (/speckit.plan)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)
```
src/
├── components/
│   ├── Login/
│   ├── Menu/
│   ├── Carrito/
│   ├── Pedido/
│   ├── Pago/
│   └── common/
├── contexts/
│   └── AuthContext.tsx
├── services/
│   ├── api.ts           # cliente HTTP + interceptor
│   ├── auth.ts
│   ├── platos.ts
│   ├── pedidos.ts
│   └── pagos.ts
├── hooks/
│   └── useCarrito.ts
├── types/
│   ├── auth.ts
│   ├── plato.ts
│   ├── pedido.ts
│   └── pago.ts
├── utils/
│   └── errors.ts
├── App.tsx
├── main.tsx
└── index.css
```

**Structure Decision**: SPA React+Vite con estructura modular por feature/components + services/contexts/types.

## Phase 0: Research

See `research.md` for details.

### Research Tasks
- Cliente HTTP: elegir fetch vs axios (consistencia, tamaño) - default axios por interceptor simple? o fetch wrapper
- Router: react-router-dom v6
- State carrito: Context + hook useReducer
- Tests: Vitest + React Testing Library (común con Vite)
- Variables: VITE_API_URL

## Phase 1: Design

### Data Model
See `data-model.md`.

### Contracts
See `contracts/` (API contracts mapping gateway: login, platos/categorias, pedidos, pagos).

### Quickstart
See `quickstart.md`.

## Complexity Tracking

No violations - simple SPA.

## Progress Tracking

**Phase Status**:
- [ ] Phase 0: Research complete
- [ ] Phase 1: Design complete
- [ ] Phase 2: Task planning complete (/speckit.tasks)

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

*Based on Constitution v1.0.0*

<!--
SYNC IMPACT REPORT
==================
Version change: [CONSTITUTION_VERSION] → 1.0.0
Modified principles:
- [PRINCIPLE_1_NAME] → I. Gateway-Only API Access
- [PRINCIPLE_2_NAME] → II. Token-Based Authentication & Authorization
- [PRINCIPLE_3_NAME] → III. Test-First (NON-NEGOTIABLE)
- [PRINCIPLE_4_NAME] → IV. Integration Testing
- [PRINCIPLE_5_NAME] → V. Simplicity & UI Constraints

Added sections:
- Additional Constraints (stack, API rules, error format, roles, language)
- Development Workflow

Removed sections: None (replaced placeholder sections with concrete content)

Deferred TODOs:
- RATIFICATION_DATE: original adoption date unknown (set to today as initial ratification)
-->
# CarbonSteak Frontend Constitution

## Core Principles

### I. Gateway-Only API Access
All HTTP requests MUST go exclusively to `http://localhost:8080` (the API gateway). Direct connections to internal microservice ports (8081-8085) are strictly forbidden. This ensures consistent routing, authentication enforcement, and error handling through a single entry point.

### II. Token-Based Authentication & Authorization
The frontend MUST store JWT tokens (in localStorage or React state) and attach them as `Authorization: Bearer {token}` to every protected request. Role-based access MUST be enforced according to backend roles: `cliente`, `cocinero`, `cajero`, `administrador` (lowercase). Authentication responses follow `{ token, rol, usuarioId }`.

### III. Test-First (NON-NEGOTIABLE)
TDD is mandatory: write tests and obtain user approval, ensure tests fail, then implement. The Red-Green-Refactor cycle MUST be strictly enforced for all new functionality and changes.

### IV. Integration Testing
Integration tests MUST cover: new API contract interactions with the gateway, contract changes, gateway/microservice integration boundaries, and shared data schemas. Backend contracts are defined by the gateway API; frontend integration tests MUST validate against those contracts.

### V. Simplicity & UI Constraints
No heavy UI frameworks (e.g., Material UI, Bootstrap) unless explicitly requested. Use semantic HTML and custom CSS. React is used for component logic. Communication with users MUST be in Spanish. Prefer simple, maintainable solutions; follow YAGNI.

## Additional Constraints

- **Single API entrypoint**: All requests to `http://localhost:8080` only.
- **JWT handling**: Store token securely on client (localStorage or React state), attach `Authorization: Bearer {token}` to protected requests.
- **Roles**: `cliente`, `cocinero`, `cajero`, `administrador` (lowercase). Enforce UI visibility/route guards based on role.
- **Gateway contracts**: 
  - `POST /usuarios/login` → `{ token, rol, usuarioId }`
  - `mc-menu`: `GET /platos` (public, filters/pagination), `GET /platos/{id}`, `GET /categorias` (public). `POST/PUT/PATCH` require `administrador`.
  - `mc-inventario`: `/inventario`, `/alertas` require authentication.
  - `mc-pedidos`: `POST /pedidos` (role `cliente`) with `[{ platoId, cantidad }]` and `direccionEntrega` → `{ id, estado, total, lineas }`. `GET /pedidos/{id}` to query.
  - `mc-pagos`: `POST /pagos` `{ pedidoId, monto, metodoPago }`; `POST /pagos/{pagoId}/intentos` returns `EXITOSO`/`FALLIDO`.
- **Uniform errors**: All errors follow `{ "error", "codigo", "timestamp" }`. Handle and display appropriately in Spanish.
- **Tech stack**: HTML, CSS, React (Vite). No heavy UI frameworks unless explicitly requested.
- **Language**: All user-facing communication in Spanish.

## Development Workflow

- **Understand first**: Review relevant files and API contracts before implementing changes.
- **Follow conventions**: Mimic existing code style, use existing utilities/libraries, follow component patterns.
- **TDD required**: Write failing tests, get approval, implement, refactor.
- **Verify**: Run lint and typecheck (`npm run lint`, `npm run typecheck` if available). If commands unknown, ask and document in AGENTS.md.
- **Never commit** unless explicitly requested.
- **Security**: Never log or commit secrets/tokens. Validate inputs and handle errors properly.
- **Gateway-only**: No direct service calls; always use gateway at port 8080.

## Governance

The constitution supersedes all other practices. Amendments require documentation, clear rationale, and version increment per semantic versioning. All PRs/reviews MUST verify compliance with these principles. Complexity MUST be justified. 

**Version**: 1.0.0 | **Ratified**: 2026-10-02 | **Last Amended**: 2026-10-02

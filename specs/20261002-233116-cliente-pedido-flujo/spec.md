# Feature Specification: Flujo de pedido cliente

**Feature Branch**: `cliente-pedido-flujo`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: Flujo de cliente haciendo pedido en CarbonSteak (login, menú público, carrito local, creación de pedido, pago, estado del pedido)

## User Scenarios & Testing

### User Story 1 - Iniciar sesión (Priority: P1)

Como cliente, quiero iniciar sesión con mi correo y contraseña para autenticarme contra el gateway y tener acceso a funcionalidades que requieren autenticación.

**Why this priority**: Requisito base para crear pedidos (POST /pedidos requiere rol cliente). Sin autenticación no se puede completar el flujo principal.

**Independent Test**: Puede probarse realizando login exitoso/fallido; al éxito se guarda token y rol/usuarioId.

**Acceptance Scenarios**:
1. Given formulario con correo/contraseña válidos, When envio credenciales, Then recibo token y lo almaceno (localStorage/estado React).
2. Given credenciales inválidas, When intento login, Then muestro error según formato `{ "error", "codigo", "timestamp" }` en español.
3. Given sesión activa, When navego, Then adjunto `Authorization: Bearer {token}` en peticiones protegidas.

---

### User Story 2 - Ver menú público (Priority: P1)

Como cliente (sin login), quiero ver el menú con platos, categoría, nombre, descripción y precio.

**Why this priority**: Permite explorar catálogo antes de autenticarse/hacer pedido.

**Independent Test**: Acceso público a GET /platos y GET /categorias vía gateway http://localhost:8080.

**Acceptance Scenarios**:
1. Given usuario no autenticado, When accede a vista Menú, Then ve listado con filtros/paginado si aplica.
2. Given datos cargados, When visualizo ítem, Then muestra categoría, nombre, descripción, precio.
3. Given error de red/API, When falla carga, Then muestro mensaje español con información adecuada.

---

### User Story 3 - Gestionar carrito local (Priority: P1)

Como cliente, quiero seleccionar platos y cantidades para armar mi pedido; el carrito vive solo en estado local React.

**Why this priority**: Habilita armado de pedido antes de confirmar/envío.

**Independent Test**: Añadir/quitar/cambiar cantidades sin llamadas backend; estado persiste durante sesión React.

**Acceptance Scenarios**:
1. Given plato disponible, When selecciono cantidad > 0, Then se añade/actualiza línea en carrito.
2. Given carrito con ítems, When modifico cantidad a 0 o elimino, Then línea se quita.
3. Given carrito vacío, When intento confirmar, Then se bloquea acción con mensaje en español.

---

### User Story 4 - Crear pedido (Priority: P1)

Como cliente autenticado, quiero confirmar carrito con dirección de entrega para crear pedido.

**Why this priority**: Core del negocio - genera pedido con líneas y total.

**Independent Test**: POST /pedidos con `{ lineas: [{platoId,cantidad}], direccionEntrega }`, requiere rol cliente y token.

**Acceptance Scenarios**:
1. Given carrito no vacío + dirección válida + token válido, When confirmo, Then recibo `{ id, estado, total, lineas }`.
2. Given sin autenticación, When intento crear, Then error de autenticación/autorización según backend.
3. Given carrito vacío, When confirmo, Then no se envía petición y muestro validación.

---

### User Story 5 - Flujo de pago (Priority: P1)

Tras crear pedido, quiero iniciar pago y procesar intento, viendo resultado.

**Why this priority**: Completa transacción.

**Independent Test**: POST /pagos `{ pedidoId, monto, metodoPago }`, luego POST /pagos/{pagoId}/intentos retorna EXITOSO/FALLIDO.

**Acceptance Scenarios**:
1. Given pedido creado con total válido, When inicio pago, Then creo pago con monto/metodoPago.
2. Given pago creado, When proceso intento, Then muestro resultado EXITOSO o FALLIDO en español.
3. Given fallo de pago, When veo resultado, Then puedo reintentar según reglas UI (flujo básico).

---

### User Story 6 - Ver estado del pedido (Priority: P2)

Como cliente, quiero ver estado: PENDIENTE, CONFIRMADO o CANCELADO.

**Why this priority**: Provee visibilidad post-creación.

**Independent Test**: GET /pedidos/{id} retorna estado.

**Acceptance Scenarios**:
1. Given pedido existente, When consulto, Then veo estado actual.
2. Given ID inválido, When consulto, Then muestro error adecuado.

---

### Edge Cases

- Token expirado durante flujo → redirigir a login con mensaje español.
- Carrito pierde estado solo al recargar? (local state) - no persistir; recarga limpia carrito (aceptable para etapa 1).
- DireccionEntrega vacía → validación cliente antes de enviar.
- Cantidades <= 0 → no permitir.
- Errores gateway con formato uniforme `{ "error","codigo","timestamp" }` → mostrar mensaje legible.
- Sin conexión → manejar error red.

## Requirements

### Functional Requirements

- **FR-001**: Pantalla Login - formulario correo/contraseña, POST a gateway `/usuarios/login`, guardar token/rol/usuarioId.
- **FR-002**: Vista Menú - pública, consulta GET `/platos` (filtros/paginado) y GET `/categorias` vía http://localhost:8080.
- **FR-003**: Carrito local - React state only, añadir/quitar/actualizar cantidades, cálculo total local.
- **FR-004**: Crear pedido - POST `/pedidos` (rol cliente) con `direccionEntrega` y `lineas:[{platoId,cantidad}]`, requiere token.
- **FR-005**: Flujo pago - POST `/pagos` luego POST `/pagos/{pagoId}/intentos`, mostrar EXITOSO/FALLIDO.
- **FR-006**: Estado pedido - GET `/pedidos/{id}`, mostrar PENDIENTE/CONFIRMADO/CANCELADO.
- **FR-007**: Autenticación - adjuntar `Authorization: Bearer {token}` a peticiones protegidas.
- **FR-008**: Gateway-only - todas peticiones a http://localhost:8080.
- **FR-009**: Idioma - UI/errores en español.
- **FR-010**: UI - HTML semántico, CSS propio, sin frameworks pesados (salvo explícito).

### Key Entities

- **Usuario**: autenticado via JWT (token, rol, usuarioId).
- **Plato**: id, nombre, descripción, precio, categoría (desde catálogo público).
- **Línea Carrito**: platoId, cantidad (estado local).
- **Pedido**: id, estado, total, lineas, direccionEntrega.
- **Pago**: pagoId, pedidoId, monto, metodoPago, estado intento.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Cliente puede completar login en < 1 minuto.
- **SC-002**: Menú carga sin login y muestra información completa.
- **SC-003**: Carrito permite armar pedido con múltiples líneas sin errores.
- **SC-004**: Pedido creado exitosamente vía gateway con formato correcto.
- **SC-005**: Pago procesa intento y resultado mostrado claramente.
- **SC-006**: Estado pedido visible tras creación.

## Assumptions

- Backend gateway disponible en http://localhost:8080 con contratos indicados.
- Método pago inicial simple (definido por UI o valor por defecto) - Usuario selecciona m�todo de pago (efectivo/tarjeta) antes de crear pago
- Persistencia carrito no requerida en etapa 1 (solo memoria React).
- Roles válidos según backend.
- Sin frameworks UI pesados a menos que explícito.
- Comunicación 100% español.

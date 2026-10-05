# Research: Flujo de pedido cliente (CarbonSteak Frontend)

## Cliente HTTP (fetch vs axios)
- **Decision**: Usar `fetch` nativo (con wrapper centralizado) para minimizar dependencias; o `axios` si se prefiere interceptores. Dado stack ligero (sin UI pesado), fetch es suficiente. 
- **Rationale**: Vite + moderno, no requiere dependencia extra si wrapper bien hecho; axios facilita interceptors y manejo errores.
- **Recommended**: axios v1.x (consistente) o fetch wrapper. Mejor axios para `Authorization` interceptor global y transformación errores.
- **Alternatives**: fetch nativo (más ligero) - requiere manejo manual 4xx/5xx.

**Decision final**: axios (wrapper único en `services/api.ts`) para consistencia y centralización. 

## Routing
- **Decision**: react-router-dom v6
- **Rationale**: estándar React SPA, rutas Login/Menu/Carrito/Pedido/Pago + guards por auth/rol.
- **Alternatives**: TanStack Router - sobreingeniería.

## Gestión de estado (carrito)
- **Decision**: React Context + useReducer (o useState con hook custom `useCarrito`)
- **Rationale**: carrito solo local, sin backend; Context evita prop drilling. useReducer para transiciones claras (add/remove/update).
- **Alternatives**: Zustand/Jotai - innecesarios para este alcance.

**Decision**: AuthContext + CarritoContext o hook `useCarrito` con estado local compartido.

## Autenticación
- JWT en localStorage. AuthContext expone token, rol, usuarioId, login/logout. Interceptor añade `Authorization: Bearer {token}` solo a protegidas; maneja 401 → logout/redirección login.

## Errores backend
Formato uniforme: `{ error, codigo, timestamp }`. Wrapper transforma respuesta no-ok a objeto estructurado y muestra mensaje español.

## Testing
- **Decision**: Vitest + @testing-library/react + @testing-library/user-event
- **Rationale**: integrado con Vite, rápido, estándar React.
- **Alternatives**: Jest - configuración más compleja con Vite.

## Variables entorno
VITE_API_URL default `http://localhost:8080`.

## Componentes
Login, Menu, Carrito, Pedido, Pago + common (Button, Input, etc.), layout básico.

## Resumen decisiones
- HTTP: axios
- Router: react-router-dom v6
- State: Context + hooks
- Tests: Vitest + RTL
- Auth: localStorage + AuthContext + interceptor
- API base: VITE_API_URL

# Quickstart: Flujo de pedido cliente

## Prerequisitos
- Backend gateway corriendo en http://localhost:8080 (6 microservicios + gateway)
- Node.js 18+, npm
- Variables entorno: `VITE_API_URL=http://localhost:8080` (default)

## Setup
```bash
npm i
npm run dev
```

## Validación end-to-end

1. **Login**: POST /usuarios/login → guardar token en localStorage + AuthContext
2. **Menú**: GET /platos, GET /categorias (público) → mostrar listado
3. **Carrito**: añadir líneas, calcular total, validar no vacío
4. **Pedido**: POST /pedidos con dirección + líneas → obtener id/estado/total
5. **Pago**: POST /pagos (monto+metodoPago) → pagoId; POST /pagos/{id}/intentos → EXITOSO/FALLIDO (mostrar resultado)
6. **Estado**: GET /pedidos/{id} → PENDIENTE/CONFIRMADO/CANCELADO

## Tests
- Unit: AuthContext, carrito hook, utils errores
- Integration: servicios api con mocks (MSW/Vitest mocks)
- Component: Login/Menu/Carrito/Pedido/Pago (RTL)

## Criterios éxito
- Todas peticiones a gateway 8080
- Token Bearer en protegidas
- Errores mostrados en español con formato uniforme
- Flujo completo funcional sin frameworks UI pesados

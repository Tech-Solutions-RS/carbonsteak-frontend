# Data Model: Flujo de pedido cliente

## Usuario (Auth)
- **id/usuarioId**: string/number (desde backend)
- **rol**: 'cliente' | 'cocinero' | 'cajero' | 'administrador'
- **token**: JWT string

## Plato
- **id**: number | string
- **nombre**: string
- **descripcion**: string
- **precio**: number
- **categoria**: string (o Categoria {id,nombre})

## Categoria
- **id**: number | string
- **nombre**: string

## LineaCarrito (local)
- **platoId**: number|string
- **cantidad**: number (>=1)
- **plato**: Plato (opcional para display)

## Pedido
- **id**: number|string
- **estado**: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO'
- **total**: number
- **direccionEntrega**: string
- **lineas**: Array<{platoId, cantidad, precio?}>

## Pago
- **pagoId**: number|string
- **pedidoId**: number|string
- **monto**: number
- **metodoPago**: 'efectivo' | 'tarjeta' (seleccionado por usuario)
- **estadoIntento**: 'EXITOSO' | 'FALLIDO' | null

## AuthContext State
- **token**: string | null
- **rol**: string | null
- **usuarioId**: string|number | null
- **isAuthenticated**: boolean
- **login(credentials)**: Promise<void>
- **logout()**: void

## Carrito State (Context/Hook)
- **items**: LineaCarrito[]
- **total**: number (calculado)
- **add(plato, cantidad)**: void
- **update(platoId, cantidad)**: void
- **remove(platoId)**: void
- **clear()**: void
- **isEmpty**: boolean

## Validation Rules
- cantidad >=1
- direccionEntrega no vacía
- carrito no vacío antes crear pedido
- token requerido para pedido/pago
- rol cliente para crear pedido

import { useEffect, useRef } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useParams,
} from 'react-router-dom';
import Login from './components/Login/Login';
import Menu from './components/Menu/Menu';
import Carrito from './components/Carrito/Carrito';
import PedidoComponent from './components/Pedido/Pedido';
import DetallePedido from './components/Pedido/DetallePedido';
import MisPedidos from './components/MisPedidos/MisPedidos';
import Register from './components/Register/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Pago from './components/Pago/Pago';
import RequireAuth from './components/common/RequireAuth';
import CerrarSesion from './components/common/CerrarSesion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CarritoProvider, useCarrito } from './hooks/useCarrito';

function PagoRoute() {
  const { id } = useParams();
  const location = useLocation();
  const monto = (location.state as { monto?: number } | null)?.monto ?? 0;

  return <Pago pedidoId={id ?? ''} monto={monto} />;
}

/**
 * El carrito es estado local de React, no hay endpoint de carrito en el backend.
 * Como vive en memoria sobrevive a un logout en la misma pestana, asi que se
 * vacia cada vez que cambia la identidad de la sesion:
 *   - usuario A -> logout            (A -> null)
 *   - usuario A -> usuario B         (A -> B, sin pasar por logout)
 *   - logout -> login de B           (null -> B)
 * El primer render no vacia nada (ref inicializado como undefined), de modo que
 * una recarga con sesion activa no borra el carrito recien hydrated.
 */
export function ResetCarritoPorSesion() {
  const { clear } = useCarrito();
  const { token, usuarioId } = useAuth();
  const clave = token ? String(usuarioId ?? '') : null;
  const identidadPrevia = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const previa = identidadPrevia.current;
    if (previa !== undefined && previa !== clave) {
      clear();
    }
    identidadPrevia.current = clave;
  }, [clave, clear]);

  return null;
}

function NavBar() {
  const { isAuthenticated, nombre } = useAuth();

  return (
    <nav>
      <div className="nav-links">
        <Link to="/">Menú</Link>
        <Link to="/carrito">Carrito</Link>
        <Link to="/pedido">Pedido</Link>
        <Link to="/mis-pedidos">Mis pedidos</Link>
      </div>

      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="nav-user">
              Hola, {nombre ?? 'Usuario'}
            </Link>
            <CerrarSesion />
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registro</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div>
      <ResetCarritoPorSesion />
      <NavBar />
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/carrito"
          element={
            <RequireAuth>
              <Carrito />
            </RequireAuth>
          }
        />
        <Route
          path="/pedido"
          element={
            <RequireAuth>
              <PedidoComponent />
            </RequireAuth>
          }
        />
        <Route
          path="/pago/:id"
          element={
            <RequireAuth>
              <PagoRoute />
            </RequireAuth>
          }
        />
        <Route
          path="/mis-pedidos"
          element={
            <RequireAuth>
              <MisPedidos />
            </RequireAuth>
          }
        />
        <Route
          path="/pedidos/:id"
          element={
            <RequireAuth>
              <DetallePedido />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <AppContent />
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
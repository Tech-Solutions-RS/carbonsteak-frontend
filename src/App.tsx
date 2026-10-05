import { BrowserRouter, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import Login from './components/Login/Login';
import Menu from './components/Menu/Menu';
import Carrito from './components/Carrito/Carrito';
import PedidoComponent from './components/Pedido/Pedido';
import Register from './components/Register/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Pago from './components/Pago/Pago';
import { AuthProvider } from './contexts/AuthContext';
import { CarritoProvider } from './hooks/useCarrito';

function PagoRoute() {
  const { id } = useParams();
  const location = useLocation();
  const monto = (location.state as { monto?: number } | null)?.monto ?? 0;

  return <Pago pedidoId={id ?? ''} monto={monto} />;
}

function AppContent() {
  return (
    <div>
      <nav>
        <Link to="/">Menú</Link> | <Link to="/login">Login</Link> | <Link to="/register">Registro</Link> | <Link to="/carrito">Carrito</Link> | <Link to="/pedido">Pedido</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/pedido" element={<PedidoComponent />} />
        <Route path="/pago/:id" element={<PagoRoute />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  );
}
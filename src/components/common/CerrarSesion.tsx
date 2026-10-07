import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * El backend no expone logout (los JWT no se revocan), asi que cerrar sesion es
 * borrar el token local y vaciar la sesion. El carrito lo limpia ResetCarritoPorSesion
 * al detectar el cambio de sesion.
 */
export default function CerrarSesion() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <button type="button" onClick={handleClick} className="btn btn--ghost btn--sm">
      Cerrar sesión
    </button>
  );
}
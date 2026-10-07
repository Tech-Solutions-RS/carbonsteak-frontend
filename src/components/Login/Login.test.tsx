import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { CarritoProvider } from '../../hooks/useCarrito';
import Login from './Login';

// El Router envuelve a AuthProvider porque AuthContext usa useNavigate
// (redirección al expirar la sesión por 401).
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>{children}</CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Login component', () => {
  it('muestra formulario de login', () => {
    render(<Login />, { wrapper });
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
  });
});

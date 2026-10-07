import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CarritoProvider } from '../../hooks/useCarrito';
import { AuthProvider } from '../../contexts/AuthContext';
import Menu from './Menu';

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

describe('Menu component', () => {
  it('muestra título menú', () => {
    render(<Menu />, { wrapper });
    expect(screen.getByText(/menú/i)).toBeInTheDocument();
  });
});

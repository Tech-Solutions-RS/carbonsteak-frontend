import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { CarritoProvider } from '../../hooks/useCarrito';
import Login from './Login';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  );
}

describe('Login component', () => {
  it('muestra formulario de login', () => {
    render(<Login />, { wrapper });
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
  });
});

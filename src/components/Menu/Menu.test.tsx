import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CarritoProvider } from '../../hooks/useCarrito';
import { AuthProvider } from '../../contexts/AuthContext';
import Menu from './Menu';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  );
}

describe('Menu component', () => {
  it('muestra título menú', () => {
    render(<Menu />, { wrapper });
    expect(screen.getByText(/menú/i)).toBeInTheDocument();
  });
});

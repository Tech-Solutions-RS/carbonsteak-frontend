import type { ReactNode } from 'react';

type Props = {
  /** Título de la pantalla. Se renderiza como <h2>, igual que en Login. */
  titulo: string;
  /**
   * form    -> 400px  (Login, Registro, Crear pedido)
   * detalle -> 640px  (Pedido creado, Pago, Dashboard, Carrito)
   */
  ancho?: 'form' | 'detalle';
  children: ReactNode;
  className?: string;
};

/**
 * Tarjeta unica de toda la app: mismo fondo, padding (2rem), radio (12px),
 * sombra y centrado horizontal que la tarjeta original de Login.
 */
export default function Carta({ titulo, ancho = 'form', children, className }: Props) {
  const clases = ['screen-card', `screen-card--${ancho}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={clases}>
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}

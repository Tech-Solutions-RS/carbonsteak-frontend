import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { Plato } from '../types/plato';

export type LineaCarrito = {
  platoId: number | string;
  cantidad: number;
  plato?: Plato;
};

type CarritoState = {
  items: LineaCarrito[];
};

type CarritoAction =
  | { type: 'add'; plato: Plato; cantidad: number }
  | { type: 'update'; platoId: number | string; cantidad: number }
  | { type: 'remove'; platoId: number | string }
  | { type: 'clear' };

const initialState: CarritoState = { items: [] };

function reducer(state: CarritoState, action: CarritoAction): CarritoState {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((i) => i.platoId === action.plato.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.platoId === action.plato.id
              ? { ...i, cantidad: i.cantidad + action.cantidad, plato: action.plato }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { platoId: action.plato.id, cantidad: action.cantidad, plato: action.plato },
        ],
      };
    }
    case 'update':
      return {
        items: state.items
          .map((i) => (i.platoId === action.platoId ? { ...i, cantidad: action.cantidad } : i))
          .filter((i) => i.cantidad > 0),
      };
    case 'remove':
      return { items: state.items.filter((i) => i.platoId !== action.platoId) };
    case 'clear':
      return initialState;
    default:
      return state;
  }
}

export type CarritoContextValue = {
  items: LineaCarrito[];
  total: number;
  isEmpty: boolean;
  add: (plato: Plato, cantidad: number) => void;
  update: (platoId: number | string, cantidad: number) => void;
  remove: (platoId: number | string) => void;
  clear: () => void;
};

const CarritoContext = createContext<CarritoContextValue | null>(null);

/**
 * El estado del carrito vive en el Provider, asi que Menu, Carrito y Pedido
 * comparten la misma instancia. Antes el reducer era local a cada componente
 * y cada uno veia su propio carrito vacio.
 */
export function CarritoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const total = useMemo(
    () => state.items.reduce((sum, i) => sum + (i.plato?.precio || 0) * i.cantidad, 0),
    [state.items]
  );

  const value = useMemo<CarritoContextValue>(
    () => ({
      items: state.items,
      total,
      isEmpty: state.items.length === 0,
      add: (plato, cantidad) => dispatch({ type: 'add', plato, cantidad }),
      update: (platoId, cantidad) => dispatch({ type: 'update', platoId, cantidad }),
      remove: (platoId) => dispatch({ type: 'remove', platoId }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [state.items, total]
  );

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): CarritoContextValue {
  const context = useContext(CarritoContext);

  if (!context) {
    throw new Error('useCarrito debe usarse dentro de un <CarritoProvider>');
  }

  return context;
}
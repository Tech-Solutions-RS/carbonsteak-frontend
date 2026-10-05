import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../components/Login/Login';
import Menu from '../components/Menu/Menu';
import PedidoComponent from '../components/Pedido/Pedido';
import Pago from '../components/Pago/Pago';
import { getPedido } from '../services/pedidos';
import { CarritoProvider } from '../hooks/useCarrito';
import {
  instalarSpyRed,
  restaurarSpyRed,
  obtenerRed,
  limpiarRed,
  imprimirRed,
} from './networkSpy';

const CREDENCIALES = {
  correo: 'e2e.cliente@carbonsteak.com',
  contrasena: 'E2eCliente2026',
};

// Las peticiones van al gateway vivo: 30s por test
const TIMEOUT = 30000;

/**
 * Aísla los errores de render de React.
 * Sin esto, el TypeError de Menu.tsx escapa al handler global y Vitest lo
 * reporta como "unhandled error", ensuciando el resultado de los demas tests.
 */
class CapturadorErrores extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    capturadores.push({ mensaje: error.message, stack: info.componentStack ?? '' });
  }

  render() {
    return this.state.error ? null : this.props.children;
  }
}

const capturadores: { mensaje: string; stack: string }[] = [];

function capturar(reactNode: ReactNode) {
  capturadores.length = 0;
  return render(<CapturadorErrores>{reactNode}</CapturadorErrores>);
}

beforeAll(() => instalarSpyRed());
beforeEach(() => limpiarRed());
afterAll(() => {
  imprimirRed('RED TOTAL ACUMULADA');
  restaurarSpyRed();
});

describe('E2E real contra gateway vivo http://localhost:8080', () => {
  /** Id del pedido que el test 3 crea pulsando los botones reales de Menu y Pedido. */
  let PEDIDO_CREADO_ID: number | null = null;

  it('1. Login real -> POST /usuarios/login y persistencia de token', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    expect(screen.getByRole('heading', { name: /iniciar sesi/i })).toBeInTheDocument();

    fireEvent.change(document.querySelector('input[type="email"]')!, {
      target: { value: CREDENCIALES.correo },
    });
    fireEvent.change(document.querySelector('input[type="password"]')!, {
      target: { value: CREDENCIALES.contrasena },
    });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(obtenerRed().some((e) => e.url.includes('/usuarios/login'))).toBe(true);
    });
    await waitFor(() => {
      expect(screen.getByText(/autenticado/i)).toBeInTheDocument();
    });

    const login = obtenerRed().find((e) => e.url.includes('/usuarios/login'))!;
    console.log('\n>>> LOGIN:', login.metodo, login.url, 'status', login.status);
    console.log('    request :', login.requestBody);
    console.log('    response:', login.responseBody);
    console.log(
      '    localStorage:',
      JSON.stringify({
        token: localStorage.getItem('token')?.slice(0, 30) + '...',
        rol: localStorage.getItem('rol'),
        usuarioId: localStorage.getItem('usuarioId'),
      })
    );

    expect(login.metodo).toBe('POST');
    expect(login.url).toBe('http://localhost:8080/usuarios/login');
    expect(login.status).toBe(200);
    expect(JSON.parse(login.responseBody).rol).toBe('cliente');
    expect(localStorage.getItem('token')).toBeTruthy();
    expect(localStorage.getItem('rol')).toBe('cliente');
  }, TIMEOUT);

  it('2. Menu real -> GET /platos + GET /categorias, desenvuelve el envelope y RENDERIZA', async () => {
    capturar(
      <CarritoProvider>
        <Menu />
      </CarritoProvider>
    );

    await waitFor(
      () => {
        expect(obtenerRed().some((e) => e.url.endsWith('/categorias'))).toBe(true);
      },
      { timeout: 20000 }
    );

    const platos = obtenerRed().find((e) => e.url.endsWith('/platos'))!;
    const categorias = obtenerRed().find((e) => e.url.endsWith('/categorias'))!;

    console.log('\n>>> PLATOS:', platos.metodo, platos.url, 'status', platos.status);
    console.log('    respuesta (primeros 220):', platos.responseBody.slice(0, 220));
    console.log('\n>>> CATEGORIAS:', categorias.metodo, categorias.url, 'status', categorias.status);
    console.log('    respuesta:', categorias.responseBody);

    expect(platos.metodo).toBe('GET');
    expect(platos.url).toBe('http://localhost:8080/platos');
    expect(platos.status).toBe(200);
    expect(categorias.status).toBe(200);

    // El backend pagina: el envelope es un objeto, no un array
    const body = JSON.parse(platos.responseBody);
    console.log('\n>>> ENVELOPE PAGINADO (lo que rompia Menu antes)');
    console.log('    claves del body :', Object.keys(body).join(', '));
    console.log('    es Array?       :', Array.isArray(body));
    console.log('    totalElementos  :', body.totalElementos);
    expect(Array.isArray(body)).toBe(false);
    expect(Array.isArray(body.contenido)).toBe(true);

    // CORRECCION: ya no hay TypeError, el menu renderiza
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^menú$/i })).toBeInTheDocument();
    });
    expect(capturadores).toHaveLength(0);

    const botones = screen.getAllByRole('button', { name: /añadir al carrito/i });
    console.log('\n>>> MENU CORREGIDO: renderiza sin crash');
    console.log('    errores de render capturados:', capturadores.length);
    console.log('    "Añadir al carrito" renderizados:', botones.length);
    expect(botones.length).toBeGreaterThan(0);

    // CORRECCION 2: categoria llega como objeto { id, nombre } y se renderiza el nombre
    expect(screen.getAllByText(/^Categoría: /).length).toBeGreaterThan(0);
    const primeraCat = screen.getAllByText(/^Categoría: /)[0].textContent;
    console.log('    primera categoria renderizada:', primeraCat);
    expect(primeraCat).not.toBe('Categoría: [object Object]');
    expect(primeraCat).toMatch(/^Categoría: .+/);

    // El filtro por categoria existe y esta enlazado por id
    const filtro = screen.getByLabelText(/categoría/i) as HTMLSelectElement;
    const opciones = Array.from(filtro.options).map((o) => o.textContent);
    console.log('    opciones del filtro:', opciones.join(' | '));
    expect(opciones.length).toBe(JSON.parse(categorias.responseBody).length + 1);
    expect(opciones[0]).toBe('Todas');
  }, TIMEOUT);

  it('3. Pedido real -> MENU y PEDIDO comparten el carrito y COINCIDEN los 2 endpoints', async () => {
    // Se monta igual que App.tsx: CarritoProvider envuelve a Menu y Pedido.
    render(
      <CarritoProvider>
        <Menu />
        <PedidoComponent />
      </CarritoProvider>
    );

    await waitFor(
      () => {
        expect(obtenerRed().some((e) => e.url.endsWith('/platos'))).toBe(true);
      },
      { timeout: 20000 }
    );

    // 1) Con carrito vacio el boton arranca deshabilitado
    const boton = screen.getByRole('button', { name: /confirmar pedido/i }) as HTMLButtonElement;
    console.log('\n>>> PEDIDO: con carrito vacio, "Confirmar pedido" disabled =', boton.disabled);
    expect(boton.disabled).toBe(true);

    // 2) Se agrega un plato desde MENU -> el estado debe llegar a PEDIDO
    // Se elige "Bacon Burger": hay platos seed sin stock que mc-pedidos rechaza con 409.
    const titulos = screen.getAllByRole('heading', { level: 3 });
    const indice = titulos.findIndex((h) => h.textContent?.trim() === 'Bacon Burger');
    console.log('\n>>> CARRITO: platos en pantalla =', titulos.length, '| indice Bacon Burger =', indice);
    expect(indice).toBeGreaterThanOrEqual(0);

    const agregar = screen.getAllByRole('button', { name: /añadir al carrito/i })[indice];
    fireEvent.click(agregar);

    await waitFor(() => {
      expect(boton.disabled).toBe(false);
    });
    console.log('>>> CARRITO COMPARTIDO: tras "Añadir al carrito" en Menu, disabled =', boton.disabled);

    // El unico textbox de la pantalla es el campo de direccion de Pedido
    const direccion = screen.getByRole('textbox');
    fireEvent.change(direccion, { target: { value: 'Calle 100 #50-20' } });

    // 3) Confirmar -> debe emitir POST /pedidos real
    fireEvent.click(boton);

    await waitFor(
      () => {
        expect(obtenerRed().some((e) => e.url.endsWith('/pedidos'))).toBe(true);
      },
      { timeout: 20000 }
    );

    const pedidos = obtenerRed().filter((e) => e.url.includes('/pedidos'));
    pedidos.forEach((e, i) => {
      console.log(`\n>>> PEDIDO [${i}] ${e.metodo} ${e.url}`);
      console.log(`    status  : ${e.status}`);
      console.log(`    request : ${e.requestBody}`);
      console.log(`    response: ${e.responseBody}`);
    });

    const crear = pedidos.find((e) => e.url.endsWith('/pedidos'))!;

    expect(crear.metodo).toBe('POST');
    expect(crear.url).toBe('http://localhost:8080/pedidos');
    expect(crear.status).toBe(201);

    const enviado = JSON.parse(crear.requestBody as string);
    console.log('    body parseado:', JSON.stringify(enviado));
    expect(enviado.direccionEntrega).toBe('Calle 100 #50-20');
    expect(Array.isArray(enviado.lineas)).toBe(true);
    expect(enviado.lineas[0]).toHaveProperty('platoId');
    expect(enviado.lineas[0]).toHaveProperty('cantidad');

    // Tras crear, Pedido muestra el estado real devuelto por el backend
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /actualizar estado/i })).toBeInTheDocument();
    });

    const creado = JSON.parse(crear.responseBody);
    PEDIDO_CREADO_ID = creado.id;
    console.log('    pedido creado:', JSON.stringify(creado));
    console.log('    texto en pantalla:', (document.body.textContent ?? '').replace(/\s+/g, ' ').slice(-160));

    expect(creado.estado).toBe('PENDIENTE');
    expect(document.body.textContent).toContain('PENDIENTE');
  }, TIMEOUT);

  it('4. Pago real -> POST /pagos sin monto y POST /pagos/{id}/intentos con {resultado}', async () => {
    // El id es el de un pedido creado por el test 3 a traves de la UI real.
    if (!PEDIDO_CREADO_ID) throw new Error('El test 3 no dejo un pedido creado');

    render(<Pago pedidoId={PEDIDO_CREADO_ID} monto={45000} />);

    expect(screen.getByRole('heading', { name: /^pago$/i })).toBeInTheDocument();

    const combo = screen.getByRole('combobox') as HTMLSelectElement;
    const metodos = Array.from(combo.options).map((o) => o.value);
    console.log('\n>>> METODOS DE PAGO (enums del backend, en mayusculas):', metodos.join(' | '));
    expect(metodos).toContain('EFECTIVO');
    expect(metodos).toContain('TARJETA');

    // EFECTIVO solo lo confirma el cajero (TransaccionService lanza 409), asi que
    // el flujo de cliente digital usa TARJETA.
    fireEvent.change(combo, { target: { value: 'TARJETA' } });
    console.log('    metodo elegido:', combo.value);

    fireEvent.submit(screen.getByRole('button', { name: /^pagar$/i }).closest('form')!);

    await waitFor(
      () => {
        expect(obtenerRed().some((e) => e.url.includes('/intentos'))).toBe(true);
      },
      { timeout: 20000 }
    );

    const pagos = obtenerRed().filter((e) => e.url.includes('/pagos'));
    pagos.forEach((e, i) => {
      console.log(`\n>>> PAGO [${i}] ${e.metodo} ${e.url}`);
      console.log(`    status  : ${e.status}`);
      console.log(`    request : ${e.requestBody}`);
      console.log(`    response: ${e.responseBody}`);
    });

    const crear = pagos.find((e) => e.url.endsWith('/pagos'))!;
    const intento = pagos.find((e) => e.url.endsWith('/intentos'))!;

    // CORRECCION: el body de creacion solo lleva pedidoId y metodoPago (CrearPagoRequest)
    const bodyCrear = JSON.parse(crear.requestBody as string);
    console.log('    claves del body de creacion:', Object.keys(bodyCrear).join(', '));
    expect(Object.keys(bodyCrear).sort()).toEqual(['metodoPago', 'pedidoId']);
    expect(bodyCrear).not.toHaveProperty('monto');
    expect(bodyCrear.metodoPago).toBe('TARJETA');

    // CORRECCION: se lee pago.id (no pagoId) y ese id alimenta /intentos
    const creado = JSON.parse(crear.responseBody);
    console.log('    pago creado id:', creado.id, '| pedidoId:', creado.pedidoId, '| estado:', creado.estado);
    expect(creado).toHaveProperty('id');
    expect(creado.pedidoId).toBe(PEDIDO_CREADO_ID);
    expect(intento.url).toBe(`http://localhost:8080/pagos/${creado.id}/intentos`);

    // CORRECCION: RegistrarIntentoRequest exige { resultado: 'EXITOSO' }
    console.log('    body de /intentos:', intento.requestBody);
    expect(JSON.parse(intento.requestBody as string)).toEqual({ resultado: 'EXITOSO' });

    console.log('    status creacion:', crear.status, '| status intento:', intento.status);
    console.log('    pantalla final :', (document.body.textContent ?? '').replace(/\s+/g, ' ').slice(-120));

    expect(crear.status).toBe(201);
    expect(intento.status).toBe(200);
    await waitFor(() => {
      expect(screen.getByText(/Resultado:/)).toBeInTheDocument();
    });
    const estadoPago = JSON.parse(intento.responseBody).estado;
    console.log('    estado del pago mostrado:', estadoPago);
    expect(estadoPago).toBe('EXITOSO');
  }, TIMEOUT);

  it('5. GET del pedido -> el pago deja el pedido en CONFIRMADO', async () => {
    if (!PEDIDO_CREADO_ID) throw new Error('El test 3 no dejo un pedido creado');

    // a) El servicio REAL del frontend (services/pedidos.ts) pide GET /pedidos/{id}
    console.log(`\n>>> PEDIDO A VERIFICAR: ${PEDIDO_CREADO_ID}`);

    let viaFrontend = '';
    try {
      const pedido = await getPedido(PEDIDO_CREADO_ID);
      viaFrontend = `200 ${JSON.stringify(pedido)}`;
    } catch (err) {
      const e = err as { response?: { status?: number; data?: unknown } };
      viaFrontend = `${e.response?.status ?? 'sin status'} ${JSON.stringify(e.response?.data)}`;
    }
    console.log(`    GET /pedidos/${PEDIDO_CREADO_ID} (gateway, via getPedido()) -> ${viaFrontend}`);

    // b) mc-pedidos no expone GET publico: el unico lector real es /internal/pedidos/{id},
    //    que el gateway no expone. Se consulta directo a mc-pedidos:8083.
    const res = await fetch(`http://localhost:8083/internal/pedidos/${PEDIDO_CREADO_ID}`, {
      headers: { 'X-Internal-Key': 'clave-interna-de-pruebas' },
    });
    const pedido = await res.json();

    console.log(`    GET http://localhost:8083/internal/pedidos/${PEDIDO_CREADO_ID} (X-Internal-Key)`);
    console.log(`      status: ${res.status}`);
    console.log(`      body  : ${JSON.stringify(pedido)}`);

    expect(res.status).toBe(200);
    expect(pedido.id).toBe(PEDIDO_CREADO_ID);
    expect(pedido.estado).toBe('CONFIRMADO');
    expect(pedido.lineas.length).toBeGreaterThan(0);
    expect(pedido.total).toBeGreaterThan(0);
  }, TIMEOUT);
});
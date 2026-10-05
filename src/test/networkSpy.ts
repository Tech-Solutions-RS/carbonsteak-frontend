/**
 * Interceptor de red PASSTHROUGH.
 *
 * Envuelve el XMLHttpRequest nativo (la capa de red real que usa axios en jsdom),
 * registra metodo / URL / requestBody / status / responseBody y delega la
 * peticion al XHR original. No intercepta axios ni fetch, no simula respuestas:
 * cada request sale realmente a http://localhost:8080.
 */

export type RedEntry = {
  metodo: string;
  url: string;
  requestBody: unknown;
  status: number;
  responseBody: string;
};

const entradas: RedEntry[] = [];
const pendientes = new Map<XMLHttpRequest, Promise<RedEntry>>();

type Hooks = {
  open: (this: XMLHttpRequest, method: string, url: string) => void;
  send: (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) => void;
};

let original: Hooks | null = null;

export function instalarSpyRed() {
  if (original) return;
  const proto = XMLHttpRequest.prototype;

  const openOriginal = proto.open as (
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    async?: boolean
  ) => void;
  const sendOriginal = proto.send;

  const urls = new WeakMap<XMLHttpRequest, { metodo: string; url: string }>();
  const bodies = new WeakMap<XMLHttpRequest, unknown>();

  proto.open = function (this: XMLHttpRequest, method: string, url: string | URL) {
    urls.set(this, { metodo: String(method).toUpperCase(), url: String(url) });
    return openOriginal.call(this, method, url as string);
  } as typeof proto.open;

  proto.send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
    bodies.set(this, body ?? null);

    const promesa = new Promise<RedEntry>((resolve) => {
      let registrado = false;

      const registrar = () => {
        if (registrado) return;
        registrado = true;

        const info = urls.get(this) ?? { metodo: 'DESCONOCIDO', url: '' };
        const entry: RedEntry = {
          metodo: info.metodo,
          url: info.url,
          requestBody: bodies.get(this) ?? null,
          status: this.status,
          responseBody: this.responseText ?? '',
        };
        entradas.push(entry);
        pendientes.delete(this);
        resolve(entry);
      };

      this.addEventListener('loadend', registrar);
      this.addEventListener('error', registrar);
    });

    pendientes.set(this, promesa);
    return sendOriginal.call(this, body as XMLHttpRequestBodyInit);
  } as typeof proto.send;

  original = { open: openOriginal, send: sendOriginal };
}

export function restaurarSpyRed() {
  if (!original) return;
  XMLHttpRequest.prototype.open = original.open;
  XMLHttpRequest.prototype.send = original.send;
  original = null;
}

export function obtenerRed(): RedEntry[] {
  return [...entradas];
}

export function limpiarRed() {
  entradas.length = 0;
}

export function esperarRed(indice: number, ms = 8000): Promise<RedEntry> {
  const deadline = Date.now() + ms;
  return new Promise((resolve, reject) => {
    const poll = () => {
      if (entradas[indice]) return resolve(entradas[indice]);
      if (Date.now() > deadline) {
        return reject(new Error(`Timeout esperando peticion #${indice}`));
      }
      setTimeout(poll, 25);
    };
    poll();
  });
}

export function imprimirRed(titulo: string) {
  console.log(`\n===== RED REAL: ${titulo} =====`);
  if (entradas.length === 0) {
    console.log('(sin peticiones)');
    return;
  }
  entradas.forEach((e, i) => {
    console.log(`\n[${i}] ${e.metodo} ${e.url}`);
    console.log(`    status: ${e.status}`);
    if (e.requestBody) console.log(`    request : ${JSON.stringify(e.requestBody)}`);
    console.log(`    response: ${e.responseBody}`);
  });
  console.log('===== FIN RED REAL =====\n');
}

export { pendientes };
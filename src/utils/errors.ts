export function formatError(err: any): string {
  if (!err) return 'Error desconocido';
  if (typeof err === 'string') return err;
  if (err.error) return err.error;
  if (err.message) return err.message;
  return 'Error desconocido';
}

export function getCodigo(err: any): string {
  if (!err || typeof err !== 'object') return 'UNKNOWN';
  if (err.codigo) return String(err.codigo);
  if (err.status) return String(err.status);
  return 'UNKNOWN';
}

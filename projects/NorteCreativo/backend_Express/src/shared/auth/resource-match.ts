export interface GrantedOperation {
  method: string;
  path: string;
}

// Quita query string y la barra final: "/api/hitos/?x=1" -> "/api/hitos".
export const normalizePath = (path: string): string => {
  const sinQuery = path.split('?')[0].split('#')[0].trim();
  const conBarra = sinQuery.startsWith('/') ? sinQuery : `/${sinQuery}`;
  return conBarra.length > 1 ? conBarra.replace(/\/+$/, '') : conBarra;
};

// "/api/hitos/:id" coincide con "/api/hitos/42": mismo número de segmentos y ":param" captura uno.
// Sin comodines: cada ":param" cubre exactamente un segmento.
export const pathMatches = (pattern: string, path: string): boolean => {
  const p = normalizePath(pattern).split('/');
  const r = normalizePath(path).split('/');
  if (p.length !== r.length) return false;
  return p.every((segmento, i) => (segmento.startsWith(':') ? r[i].length > 0 : segmento === r[i]));
};

// Deny by default: solo se permite si algún grant activo coincide en método y ruta.
export const isOperationGranted = (grants: GrantedOperation[], method: string, path: string): boolean =>
  grants.some((g) => g.method.toUpperCase() === method.toUpperCase() && pathMatches(g.path, path));

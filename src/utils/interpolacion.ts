/** Milisegundos que tarda una transición entre dos frames a velocidad 1x. */
export const DURACION_TRANSICION_MS = 1200;

export function interpolar(desde: number, hasta: number, t: number): number {
  return desde + (hasta - desde) * t;
}

/**
 * Arranque y frenada suaves (easeInOutCubic). Un desplazamiento lineal delata
 * que es una animación; con esto el movimiento se lee como el de un jugador
 * que acelera y llega a su sitio.
 */
export function suavizar(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Interpola dos listas emparejando por id: lo que no está en el destino se queda quieto. */
export function interpolarPorId<T extends { x: number; y: number }>(
  desde: T[],
  hasta: T[],
  claveDe: (elemento: T) => string,
  t: number,
): T[] {
  const destinoPorId = new Map(hasta.map((elemento) => [claveDe(elemento), elemento]));
  return desde.map((elemento) => {
    const destino = destinoPorId.get(claveDe(elemento));
    if (!destino) return elemento;
    return { ...elemento, x: interpolar(elemento.x, destino.x, t), y: interpolar(elemento.y, destino.y, t) };
  });
}

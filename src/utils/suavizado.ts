import type { PuntoNormalizado } from '../types';

function distanciaPuntoSegmento(
  p: PuntoNormalizado,
  a: PuntoNormalizado,
  b: PuntoNormalizado,
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const longitudCuadrada = dx * dx + dy * dy;
  if (longitudCuadrada === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / longitudCuadrada));
  const proyeccion = { x: a.x + t * dx, y: a.y + t * dy };
  return Math.hypot(p.x - proyeccion.x, p.y - proyeccion.y);
}

/** Algoritmo de Ramer-Douglas-Peucker: reduce puntos de un trazo conservando su forma. */
export function simplificarRDP(puntos: PuntoNormalizado[], tolerancia: number): PuntoNormalizado[] {
  if (puntos.length < 3) return puntos;
  const inicio = puntos[0]!;
  const fin = puntos[puntos.length - 1]!;
  let distanciaMaxima = 0;
  let indice = 0;
  for (let i = 1; i < puntos.length - 1; i++) {
    const d = distanciaPuntoSegmento(puntos[i]!, inicio, fin);
    if (d > distanciaMaxima) {
      distanciaMaxima = d;
      indice = i;
    }
  }
  if (distanciaMaxima > tolerancia) {
    const izquierda = simplificarRDP(puntos.slice(0, indice + 1), tolerancia);
    const derecha = simplificarRDP(puntos.slice(indice), tolerancia);
    return [...izquierda.slice(0, -1), ...derecha];
  }
  return [inicio, fin];
}

/**
 * Dibuja una polilínea suavizada con curvas de Bézier cuadráticas que pasan por
 * los puntos medios de cada segmento (técnica estándar de suavizado de trazo a mano alzada).
 * No abre ni cierra el path: el llamador controla beginPath/stroke y el estilo.
 */
export function trazarRutaSuave(ctx: CanvasRenderingContext2D, puntos: PuntoNormalizado[]): void {
  if (puntos.length === 0) return;
  if (puntos.length < 3) {
    ctx.moveTo(puntos[0]!.x, puntos[0]!.y);
    for (let i = 1; i < puntos.length; i++) ctx.lineTo(puntos[i]!.x, puntos[i]!.y);
    return;
  }
  ctx.moveTo(puntos[0]!.x, puntos[0]!.y);
  for (let i = 1; i < puntos.length - 1; i++) {
    const actual = puntos[i]!;
    const siguiente = puntos[i + 1]!;
    const puntoMedio = { x: (actual.x + siguiente.x) / 2, y: (actual.y + siguiente.y) / 2 };
    ctx.quadraticCurveTo(actual.x, actual.y, puntoMedio.x, puntoMedio.y);
  }
  const penultimo = puntos[puntos.length - 2]!;
  const ultimo = puntos[puntos.length - 1]!;
  ctx.quadraticCurveTo(penultimo.x, penultimo.y, ultimo.x, ultimo.y);
}

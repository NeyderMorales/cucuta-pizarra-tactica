import type { Orientacion } from '../types';

export interface DimensionesPx {
  ancho: number;
  alto: number;
}

export interface PuntoPx {
  x: number;
  y: number;
}

export interface PuntoPct {
  x: number;
  y: number;
}

/** Ventana visible del eje de longitud del campo (dato "y", 0=portería propia, 100=portería rival), para FA5 "Vista". */
export interface VentanaRecorte {
  desde: number;
  hasta: number;
}

export const VENTANA_CAMPO_COMPLETO: VentanaRecorte = { desde: 0, hasta: 100 };

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(maximo, Math.max(minimo, valor));
}

/**
 * Convierte un punto normalizado (0-100) a píxeles relativos al contenedor del campo.
 * En horizontal el eje X de pantalla representa el largo portería-portería (dato "y")
 * y el eje Y de pantalla representa el ancho de banda a banda (dato "x"): el campo
 * gira 90° visualmente sin tocar los datos guardados.
 *
 * `ventana` recorta el eje de longitud (FA5 "Vista": medio campo / tercio): los puntos
 * fuera de la ventana caen fuera del contenedor (píxeles negativos o > tamaño), lo cual
 * es intencional — el contenedor los recorta visualmente vía `overflow: hidden`.
 */
export function porcentajeAPixeles(
  punto: PuntoPct,
  dimensiones: DimensionesPx,
  orientacion: Orientacion,
  ventana: VentanaRecorte = VENTANA_CAMPO_COMPLETO,
): PuntoPx {
  const { ancho, alto } = dimensiones;
  const rango = ventana.hasta - ventana.desde || 100;
  const yRecortado = ((punto.y - ventana.desde) / rango) * 100;
  if (orientacion === 'vertical') {
    return { x: (punto.x / 100) * ancho, y: (yRecortado / 100) * alto };
  }
  return { x: (yRecortado / 100) * ancho, y: (punto.x / 100) * alto };
}

export function pixelesAPorcentaje(
  punto: PuntoPx,
  dimensiones: DimensionesPx,
  orientacion: Orientacion,
  ventana: VentanaRecorte = VENTANA_CAMPO_COMPLETO,
): PuntoPct {
  const { ancho, alto } = dimensiones;
  if (ancho === 0 || alto === 0) return { x: 0, y: 0 };
  const rango = ventana.hasta - ventana.desde || 100;
  if (orientacion === 'vertical') {
    const yRecortado = limitar((punto.y / alto) * 100, 0, 100);
    return {
      x: limitar((punto.x / ancho) * 100, 0, 100),
      y: limitar(ventana.desde + (yRecortado / 100) * rango, 0, 100),
    };
  }
  const yRecortado = limitar((punto.x / ancho) * 100, 0, 100);
  return {
    x: limitar((punto.y / alto) * 100, 0, 100),
    y: limitar(ventana.desde + (yRecortado / 100) * rango, 0, 100),
  };
}

export function distancia(a: PuntoPx, b: PuntoPx): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

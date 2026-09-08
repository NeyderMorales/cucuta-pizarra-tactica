import type { PuntoNormalizado, Trazo } from '../types';
import { trazarRutaSuave } from './suavizado';

export type PuntoPx = { x: number; y: number };

function dibujarFlecha(ctx: CanvasRenderingContext2D, previo: PuntoPx, punta: PuntoPx, grosor: number): void {
  const angulo = Math.atan2(punta.y - previo.y, punta.x - previo.x);
  const largo = 8 + grosor * 3;
  ctx.beginPath();
  ctx.moveTo(punta.x, punta.y);
  ctx.lineTo(punta.x - largo * Math.cos(angulo - Math.PI / 7), punta.y - largo * Math.sin(angulo - Math.PI / 7));
  ctx.lineTo(punta.x - largo * Math.cos(angulo + Math.PI / 7), punta.y - largo * Math.sin(angulo + Math.PI / 7));
  ctx.closePath();
  ctx.fill();
}

/** Dibuja un trazo (libre, flecha, discontinua, zona o texto) sobre un contexto de canvas ya escalado. */
export function dibujarTrazo(ctx: CanvasRenderingContext2D, trazo: Trazo, aPixeles: (p: PuntoNormalizado) => PuntoPx): void {
  const puntosPx = trazo.puntos.map(aPixeles);
  if (puntosPx.length === 0) return;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = trazo.color;
  ctx.fillStyle = trazo.color;
  ctx.lineWidth = trazo.grosor * 1.6 + 1;
  ctx.setLineDash([]);

  switch (trazo.tipo) {
    case 'libre': {
      ctx.beginPath();
      trazarRutaSuave(ctx, puntosPx);
      ctx.stroke();
      break;
    }
    case 'discontinua': {
      ctx.setLineDash([ctx.lineWidth * 2.2, ctx.lineWidth * 1.8]);
      ctx.beginPath();
      trazarRutaSuave(ctx, puntosPx);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }
    case 'flecha': {
      const inicio = puntosPx[0]!;
      const fin = puntosPx[puntosPx.length - 1]!;
      const tieneControl = puntosPx.length === 3;
      ctx.beginPath();
      ctx.moveTo(inicio.x, inicio.y);
      if (tieneControl) {
        const control = puntosPx[1]!;
        ctx.quadraticCurveTo(control.x, control.y, fin.x, fin.y);
      } else {
        ctx.lineTo(fin.x, fin.y);
      }
      ctx.stroke();
      const previo = tieneControl ? puntosPx[1]! : inicio;
      dibujarFlecha(ctx, previo, fin, trazo.grosor);
      break;
    }
    case 'zona': {
      const [a, b] = puntosPx;
      if (!a || !b) break;
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const rx = Math.max(Math.abs(b.x - a.x) / 2, 6);
      const ry = Math.max(Math.abs(b.y - a.y) / 2, 6);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.globalAlpha = 0.22;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();
      break;
    }
    case 'texto': {
      const punto = puntosPx[0];
      if (!punto) break;
      const texto = trazo.texto ?? '';
      ctx.font = `600 ${13 + trazo.grosor * 2}px 'Barlow Condensed', Arial`;
      const medida = ctx.measureText(texto);
      ctx.globalAlpha = 0.78;
      ctx.fillStyle = '#111111';
      ctx.fillRect(punto.x - 4, punto.y - 16, medida.width + 8, 22);
      ctx.globalAlpha = 1;
      ctx.fillStyle = trazo.color;
      ctx.textBaseline = 'middle';
      ctx.fillText(texto, punto.x, punto.y - 5);
      break;
    }
  }
}

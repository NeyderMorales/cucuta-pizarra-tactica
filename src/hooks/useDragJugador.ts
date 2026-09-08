import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties } from 'react';
import { useEscalaCampo } from './useCampoEscala';

export type OrigenArrastre = 'campo' | 'banquillo';

export interface DatosArrastreJugador {
  tipoArrastre: 'jugador';
  origen: OrigenArrastre;
  jugadorId: string;
  [clave: string]: unknown;
}

interface ResultadoDragJugador {
  attributes: ReturnType<typeof useDraggable>['attributes'];
  listeners: ReturnType<typeof useDraggable>['listeners'];
  setNodeRef: ReturnType<typeof useDraggable>['setNodeRef'];
  isDragging: boolean;
  estilo: CSSProperties;
}

/**
 * Envuelve dnd-kit para tarjetas de jugador. Toda la posición (base + arrastre)
 * se resuelve con transform/translate3d — nunca top/left — y la transición
 * elástica solo se activa cuando NO se está arrastrando, para que soltar fuera
 * del campo regrese la tarjeta a su sitio en vez de perderla.
 */
export function useDragJugador(
  jugadorId: string,
  origen: OrigenArrastre,
  xPct?: number,
  yPct?: number,
  deshabilitado = false,
): ResultadoDragJugador {
  const { aPixeles } = useEscalaCampo();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: jugadorId,
    data: { tipoArrastre: 'jugador', origen, jugadorId } satisfies DatosArrastreJugador,
    disabled: deshabilitado,
  });

  let estilo: CSSProperties;
  if (origen === 'campo' && xPct !== undefined && yPct !== undefined) {
    const base = aPixeles({ x: xPct, y: yPct });
    const delta = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : '';
    estilo = {
      position: 'absolute',
      left: 0,
      top: 0,
      transform: `translate3d(${base.x}px, ${base.y}px, 0) ${delta} translate(-50%, -50%) scale(${isDragging ? 1.08 : 1})`,
      transition: isDragging ? 'none' : 'transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      willChange: isDragging ? 'transform' : undefined,
      zIndex: isDragging ? 50 : 10,
      touchAction: 'none',
    };
  } else {
    estilo = {
      transform: transform ? CSS.Translate.toString(transform) : undefined,
      willChange: isDragging ? 'transform' : undefined,
      zIndex: isDragging ? 50 : undefined,
      touchAction: 'none',
    };
  }

  return { attributes, listeners, setNodeRef, isDragging, estilo };
}

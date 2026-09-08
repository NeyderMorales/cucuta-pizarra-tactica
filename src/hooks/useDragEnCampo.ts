import { useDraggable } from '@dnd-kit/core';
import type { CSSProperties } from 'react';
import { useEscalaCampo } from './useCampoEscala';

interface ResultadoDragEnCampo {
  attributes: ReturnType<typeof useDraggable>['attributes'];
  listeners: ReturnType<typeof useDraggable>['listeners'];
  setNodeRef: ReturnType<typeof useDraggable>['setNodeRef'];
  isDragging: boolean;
  estilo: CSSProperties;
}

/**
 * Versión genérica de la rama "campo" de `useDragJugador`, para cualquier
 * entidad que se posiciona libremente por porcentaje (objetos, balón,
 * jugadores rivales): misma mecánica transform-only a 60fps, sin acoplarse
 * al modelo de datos de un jugador propio.
 */
export function useDragEnCampo(
  id: string,
  xPct: number,
  yPct: number,
  data: Record<string, unknown>,
  deshabilitado = false,
  zIndexBase = 5,
  /**
   * Desplazamiento en píxeles ajeno al propio arrastre de este elemento — p. ej.
   * el balón anclado a un jugador que se está arrastrando: dnd-kit solo conoce
   * el `transform` de SU PROPIO `useDraggable`, así que el balón necesita que
   * quien lo posiciona (Campo.tsx, vía `useDndMonitor`) le pase el delta en
   * vivo del jugador para no quedarse congelado hasta que este suelta.
   */
  deltaExterno?: { x: number; y: number },
): ResultadoDragEnCampo {
  const { aPixeles } = useEscalaCampo();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data, disabled: deshabilitado });

  const base = aPixeles({ x: xPct, y: yPct });
  const delta = transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : '';
  const deltaExternoCss = deltaExterno ? `translate3d(${deltaExterno.x}px, ${deltaExterno.y}px, 0)` : '';
  const enMovimiento = isDragging || Boolean(deltaExterno);
  const estilo: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate3d(${base.x}px, ${base.y}px, 0) ${delta} ${deltaExternoCss} translate(-50%, -50%)`,
    transition: enMovimiento ? 'none' : 'transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    willChange: enMovimiento ? 'transform' : undefined,
    zIndex: enMovimiento ? 50 : zIndexBase,
    touchAction: 'none',
  };

  return { attributes, listeners, setNodeRef, isDragging, estilo };
}

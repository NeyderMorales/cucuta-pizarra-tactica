import { useEffect, useRef } from 'react';
import { useEscalaCampo } from '../../hooks/useCampoEscala';
import { useAlineacionStore } from '../../store/alineacionStore';
import { useReproduccionStore } from '../../store/reproduccionStore';
import { dibujarTrazo } from '../../utils/renderTrazos';
import { posicionEfectivaBalon } from '../../utils/balon';
import type { PuntoNormalizado } from '../../types';

/** Movimientos por debajo de este umbral (en % de campo) no se señalan: son ruido de arrastre. */
const MINIMO_DESPLAZAMIENTO = 1.5;

const COLOR_JUGADOR = '#FFFFFF';
const COLOR_RIVAL = '#9AA3AE';
const COLOR_BALON = '#D4111E';

/**
 * Flechas de "a dónde va cada cosa en el paso siguiente". Solo se ven mientras
 * se edita la jugada: durante la reproducción sobran, porque el movimiento ya
 * se está viendo.
 *
 * El origen se toma del documento en pantalla y no del frame guardado, para que
 * la flecha siga al jugador mientras se arrastra en vez de esperar a que el
 * frame se vuelque. El destino sí sale del frame siguiente, que es lo único que
 * define hacia dónde va.
 *
 * Dibuja con `dibujarTrazo`, el mismo motor que usa la pizarra: aquí no hay un
 * sistema de dibujo nuevo, solo trazos sintéticos que nunca se guardan.
 */
export function CapaTrayectorias() {
  const documento = useAlineacionStore((s) => s.historial.presente);
  const reproduciendo = useReproduccionStore((s) => s.reproduciendo);
  const { aPixeles, ancho, alto } = useEscalaCampo();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const secuencia = documento.secuencia;
  const siguiente = secuencia?.frames[secuencia.indiceActivo + 1];
  const visible = Boolean(siguiente) && !reproduciendo;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(ancho * dpr));
    canvas.height = Math.max(1, Math.round(alto * dpr));
    canvas.style.width = `${ancho}px`;
    canvas.style.height = `${alto}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, ancho, alto);
    if (!visible || !siguiente) return;

    function flecha(desde: PuntoNormalizado, hasta: PuntoNormalizado, color: string, grosor: 1 | 2 | 3, opacidad: number): void {
      if (Math.hypot(hasta.x - desde.x, hasta.y - desde.y) < MINIMO_DESPLAZAMIENTO) return;
      ctx!.globalAlpha = opacidad;
      dibujarTrazo(ctx!, { id: 'trayectoria', tipo: 'flecha', puntos: [desde, hasta], color, grosor }, aPixeles);
      ctx!.globalAlpha = 1;
    }

    for (const titular of documento.titulares) {
      const destino = siguiente.titulares.find((t) => t.jugadorId === titular.jugadorId);
      if (destino) flecha(titular, destino, COLOR_JUGADOR, 2, 0.55);
    }

    for (const rival of documento.rival?.jugadores ?? []) {
      const destino = siguiente.jugadoresRival.find((r) => r.id === rival.id);
      if (destino) flecha(rival, destino, COLOR_RIVAL, 1, 0.45);
    }

    for (const balon of documento.balones) {
      const destino = siguiente.balones.find((b) => b.id === balon.id);
      if (!destino) continue;
      flecha(
        posicionEfectivaBalon(balon, documento.titulares),
        posicionEfectivaBalon(destino, siguiente.titulares),
        COLOR_BALON,
        3,
        0.9,
      );
    }
  }, [documento, siguiente, visible, ancho, alto, aPixeles]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" style={{ zIndex: 4 }} aria-hidden="true" />;
}

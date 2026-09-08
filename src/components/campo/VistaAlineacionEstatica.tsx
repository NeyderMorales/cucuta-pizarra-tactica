import { useEffect, useMemo, useRef, useState } from 'react';
import type { Alineacion, Jugador } from '../../types';
import { ANCHO_CAMPO_M, LARGO_CAMPO_M } from '../../utils/constantes';
import { porcentajeAPixeles } from '../../utils/coordenadas';
import { dibujarTrazo } from '../../utils/renderTrazos';
import { LineasCampo } from './LineasCampo';
import { TarjetaJugador } from '../jugador/TarjetaJugador';

interface VistaAlineacionEstaticaProps {
  alineacion: Alineacion;
  obtenerJugador: (id: string) => Jugador | undefined;
}

const ORIENTACION = 'vertical' as const;

/**
 * Vista de solo lectura de una alineación guardada: campo, jugadores en su
 * posición y trazos, sin dnd-kit ni conexión al store activo. Pensada para
 * el modo comparación (dos alineaciones lado a lado) y reutilizable en
 * cualquier otro lugar donde haga falta una miniatura fiel de una
 * alineación que no es la que se está editando.
 */
export function VistaAlineacionEstatica({ alineacion, obtenerJugador }: VistaAlineacionEstaticaProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [disponible, setDisponible] = useState({ ancho: 0, alto: 0 });

  useEffect(() => {
    const el = contenedorRef.current;
    if (!el) return;
    const observador = new ResizeObserver((entradas) => {
      const entrada = entradas[0];
      if (!entrada) return;
      setDisponible({ ancho: entrada.contentRect.width, alto: entrada.contentRect.height });
    });
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const dimensiones = useMemo(() => {
    if (disponible.ancho === 0 || disponible.alto === 0) return { ancho: 0, alto: 0 };
    const escala = Math.min(disponible.ancho / ANCHO_CAMPO_M, disponible.alto / LARGO_CAMPO_M);
    return { ancho: ANCHO_CAMPO_M * escala, alto: LARGO_CAMPO_M * escala };
  }, [disponible]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || dimensiones.ancho === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(dimensiones.ancho * dpr));
    canvas.height = Math.max(1, Math.round(dimensiones.alto * dpr));
    canvas.style.width = `${dimensiones.ancho}px`;
    canvas.style.height = `${dimensiones.alto}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, dimensiones.ancho, dimensiones.alto);
    for (const trazo of alineacion.trazos) {
      dibujarTrazo(ctx, trazo, (p) => porcentajeAPixeles(p, dimensiones, ORIENTACION));
    }
  }, [alineacion.trazos, dimensiones]);

  return (
    <div ref={contenedorRef} className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative overflow-hidden rounded-lg ring-1 ring-white/10"
        style={{ width: dimensiones.ancho, height: dimensiones.alto }}
      >
        <LineasCampo orientacion={ORIENTACION} />

        {alineacion.titulares.map((titular) => {
          const jugador = obtenerJugador(titular.jugadorId);
          if (!jugador) return null;
          const punto = porcentajeAPixeles({ x: titular.x, y: titular.y }, dimensiones, ORIENTACION);
          return (
            <div
              key={titular.jugadorId}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: punto.x, top: punto.y }}
            >
              <TarjetaJugador jugador={jugador} tamano="sm" esCapitan={titular.esCapitan} />
            </div>
          );
        })}

        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}

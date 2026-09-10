import { useEffect, useRef, useState } from 'react';
import { useEscalaCampo } from '../../hooks/useCampoEscala';
import { useAlineacionStore } from '../../store/alineacionStore';
import { usePlantillaStore } from '../../store/plantillaStore';
import { useReproduccionStore } from '../../store/reproduccionStore';
import { TarjetaJugador } from '../jugador/TarjetaJugador';
import { IconoObjeto } from './IconoObjeto';
import { COLORES_OBJETO, DIAMETRO_BALON_PX, PALETA_RIVAL } from '../../utils/constantes';
import { DURACION_TRANSICION_MS, interpolarPorId, suavizar } from '../../utils/interpolacion';
import { posicionEfectivaBalon } from '../../utils/balon';
import type { Balon, FrameTactico } from '../../types';

/**
 * Resuelve dónde está cada balón de un frame. Un balón anclado no guarda su
 * posición sino la de su poseedor, así que hay que fijarla ANTES de interpolar:
 * de lo contrario un pase se vería como un balón inmóvil en su última posición
 * suelta. Al resolverlo en el frame de origen y en el de destino, un balón que
 * cambia de dueño entre frames viaja en línea recta de un jugador al otro.
 */
function balonesResueltos(frame: FrameTactico): Balon[] {
  return frame.balones.map((balon) => ({ ...balon, ...posicionEfectivaBalon(balon, frame.titulares) }));
}

/**
 * Dibuja la jugada en movimiento. Se monta solo mientras se reproduce, y sustituye
 * a las fichas interactivas (que quedan ocultas) para que nada se pueda arrastrar
 * por accidente a mitad de una reproducción.
 *
 * El progreso se lleva con requestAnimationFrame en estado LOCAL: el store de la
 * alineación no se toca en ningún fotograma. Solo se avisa al store de
 * reproducción al cruzar de un frame al siguiente, es decir ~1 vez por segundo.
 */
export function CapaReproduccion() {
  const secuencia = useAlineacionStore((s) => s.historial.presente.secuencia);
  const paletaRival = useAlineacionStore((s) => s.historial.presente.rival?.paleta ?? 'blanco');
  const irAFrame = useAlineacionStore((s) => s.irAFrame);
  const obtenerPorId = usePlantillaStore((s) => s.obtenerPorId);
  const { aPixeles } = useEscalaCampo();

  const reproduciendo = useReproduccionStore((s) => s.reproduciendo);
  const velocidad = useReproduccionStore((s) => s.velocidad);
  const indiceFrame = useReproduccionStore((s) => s.indiceFrame);
  const setIndiceFrame = useReproduccionStore((s) => s.setIndiceFrame);
  const pausar = useReproduccionStore((s) => s.pausar);

  const [progreso, setProgreso] = useState(0);
  const rafRef = useRef<number | null>(null);
  const inicioRef = useRef<number | null>(null);

  const frames = secuencia?.frames ?? [];
  const actual = frames[indiceFrame];
  const siguiente = frames[indiceFrame + 1];

  useEffect(() => {
    if (!reproduciendo) {
      inicioRef.current = null;
      return;
    }
    // Último frame: no hay a dónde avanzar, se detiene sola. El tablero se deja
    // en ese frame, o al desmontarse esta capa se vería saltar al de partida.
    if (!siguiente) {
      pausar();
      irAFrame(indiceFrame);
      return;
    }

    const duracion = DURACION_TRANSICION_MS / velocidad;
    function paso(ahora: number): void {
      if (inicioRef.current === null) inicioRef.current = ahora;
      const t = Math.min(1, (ahora - inicioRef.current) / duracion);
      setProgreso(t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(paso);
        return;
      }
      // Llegó al siguiente frame: avanza el índice (único aviso al store) y reinicia.
      inicioRef.current = null;
      setProgreso(0);
      setIndiceFrame(indiceFrame + 1);
    }
    rafRef.current = requestAnimationFrame(paso);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [reproduciendo, indiceFrame, velocidad, siguiente, setIndiceFrame, pausar, irAFrame]);

  if (!actual) return null;

  const t = siguiente ? suavizar(progreso) : 0;
  const destino: FrameTactico = siguiente ?? actual;

  const titulares = interpolarPorId(actual.titulares, destino.titulares, (j) => j.jugadorId, t);
  const rivales = interpolarPorId(actual.jugadoresRival, destino.jugadoresRival, (j) => j.id, t);
  const balones = interpolarPorId(balonesResueltos(actual), balonesResueltos(destino), (b) => b.id, t);
  const objetos = interpolarPorId(actual.objetos, destino.objetos, (o) => o.id, t);

  const estiloEn = (x: number, y: number, zIndex: number) => {
    const punto = aPixeles({ x, y });
    return {
      position: 'absolute' as const,
      left: 0,
      top: 0,
      transform: `translate3d(${punto.x}px, ${punto.y}px, 0) translate(-50%, -50%)`,
      zIndex,
      pointerEvents: 'none' as const,
    };
  };

  const colores = PALETA_RIVAL[paletaRival];

  return (
    <>
      {objetos.map((objeto) => (
        <div key={objeto.id} style={estiloEn(objeto.x, objeto.y, 5)}>
          <IconoObjeto tipo={objeto.tipo} color={COLORES_OBJETO[objeto.color]} rotacion={objeto.rotacion} />
        </div>
      ))}

      {balones.map((balon) => (
        <div key={balon.id} style={estiloEn(balon.x, balon.y, 11)}>
          <svg
            width={DIAMETRO_BALON_PX}
            height={DIAMETRO_BALON_PX * 1.35}
            viewBox="0 0 24 32"
            className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]"
            aria-hidden="true"
          >
            <ellipse cx="12" cy="27" rx="7" ry="2.4" fill="#000000" opacity="0.35" />
            <circle cx="12" cy="12" r="10" fill="#F5F5F5" stroke="#111111" strokeWidth="0.75" />
            <polygon points="12,6 15,8.3 14,11.8 10,11.8 9,8.3" fill="#111111" />
            <path d="M12 6 L9.5 4 M12 6 L14.5 4 M10 11.8 L7 13 M14 11.8 L17 13 M9 8.3 L5.5 8" stroke="#111111" strokeWidth="0.6" fill="none" />
          </svg>
        </div>
      ))}

      {rivales.map((rival) => (
        <div key={rival.id} style={estiloEn(rival.x, rival.y, 8)}>
          <div className="sin-seleccion flex flex-col items-center gap-0.5" style={{ width: 54 + 16 }}>
            <div
              className="relative flex items-center justify-center rounded-full border-2 border-black/30 font-display font-extrabold shadow-tarjeta"
              style={{ width: 54, height: 54, background: colores.principal, color: colores.texto, fontSize: 54 * 0.32 }}
            >
              {rival.dorsal}
            </div>
          </div>
        </div>
      ))}

      {titulares.map((titular) => {
        const jugador = obtenerPorId(titular.jugadorId);
        if (!jugador) return null;
        return (
          <div key={titular.jugadorId} style={estiloEn(titular.x, titular.y, 10)}>
            <TarjetaJugador jugador={jugador} tamano="md" esCapitan={titular.esCapitan} />
          </div>
        );
      })}
    </>
  );
}

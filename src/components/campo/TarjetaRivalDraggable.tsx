import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useDragEnCampo } from '../../hooks/useDragEnCampo';
import { PALETA_RIVAL } from '../../utils/constantes';
import type { JugadorRival, PaletaRival } from '../../types';

export interface DatosArrastreRival {
  tipoArrastre: 'rival';
  jugadorRivalId: string;
  [clave: string]: unknown;
}

interface TarjetaRivalDraggableProps {
  jugador: JugadorRival;
  paleta: PaletaRival;
  atenuado: boolean;
  deshabilitado?: boolean;
  onMenuContextual: (jugadorRivalId: string, clienteX: number, clienteY: number) => void;
}

const UMBRAL_PULSACION_LARGA_MS = 550;
const DIAMETRO_RIVAL = 54; // ~15% menos que la tarjeta propia (64px en 'md')

export function TarjetaRivalDraggable({ jugador, paleta, atenuado, deshabilitado, onMenuContextual }: TarjetaRivalDraggableProps) {
  const { attributes, listeners, setNodeRef, estilo, isDragging } = useDragEnCampo(
    `rival-${jugador.id}`,
    jugador.x,
    jugador.y,
    { tipoArrastre: 'rival', jugadorRivalId: jugador.id } satisfies DatosArrastreRival,
    deshabilitado,
    8,
  );
  const colores = PALETA_RIVAL[paleta];
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function limpiarTemporizador(): void {
    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
  }

  function manejarPointerDown(evento: ReactPointerEvent): void {
    listeners?.onPointerDown?.(evento);
    const { clientX, clientY } = evento;
    temporizadorRef.current = setTimeout(() => onMenuContextual(jugador.id, clientX, clientY), UMBRAL_PULSACION_LARGA_MS);
  }

  return (
    <div
      ref={setNodeRef}
      style={estilo}
      className="touch-none"
      {...attributes}
      {...listeners}
      onPointerDown={manejarPointerDown}
      onPointerUp={limpiarTemporizador}
      onPointerMove={limpiarTemporizador}
      onPointerLeave={limpiarTemporizador}
      onContextMenu={(evento) => {
        evento.preventDefault();
        onMenuContextual(jugador.id, evento.clientX, evento.clientY);
      }}
    >
      <div
        className={`sin-seleccion flex flex-col items-center gap-0.5 transition-opacity duration-base ${atenuado ? 'opacity-70' : 'opacity-100'}`}
        style={{ width: DIAMETRO_RIVAL + 16 }}
      >
        <div
          className={`relative flex items-center justify-center rounded-full border-2 border-black/30 font-display font-extrabold shadow-tarjeta ${isDragging ? 'shadow-elevada' : ''}`}
          style={{ width: DIAMETRO_RIVAL, height: DIAMETRO_RIVAL, background: colores.principal, color: colores.texto, fontSize: DIAMETRO_RIVAL * 0.32 }}
        >
          {jugador.dorsal}
          <span className="absolute -bottom-1 whitespace-nowrap rounded-full bg-black/70 px-1.5 py-0.5 font-display text-[8px] font-semibold uppercase tracking-wide text-white ring-1 ring-white/10">
            {jugador.posicion}
          </span>
        </div>
        {jugador.apellido && (
          <span className="w-full truncate text-center font-display text-[10px] font-semibold uppercase tracking-wide text-white/90">
            {jugador.apellido}
          </span>
        )}
      </div>
    </div>
  );
}

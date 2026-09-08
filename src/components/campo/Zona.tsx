import { useEscalaCampo } from '../../hooks/useCampoEscala';
import type { ZonaFormacion } from '../../types';

interface ZonaProps {
  zona: ZonaFormacion;
  indice: number;
  deshabilitada: boolean;
  onSeleccionar: () => void;
}

export function Zona({ zona, indice, deshabilitada, onSeleccionar }: ZonaProps) {
  const { aPixeles } = useEscalaCampo();
  const punto = aPixeles({ x: zona.x, y: zona.y });

  return (
    <button
      type="button"
      disabled={deshabilitada}
      onClick={onSeleccionar}
      aria-label={`Zona vacía: asignar jugador en la posición ${zona.posicion}`}
      className="sin-seleccion absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 animar-entrada-zona items-center justify-center rounded-full border-2 border-dashed border-white/50 bg-white/5 font-display text-xs font-semibold tracking-wide text-white/80 backdrop-blur-[1px] transition-colors duration-base hover:border-club-rojo hover:bg-club-rojo/15 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30 sm:h-14 sm:w-14 sm:text-sm"
      style={{ left: punto.x, top: punto.y, animationDelay: `${indice * 30}ms` }}
    >
      {zona.posicion}
    </button>
  );
}

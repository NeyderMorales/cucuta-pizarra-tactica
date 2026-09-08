import { useEscalaCampo } from '../../hooks/useCampoEscala';
import type { ZonaFormacion } from '../../types';

interface ZonaRivalProps {
  zona: ZonaFormacion;
  indice: number;
  deshabilitada: boolean;
  onSeleccionar: () => void;
}

/** Zona fantasma del rival (FA4): mismo comportamiento que `Zona`, en gris frío para no competir con el rojinegro propio. */
export function ZonaRival({ zona, indice, deshabilitada, onSeleccionar }: ZonaRivalProps) {
  const { aPixeles } = useEscalaCampo();
  const punto = aPixeles({ x: zona.x, y: zona.y });

  return (
    <button
      type="button"
      disabled={deshabilitada}
      onClick={onSeleccionar}
      aria-label={`Zona rival vacía: añadir jugador en la posición ${zona.posicion}`}
      className="sin-seleccion absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 animar-entrada-zona items-center justify-center rounded-full border-2 border-dashed border-slate-300/50 bg-slate-500/10 font-display text-[11px] font-semibold tracking-wide text-slate-200/80 backdrop-blur-[1px] transition-colors duration-base hover:border-slate-200 hover:bg-slate-400/20 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30 sm:h-12 sm:w-12"
      style={{ left: punto.x, top: punto.y, animationDelay: `${indice * 30}ms` }}
    >
      {zona.posicion}
    </button>
  );
}

import { memo } from 'react';
import type { Jugador } from '../../types';

/** `compacto` se usa solo con los dos equipos en pantalla (FA4 "Ambos"), donde 22 tarjetas a 64px saturan el campo. */
export type TamanoTarjeta = 'sm' | 'compacto' | 'md' | 'lg';

interface TarjetaJugadorProps {
  jugador: Jugador;
  tamano?: TamanoTarjeta;
  esCapitan?: boolean;
  seleccionado?: boolean;
  arrastrando?: boolean;
  atenuado?: boolean;
  nota?: string;
}

const DIAMETRO: Record<TamanoTarjeta, number> = { sm: 48, compacto: 56, md: 64, lg: 80 };

function obtenerIniciales(jugador: Jugador): string {
  return `${jugador.nombre.charAt(0)}${jugador.apellido.charAt(0)}`.toUpperCase();
}

export const TarjetaJugador = memo(function TarjetaJugador({
  jugador,
  tamano = 'md',
  esCapitan = false,
  seleccionado = false,
  arrastrando = false,
  atenuado = false,
  nota,
}: TarjetaJugadorProps) {
  const diametro = DIAMETRO[tamano];
  return (
    <div
      className={`sin-seleccion flex flex-col items-center gap-1 transition-opacity duration-base ${atenuado ? 'opacity-40' : 'opacity-100'}`}
      style={{ width: diametro + 26 }}
    >
      <div
        className={`relative flex items-center justify-center rounded-full border-2 font-display font-extrabold text-white shadow-tarjeta transition-shadow duration-base ${
          seleccionado ? 'border-club-rojo ring-4 ring-club-rojo/40' : 'border-club-negro'
        } ${arrastrando ? 'shadow-elevada' : ''}`}
        style={{
          width: diametro,
          height: diametro,
          background: jugador.fotoUrl ? undefined : 'linear-gradient(135deg, #D4111E 0%, #1A1A1D 100%)',
          fontSize: diametro * 0.32,
        }}
      >
        {jugador.fotoUrl ? (
          <img src={jugador.fotoUrl} alt="" className="h-full w-full rounded-full object-cover" draggable={false} />
        ) : (
          obtenerIniciales(jugador)
        )}

        <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-club-negro px-1 font-display text-[11px] font-bold text-white ring-1 ring-white/30">
          {jugador.dorsal}
        </span>

        {esCapitan && (
          <span
            className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-club-negro ring-1 ring-white/40"
            title="Capitán"
            aria-label="Capitán"
          >
            C
          </span>
        )}

        <span className="absolute -bottom-1 whitespace-nowrap rounded-full bg-club-negro/90 px-1.5 py-0.5 font-display text-[9px] font-semibold uppercase tracking-wide text-club-plata ring-1 ring-white/10">
          {jugador.posicionNatural}
        </span>

        {nota && (
          <span
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] ring-1 ring-white/40"
            title={nota}
            aria-label={`Nota: ${nota}`}
          >
            📝
          </span>
        )}
      </div>
      <span className="w-full truncate text-center font-display text-[11px] font-semibold uppercase tracking-wide text-white sm:text-xs">
        {jugador.apellido}
      </span>
    </div>
  );
});

import { Modal } from '../ui/Modal';
import type { JugadorRival } from '../../types';

interface ModalElegirRivalParaMarcarProps {
  abierto: boolean;
  jugadoresRival: JugadorRival[];
  onCerrar: () => void;
  onElegir: (jugadorRivalId: string) => void;
}

export function ModalElegirRivalParaMarcar({ abierto, jugadoresRival, onCerrar, onElegir }: ModalElegirRivalParaMarcarProps) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Marcar a…" ancho="sm">
      {jugadoresRival.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-club-plata/60">
          No hay jugadores rivales en el campo todavía.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {jugadoresRival.map((jugador) => (
            <li key={jugador.id}>
              <button
                type="button"
                onClick={() => {
                  onElegir(jugador.id);
                  onCerrar();
                }}
                className="flex min-h-[44px] w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left hover:border-club-rojo/50 hover:bg-white/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-500 font-display text-xs font-bold text-white">
                  {jugador.dorsal}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-display text-sm font-semibold uppercase tracking-wide text-white">
                    {jugador.apellido || `Rival #${jugador.dorsal}`}
                  </span>
                  <span className="text-xs text-club-plata/60">{jugador.posicion}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

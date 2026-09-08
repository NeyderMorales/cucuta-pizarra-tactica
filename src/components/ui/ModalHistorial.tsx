import { Modal } from './Modal';
import { useAlineacionStore } from '../../store/alineacionStore';

interface ModalHistorialProps {
  abierto: boolean;
  onCerrar: () => void;
}

/**
 * Lista el historial en orden "más reciente arriba": el futuro (rehacer)
 * queda por encima de "Ahora" y el pasado (deshacer) por debajo, cada uno
 * ordenado de lo más cercano al presente hacia lo más lejano. Pulsar
 * cualquier paso salta directo a él, sin deshacer/rehacer uno por uno.
 */
export function ModalHistorial({ abierto, onCerrar }: ModalHistorialProps) {
  const historial = useAlineacionStore((s) => s.historial);
  const irAPasado = useAlineacionStore((s) => s.irAPasado);
  const irAFuturo = useAlineacionStore((s) => s.irAFuturo);

  const futuroDescendente = [...historial.futuro].reverse();
  const pasadoDescendente = [...historial.pasado].reverse();
  const sinHistorial = historial.pasado.length === 0 && historial.futuro.length === 0;

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Historial de cambios" ancho="sm">
      {sinHistorial ? (
        <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-club-plata/60">
          Todavía no hay cambios registrados en esta sesión.
        </p>
      ) : (
        <ul className="barra-scroll flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
          {futuroDescendente.map((paso, indiceDescendente) => {
            const indiceReal = historial.futuro.length - 1 - indiceDescendente;
            return (
              <li key={`futuro-${indiceReal}`}>
                <button
                  type="button"
                  onClick={() => {
                    irAFuturo(indiceReal);
                    onCerrar();
                  }}
                  className="flex min-h-[40px] w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-club-plata/60 transition-colors duration-rapido hover:bg-white/5 hover:text-white"
                >
                  <span className="truncate">{paso.etiqueta}</span>
                  <span className="ml-2 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-club-plata/40">
                    Rehacer
                  </span>
                </button>
              </li>
            );
          })}

          <li>
            <div className="flex min-h-[40px] items-center justify-between rounded-lg border border-club-rojo bg-club-rojo/10 px-3 py-2 text-sm font-semibold text-white">
              <span className="truncate">{historial.etiquetaPresente}</span>
              <span className="ml-2 shrink-0 text-[10px] font-bold uppercase tracking-wide text-club-rojo">Ahora</span>
            </div>
          </li>

          {pasadoDescendente.map((paso, indiceDescendente) => {
            const indiceReal = historial.pasado.length - 1 - indiceDescendente;
            return (
              <li key={`pasado-${indiceReal}`}>
                <button
                  type="button"
                  onClick={() => {
                    irAPasado(indiceReal);
                    onCerrar();
                  }}
                  className="flex min-h-[40px] w-full items-center rounded-lg px-3 py-2 text-left text-sm text-white transition-colors duration-rapido hover:bg-white/5"
                >
                  <span className="truncate">{paso.etiqueta}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

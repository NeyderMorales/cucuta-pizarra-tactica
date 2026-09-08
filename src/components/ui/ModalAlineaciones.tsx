import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Boton } from './Boton';
import { useAlineacionStore } from '../../store/alineacionStore';
import { obtenerFormacion } from '../../data/formaciones';

interface ModalAlineacionesProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function ModalAlineaciones({ abierto, onCerrar }: ModalAlineacionesProps) {
  const listado = useAlineacionStore((s) => s.listado);
  const idActual = useAlineacionStore((s) => s.id);
  const refrescarListado = useAlineacionStore((s) => s.refrescarListado);
  const cargarAlineacion = useAlineacionStore((s) => s.cargarAlineacion);
  const nuevaAlineacion = useAlineacionStore((s) => s.nuevaAlineacion);
  const duplicarActual = useAlineacionStore((s) => s.duplicarActual);
  const eliminarAlineacion = useAlineacionStore((s) => s.eliminarAlineacion);

  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState<string | null>(null);

  useEffect(() => {
    if (abierto) void refrescarListado();
    if (!abierto) setConfirmandoEliminarId(null);
  }, [abierto, refrescarListado]);

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Alineaciones guardadas" ancho="md">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Boton
            variante="primario"
            tamano="sm"
            onClick={() => {
              nuevaAlineacion();
              onCerrar();
            }}
          >
            + Nueva alineación
          </Boton>
          <Boton variante="secundario" tamano="sm" onClick={() => void duplicarActual()}>
            Duplicar actual
          </Boton>
        </div>

        {listado.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-club-plata/60">
            Aún no hay alineaciones guardadas. Mueve un jugador y se guardará automáticamente.
          </p>
        ) : (
          <ul className="barra-scroll flex max-h-[50vh] flex-col gap-1.5 overflow-y-auto">
            {listado.map((item) => {
              const formacion = obtenerFormacion(item.formacionId);
              const activa = item.id === idActual;
              return (
                <li
                  key={item.id}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${
                    activa ? 'border-club-rojo bg-club-rojo/10' : 'border-white/10'
                  }`}
                >
                  <button
                    type="button"
                    disabled={activa}
                    onClick={() => {
                      void cargarAlineacion(item.id);
                      onCerrar();
                    }}
                    className="flex min-w-0 flex-1 flex-col text-left disabled:cursor-default"
                  >
                    <span className="truncate font-display text-sm font-semibold uppercase tracking-wide text-white">
                      {item.nombre || 'Sin nombre'}
                      {activa && <span className="ml-2 text-[10px] font-medium normal-case text-club-rojo">actual</span>}
                    </span>
                    <span className="text-xs text-club-plata/60">
                      {formacion?.nombre ?? '—'} ·{' '}
                      {new Date(item.modificadaEn).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </button>

                  {confirmandoEliminarId === item.id ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <Boton
                        tamano="sm"
                        variante="peligro"
                        onClick={() => {
                          void eliminarAlineacion(item.id);
                          setConfirmandoEliminarId(null);
                        }}
                      >
                        Confirmar
                      </Boton>
                      <Boton tamano="sm" variante="fantasma" onClick={() => setConfirmandoEliminarId(null)}>
                        Cancelar
                      </Boton>
                    </div>
                  ) : (
                    <Boton
                      tamano="icono"
                      variante="fantasma"
                      aria-label={`Eliminar ${item.nombre}`}
                      onClick={() => setConfirmandoEliminarId(item.id)}
                    >
                      🗑
                    </Boton>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}

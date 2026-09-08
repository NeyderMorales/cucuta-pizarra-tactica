import { useState } from 'react';
import { usePizarraStore } from '../../store/pizarraStore';
import { useAlineacionStore } from '../../store/alineacionStore';
import { Boton } from '../ui/Boton';
import { Modal } from '../ui/Modal';
import { GROSORES_DIBUJO, HERRAMIENTAS_DIBUJO, PALETA_DIBUJO } from '../../utils/constantes';
import type { Herramienta } from '../../types';

const ICONOS: Record<Herramienta, string> = {
  seleccion: '↖',
  libre: '✏️',
  flecha: '➜',
  discontinua: '┄',
  zona: '⬭',
  texto: 'T',
  borrador: '⌫',
};

export function BarraHerramientas() {
  const herramienta = usePizarraStore((s) => s.herramienta);
  const setHerramienta = usePizarraStore((s) => s.setHerramienta);
  const color = usePizarraStore((s) => s.color);
  const setColor = usePizarraStore((s) => s.setColor);
  const grosor = usePizarraStore((s) => s.grosor);
  const setGrosor = usePizarraStore((s) => s.setGrosor);

  const puedeDeshacer = useAlineacionStore((s) => s.puedeDeshacer());
  const puedeRehacer = useAlineacionStore((s) => s.puedeRehacer());
  const deshacer = useAlineacionStore((s) => s.deshacer);
  const rehacer = useAlineacionStore((s) => s.rehacer);
  const limpiarTrazos = useAlineacionStore((s) => s.limpiarTrazos);

  const [confirmandoLimpiar, setConfirmandoLimpiar] = useState(false);

  return (
    <div className="superficie-vidrio flex flex-wrap items-center gap-2 rounded-xl border border-white/10 px-3 py-2 shadow-tarjeta">
      <div className="flex items-center gap-1" role="group" aria-label="Herramientas de dibujo">
        {HERRAMIENTAS_DIBUJO.map((h) => (
          <Boton
            key={h.id}
            tamano="icono"
            activo={herramienta === h.id}
            title={h.etiqueta}
            aria-label={h.etiqueta}
            onClick={() => setHerramienta(h.id)}
          >
            {ICONOS[h.id]}
          </Boton>
        ))}
      </div>

      <span className="mx-1 h-6 w-px bg-white/10" />

      <div className="flex items-center gap-1.5" role="group" aria-label="Color de trazo">
        {PALETA_DIBUJO.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Color ${c}`}
            aria-pressed={color === c}
            onClick={() => setColor(c)}
            className={`h-7 w-7 rounded-full border-2 transition-transform duration-rapido active:scale-90 ${
              color === c ? 'scale-110 border-white' : 'border-white/20'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <span className="mx-1 h-6 w-px bg-white/10" />

      <div className="flex items-center gap-1" role="group" aria-label="Grosor de trazo">
        {GROSORES_DIBUJO.map((g) => (
          <Boton key={g} tamano="icono" activo={grosor === g} aria-label={`Grosor ${g}`} onClick={() => setGrosor(g)}>
            <span className="rounded-full bg-current" style={{ width: g * 3 + 3, height: g * 3 + 3 }} />
          </Boton>
        ))}
      </div>

      <span className="mx-1 h-6 w-px bg-white/10" />

      <div className="flex items-center gap-1">
        <Boton tamano="icono" disabled={!puedeDeshacer} onClick={deshacer} aria-label="Deshacer" title="Deshacer (Ctrl+Z)">
          ↶
        </Boton>
        <Boton tamano="icono" disabled={!puedeRehacer} onClick={rehacer} aria-label="Rehacer" title="Rehacer (Ctrl+Shift+Z)">
          ↷
        </Boton>
        <Boton
          tamano="icono"
          variante="peligro"
          onClick={() => setConfirmandoLimpiar(true)}
          aria-label="Limpiar pizarra"
          title="Limpiar pizarra"
        >
          🗑
        </Boton>
      </div>

      <Modal abierto={confirmandoLimpiar} onCerrar={() => setConfirmandoLimpiar(false)} titulo="Limpiar pizarra" ancho="sm">
        <p className="text-sm text-club-plata">
          Se eliminarán todos los trazos dibujados sobre el campo. Esta acción no afecta a los jugadores.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Boton variante="fantasma" onClick={() => setConfirmandoLimpiar(false)}>
            Cancelar
          </Boton>
          <Boton
            variante="peligro"
            onClick={() => {
              limpiarTrazos();
              setConfirmandoLimpiar(false);
            }}
          >
            Limpiar
          </Boton>
        </div>
      </Modal>
    </div>
  );
}

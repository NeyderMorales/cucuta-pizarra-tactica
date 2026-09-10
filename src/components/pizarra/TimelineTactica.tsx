import { useEffect, useRef, useState } from 'react';
import { useAlineacionStore } from '../../store/alineacionStore';
import { useReproduccionStore } from '../../store/reproduccionStore';
import { ControlesReproduccion } from './ControlesReproduccion';
import { Boton } from '../ui/Boton';

/**
 * Línea de tiempo de la jugada (frames). Solo se monta cuando hay una secuencia
 * abierta; mientras no la haya, la pizarra se comporta como siempre.
 *
 * El frame activo se captura solo al cambiar de frame (ver `capturarFrameActivo`
 * en el store), así que aquí no hay ningún botón de "guardar frame".
 */
export function TimelineTactica() {
  const secuencia = useAlineacionStore((s) => s.historial.presente.secuencia);
  const irAFrame = useAlineacionStore((s) => s.irAFrame);
  const agregarFrame = useAlineacionStore((s) => s.agregarFrame);
  const duplicarFrame = useAlineacionStore((s) => s.duplicarFrame);
  const eliminarFrame = useAlineacionStore((s) => s.eliminarFrame);
  const renombrarFrame = useAlineacionStore((s) => s.renombrarFrame);
  const descartarSecuencia = useAlineacionStore((s) => s.descartarSecuencia);

  const reproduciendo = useReproduccionStore((s) => s.reproduciendo);
  const indiceEnReproduccion = useReproduccionStore((s) => s.indiceFrame);
  const setIndiceFrame = useReproduccionStore((s) => s.setIndiceFrame);

  const listaRef = useRef<HTMLDivElement>(null);
  const [nombre, setNombre] = useState('');

  // Mientras se reproduce manda el índice de reproducción; editando, el del documento.
  const indiceActivo = reproduciendo ? indiceEnReproduccion : (secuencia?.indiceActivo ?? 0);
  const frameActivo = secuencia?.frames[indiceActivo];

  useEffect(() => {
    setNombre(frameActivo?.nombre ?? '');
  }, [frameActivo?.id, frameActivo?.nombre]);

  // Mantiene a la vista el frame activo cuando la jugada es larga y hay scroll.
  useEffect(() => {
    listaRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [indiceActivo]);

  if (!secuencia) return null;

  return (
    <div className="superficie-vidrio flex flex-col gap-2 border-t border-white/10 px-2 py-2 sm:px-4">
      <div className="flex items-center gap-2">
        <span className="shrink-0 font-display text-[11px] font-semibold uppercase tracking-wide text-club-plata/70">
          Jugada · {secuencia.frames.length} {secuencia.frames.length === 1 ? 'frame' : 'frames'}
        </span>

        <input
          value={nombre}
          disabled={reproduciendo}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => renombrarFrame(indiceActivo, nombre)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          maxLength={30}
          placeholder={`Nombrar frame ${indiceActivo + 1}…`}
          aria-label={`Nombre del frame ${indiceActivo + 1}`}
          className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 text-xs text-white placeholder:text-club-plata/40 outline-none focus:border-club-rojo"
        />

        <Boton tamano="sm" variante="fantasma" onClick={descartarSecuencia} title="Cerrar la jugada y volver a la pizarra">
          Cerrar jugada
        </Boton>
      </div>

      <div className="flex items-center gap-2">
        <ControlesReproduccion />

        <div ref={listaRef} className="barra-scroll flex flex-1 items-center gap-1.5 overflow-x-auto pb-1">
          {secuencia.frames.map((frame, indice) => {
            const activo = indice === indiceActivo;
            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => {
                  setIndiceFrame(indice);
                  irAFrame(indice);
                }}
                aria-current={activo}
                aria-label={`Frame ${indice + 1}${frame.nombre ? `: ${frame.nombre}` : ''}`}
                className={`flex h-11 min-w-[64px] shrink-0 flex-col items-center justify-center rounded-lg border px-2.5 transition-colors duration-rapido ${
                  activo
                    ? 'border-club-rojo bg-club-rojo/20 text-white'
                    : 'border-white/10 bg-white/5 text-club-plata hover:border-club-rojo/50 hover:text-white'
                }`}
              >
                <span className="font-display text-sm font-bold leading-none">{indice + 1}</span>
                {frame.nombre && <span className="mt-0.5 max-w-[72px] truncate text-[10px] leading-none">{frame.nombre}</span>}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Boton tamano="sm" variante="secundario" onClick={agregarFrame} title="Añadir un frame copiando el estado actual">
            ＋ Frame
          </Boton>
          <Boton
            tamano="icono"
            variante="secundario"
            onClick={() => duplicarFrame(indiceActivo)}
            aria-label="Duplicar este frame"
            title="Duplicar este frame"
          >
            ⧉
          </Boton>
          <Boton
            tamano="icono"
            variante="peligro"
            disabled={secuencia.frames.length <= 1}
            onClick={() => eliminarFrame(indiceActivo)}
            aria-label="Eliminar este frame"
            title={secuencia.frames.length <= 1 ? 'La jugada necesita al menos un frame' : 'Eliminar este frame'}
          >
            🗑
          </Boton>
        </div>
      </div>
    </div>
  );
}

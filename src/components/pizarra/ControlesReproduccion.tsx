import { useAlineacionStore } from '../../store/alineacionStore';
import { useReproduccionStore, VELOCIDADES } from '../../store/reproduccionStore';
import { Boton } from '../ui/Boton';

/**
 * Mandos de la jugada. Al pausar (o al saltar de frame a mano) el documento se
 * deja en el frame donde se paró, de modo que el entrenador puede seguir
 * editando justo desde ahí, y eso cuenta como un único paso de historial.
 */
export function ControlesReproduccion() {
  const secuencia = useAlineacionStore((s) => s.historial.presente.secuencia);
  const irAFrame = useAlineacionStore((s) => s.irAFrame);

  const reproduciendo = useReproduccionStore((s) => s.reproduciendo);
  const velocidad = useReproduccionStore((s) => s.velocidad);
  const indiceFrame = useReproduccionStore((s) => s.indiceFrame);
  const reproducir = useReproduccionStore((s) => s.reproducir);
  const pausar = useReproduccionStore((s) => s.pausar);
  const setIndiceFrame = useReproduccionStore((s) => s.setIndiceFrame);
  const setVelocidad = useReproduccionStore((s) => s.setVelocidad);

  if (!secuencia) return null;
  const jugada = secuencia;
  const total = jugada.frames.length;
  // Reproduciendo manda el índice de reproducción; editando, el del documento
  // (que cambia al añadir frames o al tocar un chip de la timeline).
  const indiceEfectivo = reproduciendo ? indiceFrame : jugada.indiceActivo;
  const enElUltimo = indiceEfectivo >= total - 1;

  function saltarA(indice: number): void {
    const destino = Math.max(0, Math.min(total - 1, indice));
    pausar();
    setIndiceFrame(destino);
    irAFrame(destino);
  }

  function alternarReproduccion(): void {
    if (reproduciendo) {
      // Pausa: el tablero se queda en el frame que se estaba reproduciendo.
      pausar();
      irAFrame(indiceFrame);
      return;
    }
    // Desde el último frame, reproducir vuelve a empezar en lugar de no hacer nada.
    if (enElUltimo) {
      setIndiceFrame(0);
      irAFrame(0);
    } else {
      setIndiceFrame(indiceEfectivo);
      // Vuelca al frame activo lo que se acabe de editar: la reproducción lee
      // los frames guardados, no el documento en pantalla.
      irAFrame(indiceEfectivo);
    }
    reproducir();
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Boton
        tamano="icono"
        variante="secundario"
        disabled={indiceEfectivo === 0}
        onClick={() => saltarA(indiceEfectivo - 1)}
        aria-label="Frame anterior"
        title="Frame anterior"
      >
        ⏮
      </Boton>

      <Boton
        tamano="icono"
        variante="primario"
        onClick={alternarReproduccion}
        aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}
        title={reproduciendo ? 'Pausar' : enElUltimo ? 'Reproducir desde el principio' : 'Reproducir'}
      >
        {reproduciendo ? '⏸' : '▶'}
      </Boton>

      <Boton
        tamano="icono"
        variante="secundario"
        disabled={enElUltimo}
        onClick={() => saltarA(indiceEfectivo + 1)}
        aria-label="Frame siguiente"
        title="Frame siguiente"
      >
        ⏭
      </Boton>

      <Boton
        tamano="icono"
        variante="secundario"
        onClick={() => saltarA(0)}
        aria-label="Reiniciar la jugada"
        title="Volver al primer frame"
      >
        ↻
      </Boton>

      <select
        value={velocidad}
        onChange={(e) => setVelocidad(Number(e.target.value) as (typeof VELOCIDADES)[number])}
        aria-label="Velocidad de reproducción"
        title="Velocidad de reproducción"
        className="h-11 rounded-lg border border-white/10 bg-white/5 px-2 text-xs font-medium text-white outline-none focus:border-club-rojo"
      >
        {VELOCIDADES.map((v) => (
          <option key={v} value={v} className="bg-club-carbon">
            {v}x
          </option>
        ))}
      </select>
    </div>
  );
}

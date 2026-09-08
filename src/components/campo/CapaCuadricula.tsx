import { useMemo } from 'react';
import type { ColorCelda, CuadriculaCampo, Orientacion } from '../../types';
import { claveCelda } from '../../utils/anexoA';
import { ETIQUETAS_CARRILES_5 } from '../../utils/constantes';

interface CapaCuadriculaProps {
  cuadricula: CuadriculaCampo;
  orientacion: Orientacion;
  interactiva: boolean;
  onPintarCelda: (columna: number, fila: number) => void;
}

const COLOR_CELDA_HEX: Record<ColorCelda, string> = {
  rojo: '#D4111E',
  ambar: '#F59E0B',
  azul: '#3B82F6',
};

function estiloCelda(col: number, fila: number, columnas: number, filas: number, orientacion: Orientacion) {
  const x0 = (col / columnas) * 100;
  const x1 = ((col + 1) / columnas) * 100;
  const y0 = (fila / filas) * 100;
  const y1 = ((fila + 1) / filas) * 100;
  // Mismo criterio de intercambio de ejes que `porcentajeAPixeles`: en horizontal,
  // el eje de columnas (ancho de banda) pasa a la pantalla en vertical y viceversa.
  if (orientacion === 'vertical') {
    return { left: `${x0}%`, top: `${y0}%`, width: `${x1 - x0}%`, height: `${y1 - y0}%` };
  }
  return { left: `${y0}%`, top: `${x0}%`, width: `${y1 - y0}%`, height: `${x1 - x0}%` };
}

/** Mismo intercambio de ejes que `estiloCelda`, para un punto de intersección en vez de un rectángulo. */
function estiloPunto(fraccionCol: number, fraccionFila: number, orientacion: Orientacion) {
  const x = fraccionCol * 100;
  const y = fraccionFila * 100;
  return orientacion === 'vertical' ? { left: `${x}%`, top: `${y}%` } : { left: `${y}%`, top: `${x}%` };
}

export function CapaCuadricula({ cuadricula, orientacion, interactiva, onPintarCelda }: CapaCuadriculaProps) {
  const { preset, columnas, filas, opacidad, estiloLinea, mostrarEtiquetas, celdasPintadas } = cuadricula;

  const celdas = useMemo(() => {
    if (preset === 'off' || columnas === 0 || filas === 0) return [];
    const lista: { col: number; fila: number }[] = [];
    for (let c = 0; c < columnas; c++) {
      for (let f = 0; f < filas; f++) lista.push({ col: c, fila: f });
    }
    return lista;
  }, [preset, columnas, filas]);

  // Estilo "puntos" (Fase B): marcas solo en las intersecciones internas de la
  // rejilla, no un borde punteado en cada celda — las celdas siguen existiendo
  // debajo (sin borde) para conservar el clic de pintado.
  const intersecciones = useMemo(() => {
    if (estiloLinea !== 'puntos' || columnas < 2 || filas < 2) return [];
    const lista: { col: number; fila: number }[] = [];
    for (let c = 1; c < columnas; c++) {
      for (let f = 1; f < filas; f++) lista.push({ col: c, fila: f });
    }
    return lista;
  }, [estiloLinea, columnas, filas]);

  if (celdas.length === 0) return null;

  const claseBorde = estiloLinea === 'discontinua' ? 'border-dashed' : estiloLinea === 'puntos' ? '' : 'border-solid';

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={!interactiva}>
      {celdas.map(({ col, fila }) => {
        const clave = claveCelda(col, fila);
        const colorPintado = celdasPintadas[clave];
        const etiqueta = mostrarEtiquetas
          ? columnas === 5 && filas === 1
            ? ETIQUETAS_CARRILES_5[col]
            : `Z${fila * columnas + col + 1}`
          : null;
        return (
          <div
            key={clave}
            className={`absolute ${claseBorde} border-white/40 ${interactiva ? 'pointer-events-auto cursor-pointer' : ''}`}
            style={{
              ...estiloCelda(col, fila, columnas, filas, orientacion),
              borderWidth: estiloLinea === 'puntos' ? 0 : preset === 'mitades' ? 2 : 1,
              backgroundColor: colorPintado ? COLOR_CELDA_HEX[colorPintado] : 'transparent',
              opacity: colorPintado ? 0.22 : opacidad,
            }}
            onClick={interactiva ? () => onPintarCelda(col, fila) : undefined}
            role={interactiva ? 'button' : undefined}
            aria-label={interactiva ? `Pintar zona ${etiqueta ?? clave}` : undefined}
          >
            {etiqueta && (
              <span className="absolute left-1 top-1 font-display text-[10px] font-bold uppercase tracking-wide text-white/70">
                {etiqueta}
              </span>
            )}
          </div>
        );
      })}
      {intersecciones.map(({ col, fila }) => (
        <span
          key={`punto-${col}-${fila}`}
          className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
          style={estiloPunto(col / columnas, fila / filas, orientacion)}
        />
      ))}
    </div>
  );
}

import { produce, type Draft } from 'immer';
import { LIMITE_HISTORIAL } from '../utils/constantes';

export interface PasoHistorial<T> {
  estado: T;
  etiqueta: string;
}

export interface Historial<T> {
  pasado: PasoHistorial<T>[];
  presente: T;
  etiquetaPresente: string;
  futuro: PasoHistorial<T>[];
}

export function crearHistorial<T>(presente: T, etiqueta = 'Alineación inicial'): Historial<T> {
  return { pasado: [], presente, etiquetaPresente: etiqueta, futuro: [] };
}

/** Aplica una receta Immer sobre el presente y apila el estado anterior, etiquetado, (máx. LIMITE_HISTORIAL). */
export function actualizarHistorial<T>(
  historial: Historial<T>,
  receta: (borrador: Draft<T>) => void,
  etiqueta: string,
): Historial<T> {
  const nuevoPresente = produce(historial.presente, receta);
  if (nuevoPresente === historial.presente) return historial;
  const pasado = [...historial.pasado, { estado: historial.presente, etiqueta: historial.etiquetaPresente }].slice(
    -LIMITE_HISTORIAL,
  );
  return { pasado, presente: nuevoPresente, etiquetaPresente: etiqueta, futuro: [] };
}

export function deshacerHistorial<T>(historial: Historial<T>): Historial<T> {
  if (historial.pasado.length === 0) return historial;
  const anterior = historial.pasado[historial.pasado.length - 1]!;
  return {
    pasado: historial.pasado.slice(0, -1),
    presente: anterior.estado,
    etiquetaPresente: anterior.etiqueta,
    futuro: [{ estado: historial.presente, etiqueta: historial.etiquetaPresente }, ...historial.futuro],
  };
}

export function rehacerHistorial<T>(historial: Historial<T>): Historial<T> {
  if (historial.futuro.length === 0) return historial;
  const [siguiente, ...resto] = historial.futuro;
  return {
    pasado: [...historial.pasado, { estado: historial.presente, etiqueta: historial.etiquetaPresente }].slice(
      -LIMITE_HISTORIAL,
    ),
    presente: siguiente!.estado,
    etiquetaPresente: siguiente!.etiqueta,
    futuro: resto,
  };
}

/** Salta directamente a un paso ya vivido (0 = más antiguo), sin pasar por cada deshacer intermedio. */
export function saltarAPasado<T>(historial: Historial<T>, indice: number): Historial<T> {
  if (indice < 0 || indice >= historial.pasado.length) return historial;
  const objetivo = historial.pasado[indice]!;
  const nuevoPasado = historial.pasado.slice(0, indice);
  const nuevoFuturo = [
    ...historial.pasado.slice(indice + 1),
    { estado: historial.presente, etiqueta: historial.etiquetaPresente },
    ...historial.futuro,
  ];
  return { pasado: nuevoPasado, presente: objetivo.estado, etiquetaPresente: objetivo.etiqueta, futuro: nuevoFuturo };
}

/** Salta directamente a un paso del futuro (0 = el siguiente por rehacer). */
export function saltarAFuturo<T>(historial: Historial<T>, indice: number): Historial<T> {
  if (indice < 0 || indice >= historial.futuro.length) return historial;
  const objetivo = historial.futuro[indice]!;
  const nuevoPasado = [
    ...historial.pasado,
    { estado: historial.presente, etiqueta: historial.etiquetaPresente },
    ...historial.futuro.slice(0, indice),
  ].slice(-LIMITE_HISTORIAL);
  const nuevoFuturo = historial.futuro.slice(indice + 1);
  return { pasado: nuevoPasado, presente: objetivo.estado, etiquetaPresente: objetivo.etiqueta, futuro: nuevoFuturo };
}

/** Reemplaza el presente sin apilar deshacer (usado al cargar una alineación distinta). */
export function reiniciarHistorial<T>(nuevoPresente: T, etiqueta = 'Alineación cargada'): Historial<T> {
  return { pasado: [], presente: nuevoPresente, etiquetaPresente: etiqueta, futuro: [] };
}

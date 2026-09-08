import type { Alineacion, Formacion, Jugador, JugadorEnCampo, Orientacion } from '../types';
import { porcentajeAPixeles } from './coordenadas';

const ESCALA_EXPORTACION = 2;
const ALTO_ENCABEZADO = 56;

export interface DatosExportacion {
  alineacion: Alineacion;
  formacion: Formacion | undefined;
  obtenerJugador: (id: string) => Jugador | undefined;
  svgCampo: SVGSVGElement;
  canvasDibujo: HTMLCanvasElement | null;
  anchoContenedor: number;
  altoContenedor: number;
  orientacion: Orientacion;
  nombreClub?: string;
}

function svgAImagen(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const cadena = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([cadena], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => {
      URL.revokeObjectURL(url);
      resolve(imagen);
    };
    imagen.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    imagen.src = url;
  });
}

function dibujarJugadorEnLienzo(
  ctx: CanvasRenderingContext2D,
  jugador: Jugador,
  titular: JugadorEnCampo,
  ancho: number,
  alto: number,
  offsetY: number,
  orientacion: Orientacion,
): void {
  const punto = porcentajeAPixeles({ x: titular.x, y: titular.y }, { ancho, alto }, orientacion);
  const cx = punto.x;
  const cy = punto.y + offsetY;
  const radio = 20;

  const degradado = ctx.createLinearGradient(cx - radio, cy - radio, cx + radio, cy + radio);
  degradado.addColorStop(0, '#D4111E');
  degradado.addColorStop(1, '#1a1a1d');
  ctx.beginPath();
  ctx.arc(cx, cy, radio, 0, Math.PI * 2);
  ctx.fillStyle = degradado;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = titular.esCapitan ? '#FFC107' : '#111111';
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 15px Arial';
  ctx.fillText(String(jugador.dorsal), cx, cy - 3);

  const etiqueta = jugador.apellido.toUpperCase();
  const anchoEtiqueta = Math.max(38, etiqueta.length * 6.4);
  ctx.fillStyle = '#0b0b0c';
  ctx.fillRect(cx - anchoEtiqueta / 2, cy + radio + 3, anchoEtiqueta, 15);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 10px Arial';
  ctx.fillText(etiqueta, cx, cy + radio + 11);
}

export async function exportarCampoAPng(datos: DatosExportacion): Promise<Blob> {
  const { alineacion, formacion, obtenerJugador, svgCampo, canvasDibujo, anchoContenedor, altoContenedor, orientacion, nombreClub } = datos;

  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(anchoContenedor * ESCALA_EXPORTACION);
  lienzo.height = Math.round((altoContenedor + ALTO_ENCABEZADO) * ESCALA_EXPORTACION);
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('No se pudo crear el contexto de exportación.');
  ctx.scale(ESCALA_EXPORTACION, ESCALA_EXPORTACION);

  ctx.fillStyle = '#0b0b0c';
  ctx.fillRect(0, 0, anchoContenedor, altoContenedor + ALTO_ENCABEZADO);

  ctx.fillStyle = '#D4111E';
  ctx.fillRect(0, 0, anchoContenedor, ALTO_ENCABEZADO);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 20px Arial';
  ctx.fillText(alineacion.nombre || 'Alineación sin nombre', 16, ALTO_ENCABEZADO / 2 - 4);
  ctx.font = '400 12px Arial';
  const fecha = new Date(alineacion.modificadaEn).toLocaleDateString('es-CO');
  ctx.fillText(
    `${nombreClub ?? 'Cúcuta Deportivo'} · ${formacion?.nombre ?? '—'}${formacion?.variante ? ' ' + formacion.variante : ''} · ${fecha}`,
    16,
    ALTO_ENCABEZADO / 2 + 14,
  );

  const imagenCampo = await svgAImagen(svgCampo);
  ctx.drawImage(imagenCampo, 0, ALTO_ENCABEZADO, anchoContenedor, altoContenedor);

  if (canvasDibujo) {
    ctx.drawImage(canvasDibujo, 0, ALTO_ENCABEZADO, anchoContenedor, altoContenedor);
  }

  for (const titular of alineacion.titulares) {
    const jugador = obtenerJugador(titular.jugadorId);
    if (!jugador) continue;
    dibujarJugadorEnLienzo(ctx, jugador, titular, anchoContenedor, altoContenedor, ALTO_ENCABEZADO, orientacion);
  }

  return new Promise<Blob>((resolve, reject) => {
    lienzo.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('La exportación a PNG falló.'))), 'image/png');
  });
}

function blobADataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = () => reject(new Error('No se pudo leer la imagen generada.'));
    lector.readAsDataURL(blob);
  });
}

export function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export async function exportarCampoAPdf(datos: DatosExportacion): Promise<void> {
  const [{ default: jsPDF }, blobPng] = await Promise.all([import('jspdf'), exportarCampoAPng(datos)]);
  const urlDatos = await blobADataUrl(blobPng);
  const anchoTotal = datos.anchoContenedor;
  const altoTotal = datos.altoContenedor + ALTO_ENCABEZADO;
  const documento = new jsPDF({
    orientation: anchoTotal >= altoTotal ? 'landscape' : 'portrait',
    unit: 'pt',
  });
  const anchoPagina = documento.internal.pageSize.getWidth();
  const altoPagina = documento.internal.pageSize.getHeight();
  const margen = 24;
  const anchoDisponible = anchoPagina - margen * 2;
  const altoDisponible = altoPagina - margen * 2;
  const relacion = altoTotal / anchoTotal;
  let anchoImagen = anchoDisponible;
  let altoImagen = anchoImagen * relacion;
  if (altoImagen > altoDisponible) {
    altoImagen = altoDisponible;
    anchoImagen = altoImagen / relacion;
  }
  documento.addImage(urlDatos, 'PNG', margen, margen, anchoImagen, altoImagen);
  documento.save(`${datos.alineacion.nombre || 'alineacion'}.pdf`);
}

export function exportarAlineacionAJson(alineacion: Alineacion): void {
  const contenido = JSON.stringify(alineacion, null, 2);
  const blob = new Blob([contenido], { type: 'application/json' });
  descargarBlob(blob, `${alineacion.nombre || 'alineacion'}.json`);
}

function esAlineacionValida(valor: unknown): valor is Alineacion {
  if (typeof valor !== 'object' || valor === null) return false;
  const registro = valor as Record<string, unknown>;
  return (
    typeof registro['id'] === 'string' &&
    typeof registro['nombre'] === 'string' &&
    typeof registro['formacionId'] === 'string' &&
    Array.isArray(registro['titulares']) &&
    Array.isArray(registro['banquillo']) &&
    Array.isArray(registro['trazos'])
  );
}

export function analizarAlineacionDesdeJson(texto: string): Alineacion {
  let valor: unknown;
  try {
    valor = JSON.parse(texto);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  if (!esAlineacionValida(valor)) {
    throw new Error('El archivo no tiene el formato esperado de una alineación.');
  }
  return valor;
}

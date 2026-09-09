import Dexie, { type Table } from 'dexie';
import type { Alineacion, Posicion } from '../../types';

export interface FotoJugadorRegistro {
  jugadorId: string;
  dataUrl: string;
}

/**
 * Solo los campos que el cuerpo técnico ha cambiado de un jugador de la plantilla.
 * Se guarda el cambio, no el jugador entero: así la semilla sigue mandando en todo
 * lo demás y añadir jugadores nuevos a `PLANTILLA_SEMILLA` no pisa lo ya editado.
 */
export interface DatosJugadorRegistro {
  jugadorId: string;
  nombre: string;
  apellido: string;
  dorsal: number;
  posicionNatural: Posicion;
  posicionesSecundarias: Posicion[];
}

export class PizarraDB extends Dexie {
  alineaciones!: Table<Alineacion, string>;
  fotosJugador!: Table<FotoJugadorRegistro, string>;
  datosJugador!: Table<DatosJugadorRegistro, string>;

  constructor() {
    super('cucuta-pizarra-tactica');
    this.version(1).stores({
      alineaciones: 'id, nombre, formacionId, modificadaEn',
    });
    // v2 añade la tabla de fotos de jugador (Dexie migra automáticamente
    // las bases ya existentes en el navegador de un usuario, sin tocar
    // los datos de la tabla `alineaciones`).
    this.version(2).stores({
      alineaciones: 'id, nombre, formacionId, modificadaEn',
      fotosJugador: 'jugadorId',
    });
    // v3 añade los datos editados de la plantilla, con la misma migración
    // automática de Dexie: ni las alineaciones ni las fotos se tocan.
    this.version(3).stores({
      alineaciones: 'id, nombre, formacionId, modificadaEn',
      fotosJugador: 'jugadorId',
      datosJugador: 'jugadorId',
    });
  }
}

export const db = new PizarraDB();

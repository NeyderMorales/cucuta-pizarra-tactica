import Dexie, { type Table } from 'dexie';
import type { Alineacion } from '../../types';

export interface FotoJugadorRegistro {
  jugadorId: string;
  dataUrl: string;
}

export class PizarraDB extends Dexie {
  alineaciones!: Table<Alineacion, string>;
  fotosJugador!: Table<FotoJugadorRegistro, string>;

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
  }
}

export const db = new PizarraDB();

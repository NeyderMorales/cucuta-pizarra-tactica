import type { AlineacionRepository } from './AlineacionRepository';
import { DexieAlineacionRepository } from './dexieAlineacionRepository';
import { MemoriaAlineacionRepository } from './memoriaAlineacionRepository';
import type { FotosRepository } from './FotosRepository';
import { DexieFotosRepository } from './dexieFotosRepository';
import { MemoriaFotosRepository } from './memoriaFotosRepository';
import type { PlantillaRepository } from './PlantillaRepository';
import { DexiePlantillaRepository } from './dexiePlantillaRepository';
import { MemoriaPlantillaRepository } from './memoriaPlantillaRepository';

export type { AlineacionRepository, ResumenAlineacion } from './AlineacionRepository';
export type { FotosRepository } from './FotosRepository';
export type { PlantillaRepository, DatosJugadorRegistro } from './PlantillaRepository';

function indexedDBDisponible(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}

export const alineacionRepository: AlineacionRepository = indexedDBDisponible()
  ? new DexieAlineacionRepository()
  : new MemoriaAlineacionRepository();

export const fotosRepository: FotosRepository = indexedDBDisponible()
  ? new DexieFotosRepository()
  : new MemoriaFotosRepository();

export const plantillaRepository: PlantillaRepository = indexedDBDisponible()
  ? new DexiePlantillaRepository()
  : new MemoriaPlantillaRepository();

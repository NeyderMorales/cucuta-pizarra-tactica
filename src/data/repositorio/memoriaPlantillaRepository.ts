import type { PlantillaRepository } from './PlantillaRepository';
import type { DatosJugadorRegistro } from './db';

/**
 * Respaldo cuando IndexedDB no está disponible (p. ej. dentro de un artefacto
 * de Claude). Vive solo en memoria: los datos editados se pierden al recargar.
 */
export class MemoriaPlantillaRepository implements PlantillaRepository {
  private almacen = new Map<string, DatosJugadorRegistro>();

  async obtenerTodos(): Promise<Record<string, DatosJugadorRegistro>> {
    return Object.fromEntries(this.almacen);
  }

  async guardar(datos: DatosJugadorRegistro): Promise<void> {
    this.almacen.set(datos.jugadorId, datos);
  }

  async eliminar(jugadorId: string): Promise<void> {
    this.almacen.delete(jugadorId);
  }
}

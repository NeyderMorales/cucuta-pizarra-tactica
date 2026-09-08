import type { FotosRepository } from './FotosRepository';

/**
 * Respaldo cuando IndexedDB no está disponible (p. ej. dentro de un artefacto
 * de Claude). Vive solo en memoria: las fotos se pierden al recargar.
 */
export class MemoriaFotosRepository implements FotosRepository {
  private almacen = new Map<string, string>();

  async obtenerTodas(): Promise<Record<string, string>> {
    return Object.fromEntries(this.almacen);
  }

  async guardar(jugadorId: string, dataUrl: string): Promise<void> {
    this.almacen.set(jugadorId, dataUrl);
  }

  async eliminar(jugadorId: string): Promise<void> {
    this.almacen.delete(jugadorId);
  }
}

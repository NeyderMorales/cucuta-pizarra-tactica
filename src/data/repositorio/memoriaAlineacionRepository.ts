import type { Alineacion } from '../../types';
import type { AlineacionRepository, ResumenAlineacion } from './AlineacionRepository';

/**
 * Repositorio de respaldo cuando IndexedDB no está disponible (p. ej. dentro de
 * un artefacto de Claude). Vive solo en memoria: el trabajo se pierde al recargar,
 * por eso la UI debe ofrecer exportar/importar JSON como respaldo manual en ese caso.
 */
export class MemoriaAlineacionRepository implements AlineacionRepository {
  private almacen = new Map<string, Alineacion>();

  async listar(): Promise<ResumenAlineacion[]> {
    return [...this.almacen.values()]
      .sort((a, b) => b.modificadaEn.localeCompare(a.modificadaEn))
      .map((a) => ({ id: a.id, nombre: a.nombre, formacionId: a.formacionId, modificadaEn: a.modificadaEn }));
  }

  async obtener(id: string): Promise<Alineacion | undefined> {
    return this.almacen.get(id);
  }

  async guardar(alineacion: Alineacion): Promise<void> {
    this.almacen.set(alineacion.id, alineacion);
  }

  async eliminar(id: string): Promise<void> {
    this.almacen.delete(id);
  }
}

import type { Alineacion } from '../../types';
import type { AlineacionRepository, ResumenAlineacion } from './AlineacionRepository';
import { db } from './db';

export class DexieAlineacionRepository implements AlineacionRepository {
  async listar(): Promise<ResumenAlineacion[]> {
    const registros = await db.alineaciones.orderBy('modificadaEn').reverse().toArray();
    return registros.map((a) => ({ id: a.id, nombre: a.nombre, formacionId: a.formacionId, modificadaEn: a.modificadaEn }));
  }

  async obtener(id: string): Promise<Alineacion | undefined> {
    return db.alineaciones.get(id);
  }

  async guardar(alineacion: Alineacion): Promise<void> {
    await db.alineaciones.put(alineacion);
  }

  async eliminar(id: string): Promise<void> {
    await db.alineaciones.delete(id);
  }
}

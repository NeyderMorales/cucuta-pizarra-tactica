import type { PlantillaRepository } from './PlantillaRepository';
import { db, type DatosJugadorRegistro } from './db';

export class DexiePlantillaRepository implements PlantillaRepository {
  async obtenerTodos(): Promise<Record<string, DatosJugadorRegistro>> {
    const registros = await db.datosJugador.toArray();
    return Object.fromEntries(registros.map((r) => [r.jugadorId, r]));
  }

  async guardar(datos: DatosJugadorRegistro): Promise<void> {
    await db.datosJugador.put(datos);
  }

  async eliminar(jugadorId: string): Promise<void> {
    await db.datosJugador.delete(jugadorId);
  }
}

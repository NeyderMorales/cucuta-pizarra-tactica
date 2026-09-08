import type { FotosRepository } from './FotosRepository';
import { db } from './db';

export class DexieFotosRepository implements FotosRepository {
  async obtenerTodas(): Promise<Record<string, string>> {
    const registros = await db.fotosJugador.toArray();
    return Object.fromEntries(registros.map((r) => [r.jugadorId, r.dataUrl]));
  }

  async guardar(jugadorId: string, dataUrl: string): Promise<void> {
    await db.fotosJugador.put({ jugadorId, dataUrl });
  }

  async eliminar(jugadorId: string): Promise<void> {
    await db.fotosJugador.delete(jugadorId);
  }
}

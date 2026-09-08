/**
 * Puerto de persistencia para las fotos de jugador, aislado igual que
 * `AlineacionRepository`: los componentes y el store dependen solo de esta
 * interfaz, nunca de Dexie/IndexedDB directamente.
 */
export interface FotosRepository {
  obtenerTodas(): Promise<Record<string, string>>;
  guardar(jugadorId: string, dataUrl: string): Promise<void>;
  eliminar(jugadorId: string): Promise<void>;
}

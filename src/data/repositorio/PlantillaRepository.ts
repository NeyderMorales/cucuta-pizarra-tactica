import type { DatosJugadorRegistro } from './db';

export type { DatosJugadorRegistro } from './db';

/**
 * Guarda los datos que el cuerpo técnico edita de los jugadores de la plantilla
 * (nombre, apellido, dorsal y posiciones). Solo se persiste lo cambiado: la
 * plantilla base sigue viviendo en `PLANTILLA_SEMILLA` y estos registros se
 * fusionan encima al arrancar.
 */
export interface PlantillaRepository {
  obtenerTodos(): Promise<Record<string, DatosJugadorRegistro>>;
  guardar(datos: DatosJugadorRegistro): Promise<void>;
  eliminar(jugadorId: string): Promise<void>;
}

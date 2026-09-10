import type { Balon, JugadorEnCampo } from '../types';
import { OFFSET_BALON_ANCLADO } from './constantes';

/**
 * Dónde se ve realmente un balón. Un balón anclado no guarda su posición: sigue
 * al jugador que lo posee, así que su `x`/`y` almacenados están obsoletos y hay
 * que derivarlos del propietario. Antes esta cuenta estaba repetida en tres
 * sitios; tenerla en uno solo es lo que permite que al desanclar el balón se
 * quede donde estaba en vez de saltar al centro.
 */
export function posicionEfectivaBalon(balon: Balon, titulares: JugadorEnCampo[]): { x: number; y: number } {
  if (!balon.jugadorPoseedorId) return { x: balon.x, y: balon.y };
  const propietario = titulares.find((t) => t.jugadorId === balon.jugadorPoseedorId);
  if (!propietario) return { x: balon.x, y: balon.y };
  return {
    x: Math.min(100, propietario.x + OFFSET_BALON_ANCLADO.x),
    y: Math.min(100, propietario.y + OFFSET_BALON_ANCLADO.y),
  };
}

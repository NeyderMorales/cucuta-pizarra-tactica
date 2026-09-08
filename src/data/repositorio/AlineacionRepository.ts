import type { Alineacion } from '../../types';

export interface ResumenAlineacion {
  id: string;
  nombre: string;
  formacionId: string;
  modificadaEn: string;
}

/**
 * Puerto de persistencia. Cualquier componente depende solo de esta interfaz,
 * nunca de Dexie/IndexedDB directamente, para poder cambiar de IndexedDB a un
 * backend (p. ej. Supabase) sin tocar la UI.
 */
export interface AlineacionRepository {
  listar(): Promise<ResumenAlineacion[]>;
  obtener(id: string): Promise<Alineacion | undefined>;
  guardar(alineacion: Alineacion): Promise<void>;
  eliminar(id: string): Promise<void>;
}

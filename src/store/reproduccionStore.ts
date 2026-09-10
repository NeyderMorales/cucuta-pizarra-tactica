import { create } from 'zustand';

export type VelocidadReproduccion = 0.5 | 1 | 1.5 | 2;

export const VELOCIDADES: VelocidadReproduccion[] = [0.5, 1, 1.5, 2];

/**
 * Estado de REPRODUCCIÓN, deliberadamente separado del estado de la jugada
 * (que vive en `alineacionStore` dentro del documento). Aquí solo hay mandos:
 * nada de esto se guarda con el tablero ni entra en el historial.
 *
 * El progreso dentro de una transición NO vive aquí: cambiaría 60 veces por
 * segundo. Lo lleva `CapaReproduccion` en local, con requestAnimationFrame.
 */
interface ReproduccionState {
  reproduciendo: boolean;
  velocidad: VelocidadReproduccion;
  /** Frame que se está reproduciendo; al pausar se vuelca al documento. */
  indiceFrame: number;

  reproducir: () => void;
  pausar: () => void;
  setIndiceFrame: (indice: number) => void;
  setVelocidad: (velocidad: VelocidadReproduccion) => void;
  detener: () => void;
}

export const useReproduccionStore = create<ReproduccionState>((set) => ({
  reproduciendo: false,
  velocidad: 1,
  indiceFrame: 0,

  reproducir: () => set({ reproduciendo: true }),
  pausar: () => set({ reproduciendo: false }),
  setIndiceFrame: (indiceFrame) => set({ indiceFrame }),
  setVelocidad: (velocidad) => set({ velocidad }),
  detener: () => set({ reproduciendo: false, indiceFrame: 0 }),
}));

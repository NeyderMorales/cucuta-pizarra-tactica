import { create } from 'zustand';
import type { Jugador } from '../types';
import { PLANTILLA_SEMILLA } from '../data/plantillaSemilla';
import { fotosRepository } from '../data/repositorio';

interface PlantillaState {
  jugadores: Jugador[];
  fotosCargadas: boolean;
  obtenerPorId: (id: string) => Jugador | undefined;
  cargarFotos: () => Promise<void>;
  establecerFoto: (jugadorId: string, dataUrl: string) => Promise<void>;
  quitarFoto: (jugadorId: string) => Promise<void>;
}

export const usePlantillaStore = create<PlantillaState>((set, get) => ({
  jugadores: PLANTILLA_SEMILLA,
  fotosCargadas: false,
  obtenerPorId: (id) => get().jugadores.find((j) => j.id === id),

  cargarFotos: async () => {
    const fotos = await fotosRepository.obtenerTodas();
    set((estado) => ({
      jugadores: estado.jugadores.map((j) => (fotos[j.id] ? { ...j, fotoUrl: fotos[j.id]! } : j)),
      fotosCargadas: true,
    }));
  },

  establecerFoto: async (jugadorId, dataUrl) => {
    await fotosRepository.guardar(jugadorId, dataUrl);
    set((estado) => ({
      jugadores: estado.jugadores.map((j) => (j.id === jugadorId ? { ...j, fotoUrl: dataUrl } : j)),
    }));
  },

  quitarFoto: async (jugadorId) => {
    await fotosRepository.eliminar(jugadorId);
    set((estado) => ({
      jugadores: estado.jugadores.map((j) => (j.id === jugadorId ? { ...j, fotoUrl: null } : j)),
    }));
  },
}));

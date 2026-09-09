import { create } from 'zustand';
import type { Jugador, Posicion } from '../types';
import { PLANTILLA_SEMILLA } from '../data/plantillaSemilla';
import { fotosRepository, plantillaRepository } from '../data/repositorio';
import { useUiStore } from './uiStore';

export interface DatosEditablesJugador {
  nombre: string;
  apellido: string;
  dorsal: number;
  posicionNatural: Posicion;
  posicionesSecundarias: Posicion[];
}

interface PlantillaState {
  jugadores: Jugador[];
  fotosCargadas: boolean;
  /** Ids de los jugadores que vienen del documento, para poder reemplazarlos sin tocar la plantilla del club. */
  idsPersonalizados: string[];
  obtenerPorId: (id: string) => Jugador | undefined;
  /**
   * Refleja en la plantilla en memoria los jugadores personalizados de la alineación
   * abierta. Es un reemplazo, no una acumulación: así deshacer, rehacer, cargar otra
   * alineación o importar un JSON dejan siempre la lista exacta del documento.
   */
  sincronizarPersonalizados: (personalizados: Jugador[]) => void;
  /** Fusiona sobre la semilla los datos que el cuerpo técnico haya editado antes. */
  cargarDatosEditados: () => Promise<void>;
  /** Edita un jugador de la plantilla del club. Optimista: si el guardado falla, revierte y avisa. */
  actualizarJugador: (jugadorId: string, datos: DatosEditablesJugador) => Promise<void>;
  cargarFotos: () => Promise<void>;
  establecerFoto: (jugadorId: string, dataUrl: string) => Promise<void>;
  quitarFoto: (jugadorId: string) => Promise<void>;
}

export const usePlantillaStore = create<PlantillaState>((set, get) => ({
  jugadores: PLANTILLA_SEMILLA,
  fotosCargadas: false,
  idsPersonalizados: [],
  obtenerPorId: (id) => get().jugadores.find((j) => j.id === id),

  sincronizarPersonalizados: (personalizados) =>
    set((estado) => {
      const idsAnteriores = new Set(estado.idsPersonalizados);
      const plantillaDelClub = estado.jugadores.filter((j) => !idsAnteriores.has(j.id));
      return {
        jugadores: [...plantillaDelClub, ...personalizados],
        idsPersonalizados: personalizados.map((j) => j.id),
      };
    }),

  cargarDatosEditados: async () => {
    const editados = await plantillaRepository.obtenerTodos();
    if (Object.keys(editados).length === 0) return;
    set((estado) => ({
      jugadores: estado.jugadores.map((j) => {
        const guardado = editados[j.id];
        if (!guardado) return j;
        const { jugadorId: _ignorado, ...datos } = guardado;
        return { ...j, ...datos };
      }),
    }));
  },

  actualizarJugador: async (jugadorId, datos) => {
    const anterior = get().jugadores.find((j) => j.id === jugadorId);
    if (!anterior) return;
    set((estado) => ({
      jugadores: estado.jugadores.map((j) => (j.id === jugadorId ? { ...j, ...datos } : j)),
    }));
    try {
      await plantillaRepository.guardar({ jugadorId, ...datos });
    } catch {
      // Revierte al valor previo: es preferible que el cambio se deshaga a la vista
      // antes que dejar en pantalla algo que no llegó a guardarse.
      set((estado) => ({
        jugadores: estado.jugadores.map((j) => (j.id === jugadorId ? anterior : j)),
      }));
      useUiStore.getState().mostrarToast({
        tipo: 'error',
        mensaje: `No se pudo guardar el cambio de ${anterior.apellido}. Se deshizo la edición.`,
      });
    }
  },

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

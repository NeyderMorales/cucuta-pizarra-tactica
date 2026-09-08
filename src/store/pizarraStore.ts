import { create } from 'zustand';
import type { Herramienta } from '../types';
import { PALETA_DIBUJO } from '../utils/constantes';

interface PizarraState {
  modoDibujoActivo: boolean;
  herramienta: Herramienta;
  color: string;
  grosor: 1 | 2 | 3;
  toggleModoDibujo: () => void;
  setModoDibujo: (activo: boolean) => void;
  setHerramienta: (herramienta: Herramienta) => void;
  setColor: (color: string) => void;
  setGrosor: (grosor: 1 | 2 | 3) => void;
}

export const usePizarraStore = create<PizarraState>((set) => ({
  modoDibujoActivo: false,
  herramienta: 'libre',
  color: PALETA_DIBUJO[0]!,
  grosor: 2,
  toggleModoDibujo: () => set((s) => ({ modoDibujoActivo: !s.modoDibujoActivo })),
  setModoDibujo: (activo) => set({ modoDibujoActivo: activo }),
  setHerramienta: (herramienta) => set({ herramienta }),
  setColor: (color) => set({ color }),
  setGrosor: (grosor) => set({ grosor }),
}));

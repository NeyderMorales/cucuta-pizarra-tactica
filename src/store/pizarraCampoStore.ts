import { create } from 'zustand';
import type { ColorObjeto, PresetCuadricula, PuntoNormalizado, TipoObjeto } from '../types';
import { ORDEN_COLOR_OBJETO, TIPOS_OBJETO } from '../utils/constantes';

export type HerramientaDistribucion = 'ninguna' | 'fila' | 'slalom' | 'rejilla';

interface PizarraCampoState {
  modoObjetoActivo: boolean;
  tipoObjetoActivo: TipoObjeto;
  colorObjetoActivo: ColorObjeto;
  herramientaDistribucion: HerramientaDistribucion;
  nDistribucion: number;
  puntoDistribucionA: PuntoNormalizado | null;
  ultimoPresetCuadricula: PresetCuadricula;
  /** Objeto de campo seleccionado (para el atajo Del/Backspace); vive aquí, no en Campo, para que el atajo global lo alcance. */
  objetoSeleccionadoId: string | null;

  activarModoObjeto: (tipo: TipoObjeto) => void;
  desactivarModoObjeto: () => void;
  setColorObjetoActivo: (color: ColorObjeto) => void;
  setHerramientaDistribucion: (h: HerramientaDistribucion) => void;
  setNDistribucion: (n: number) => void;
  setPuntoDistribucionA: (p: PuntoNormalizado | null) => void;
  setUltimoPresetCuadricula: (p: PresetCuadricula) => void;
  setObjetoSeleccionadoId: (id: string | null) => void;
}

export const usePizarraCampoStore = create<PizarraCampoState>((set) => ({
  modoObjetoActivo: false,
  tipoObjetoActivo: TIPOS_OBJETO[0]!,
  colorObjetoActivo: ORDEN_COLOR_OBJETO[0]!,
  herramientaDistribucion: 'ninguna',
  nDistribucion: 6,
  puntoDistribucionA: null,
  ultimoPresetCuadricula: 'juego-posicion',
  objetoSeleccionadoId: null,

  activarModoObjeto: (tipo) => set({ modoObjetoActivo: true, tipoObjetoActivo: tipo }),
  desactivarModoObjeto: () =>
    set({ modoObjetoActivo: false, herramientaDistribucion: 'ninguna', puntoDistribucionA: null }),
  setColorObjetoActivo: (color) => set({ colorObjetoActivo: color }),
  setHerramientaDistribucion: (herramientaDistribucion) => set({ herramientaDistribucion, puntoDistribucionA: null }),
  setNDistribucion: (nDistribucion) => set({ nDistribucion }),
  setPuntoDistribucionA: (puntoDistribucionA) => set({ puntoDistribucionA }),
  setUltimoPresetCuadricula: (ultimoPresetCuadricula) => set({ ultimoPresetCuadricula }),
  setObjetoSeleccionadoId: (objetoSeleccionadoId) => set({ objetoSeleccionadoId }),
}));

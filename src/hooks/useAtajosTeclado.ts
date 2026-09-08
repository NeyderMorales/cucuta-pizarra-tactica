import { useEffect } from 'react';
import { useAlineacionStore } from '../store/alineacionStore';
import { usePizarraCampoStore } from '../store/pizarraCampoStore';
import { useUiStore } from '../store/uiStore';
import { FORMACIONES } from '../data/formaciones';
import { DEFINICION_PRESETS_CUADRICULA } from '../utils/constantes';
import type { PresetCuadricula } from '../types';

function elementoEsEditable(elemento: EventTarget | null): boolean {
  if (!(elemento instanceof HTMLElement)) return false;
  return elemento.tagName === 'INPUT' || elemento.tagName === 'TEXTAREA' || elemento.isContentEditable;
}

/** Ciclo abreviado para el atajo G: off → tercios → 5 carriles → 12 zonas → off (Anexo A). */
const CICLO_CUADRICULA_RAPIDO: Exclude<PresetCuadricula, 'personalizada'>[] = ['off', 'tercios', 'carriles-5', 'zonas-12'];

/**
 * Atajos globales: Ctrl/Cmd+Z deshacer, Ctrl/Cmd+Shift+Z o Ctrl+Y rehacer,
 * F pantalla completa, Esc para salir (o cancelar el modo objeto activo).
 * Anexo A: C cono, B balón, G ciclar cuadrícula, R mostrar/ocultar rival,
 * Shift+R girar la pizarra 180°, Del/Backspace elimina el objeto seleccionado.
 */
export function useAtajosTeclado(): void {
  useEffect(() => {
    function manejar(evento: KeyboardEvent): void {
      if (elementoEsEditable(evento.target)) return;
      const modificador = evento.ctrlKey || evento.metaKey;
      const tecla = evento.key.toLowerCase();

      if (modificador && tecla === 'z' && !evento.shiftKey) {
        evento.preventDefault();
        useAlineacionStore.getState().deshacer();
        return;
      }
      if (modificador && ((tecla === 'z' && evento.shiftKey) || tecla === 'y')) {
        evento.preventDefault();
        useAlineacionStore.getState().rehacer();
        return;
      }
      if (!modificador && tecla === 'f') {
        evento.preventDefault();
        const { pantallaCompleta, setPantallaCompleta } = useUiStore.getState();
        setPantallaCompleta(!pantallaCompleta);
        return;
      }

      if (!modificador && tecla === 'c') {
        evento.preventDefault();
        usePizarraCampoStore.getState().activarModoObjeto('cono');
        return;
      }

      if (!modificador && tecla === 'b') {
        evento.preventDefault();
        useAlineacionStore.getState().agregarBalon();
        return;
      }

      if (!modificador && tecla === 'g') {
        evento.preventDefault();
        const { historial, actualizarCuadricula } = useAlineacionStore.getState();
        const presetActual = historial.presente.cuadricula.preset;
        const indice = presetActual === 'personalizada' ? -1 : CICLO_CUADRICULA_RAPIDO.indexOf(presetActual);
        const siguiente = CICLO_CUADRICULA_RAPIDO[(indice + 1) % CICLO_CUADRICULA_RAPIDO.length]!;
        const def = siguiente === 'off' ? { columnas: 0, filas: 0 } : DEFINICION_PRESETS_CUADRICULA[siguiente];
        actualizarCuadricula({ preset: siguiente, columnas: def.columnas, filas: def.filas });
        return;
      }

      if (!modificador && tecla === 'r' && evento.shiftKey) {
        evento.preventDefault();
        const { historial, actualizarCancha } = useAlineacionStore.getState();
        actualizarCancha({ rotado180: !historial.presente.cancha.rotado180 });
        return;
      }
      if (!modificador && tecla === 'r' && !evento.shiftKey) {
        evento.preventDefault();
        const { historial, activarRival, actualizarRival } = useAlineacionStore.getState();
        if (!historial.presente.rival) activarRival(FORMACIONES[0]!.id);
        else actualizarRival({ visible: !historial.presente.rival.visible });
        return;
      }

      if (!modificador && (evento.key === 'Delete' || evento.key === 'Backspace')) {
        const id = usePizarraCampoStore.getState().objetoSeleccionadoId;
        if (id) {
          evento.preventDefault();
          useAlineacionStore.getState().eliminarObjeto(id);
          usePizarraCampoStore.getState().setObjetoSeleccionadoId(null);
        }
        return;
      }

      if (evento.key === 'Escape') {
        const pizarraCampo = usePizarraCampoStore.getState();
        if (pizarraCampo.modoObjetoActivo) {
          if (pizarraCampo.puntoDistribucionA) {
            pizarraCampo.setPuntoDistribucionA(null);
            return;
          }
          pizarraCampo.desactivarModoObjeto();
          return;
        }
        if (useUiStore.getState().pantallaCompleta) useUiStore.getState().setPantallaCompleta(false);
      }
    }
    window.addEventListener('keydown', manejar);
    return () => window.removeEventListener('keydown', manejar);
  }, []);
}

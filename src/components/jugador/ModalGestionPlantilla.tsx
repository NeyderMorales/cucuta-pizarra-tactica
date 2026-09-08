import { useRef, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Boton } from '../ui/Boton';
import { usePlantillaStore } from '../../store/plantillaStore';
import { useUiStore } from '../../store/uiStore';
import { recortarImagenCircularABase64 } from '../../utils/imagen';
import type { Jugador } from '../../types';

interface ModalGestionPlantillaProps {
  abierto: boolean;
  onCerrar: () => void;
}

function obtenerIniciales(jugador: Jugador): string {
  return `${jugador.nombre.charAt(0)}${jugador.apellido.charAt(0)}`.toUpperCase();
}

export function ModalGestionPlantilla({ abierto, onCerrar }: ModalGestionPlantillaProps) {
  const jugadores = usePlantillaStore((s) => s.jugadores);
  const establecerFoto = usePlantillaStore((s) => s.establecerFoto);
  const quitarFoto = usePlantillaStore((s) => s.quitarFoto);
  const mostrarToast = useUiStore((s) => s.mostrarToast);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  async function manejarArchivo(jugadorId: string, archivo: File | undefined): Promise<void> {
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      mostrarToast({ tipo: 'error', mensaje: 'Elige un archivo de imagen válido.' });
      return;
    }
    setProcesandoId(jugadorId);
    try {
      const dataUrl = await recortarImagenCircularABase64(archivo);
      await establecerFoto(jugadorId, dataUrl);
    } catch (error) {
      mostrarToast({ tipo: 'error', mensaje: error instanceof Error ? error.message : 'No se pudo procesar la imagen.' });
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Gestionar plantilla" ancho="lg">
      <p className="mb-3 text-sm text-club-plata/70">
        Sube una foto por jugador: se recorta en el propio navegador y se guarda solo en este dispositivo (nunca se envía a
        terceros).
      </p>
      <ul className="barra-scroll flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto">
        {jugadores.map((jugador) => (
          <li key={jugador.id} className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full font-display text-sm font-bold text-white"
              style={{ background: jugador.fotoUrl ? undefined : 'linear-gradient(135deg, #D4111E 0%, #1A1A1D 100%)' }}
            >
              {jugador.fotoUrl ? (
                <img src={jugador.fotoUrl} alt="" className="h-full w-full object-cover" draggable={false} />
              ) : (
                obtenerIniciales(jugador)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold uppercase tracking-wide text-white">
                {jugador.dorsal} · {jugador.nombre} {jugador.apellido}
              </p>
              <p className="text-xs text-club-plata/60">{jugador.posicionNatural}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <input
                ref={(nodo) => {
                  inputRefs.current[jugador.id] = nodo;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void manejarArchivo(jugador.id, e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <Boton
                tamano="sm"
                variante="secundario"
                disabled={procesandoId === jugador.id}
                onClick={() => inputRefs.current[jugador.id]?.click()}
              >
                {procesandoId === jugador.id ? 'Procesando…' : jugador.fotoUrl ? 'Cambiar' : 'Subir foto'}
              </Boton>
              {jugador.fotoUrl && (
                <Boton tamano="sm" variante="fantasma" onClick={() => void quitarFoto(jugador.id)}>
                  Quitar
                </Boton>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

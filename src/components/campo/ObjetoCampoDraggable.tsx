import { useRef, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { useDragEnCampo } from '../../hooks/useDragEnCampo';
import { IconoObjeto } from './IconoObjeto';
import { COLORES_OBJETO, ETIQUETAS_OBJETO, TIPOS_OBJETO_ROTABLES } from '../../utils/constantes';
import type { ObjetoCampo } from '../../types';

const RADIO_TIRADOR_ROTACION = 26;
const PASO_TECLADO_ROTACION = 15;
const UMBRAL_PULSACION_LARGA_MS = 550;
const UMBRAL_MOVIMIENTO_CANCELA_PULSACION = 8;

function normalizarAngulo(grados: number): number {
  return ((grados % 360) + 360) % 360;
}

export interface DatosArrastreObjeto {
  tipoArrastre: 'objeto';
  objetoId: string;
  [clave: string]: unknown;
}

interface ObjetoCampoDraggableProps {
  objeto: ObjetoCampo;
  seleccionado: boolean;
  deshabilitado?: boolean;
  onSeleccionar: () => void;
  onRotar: (rotacion: number) => void;
  onDuplicar: () => void;
}

export function ObjetoCampoDraggable({ objeto, seleccionado, deshabilitado, onSeleccionar, onRotar, onDuplicar }: ObjetoCampoDraggableProps) {
  const { attributes, listeners, setNodeRef, estilo } = useDragEnCampo(
    `obj-${objeto.id}`,
    objeto.x,
    objeto.y,
    { tipoArrastre: 'objeto', objetoId: objeto.id } satisfies DatosArrastreObjeto,
    deshabilitado,
  );
  const rotable = TIPOS_OBJETO_ROTABLES.has(objeto.tipo);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const rotandoRef = useRef(false);
  const pulsacionLargaRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origenPulsacionRef = useRef<{ x: number; y: number } | null>(null);

  function cancelarPulsacionLarga(): void {
    if (pulsacionLargaRef.current) {
      clearTimeout(pulsacionLargaRef.current);
      pulsacionLargaRef.current = null;
    }
    origenPulsacionRef.current = null;
  }

  /** Pulsación larga táctil = duplicar (Anexo A §A.1 FA1); en escritorio el equivalente es Alt+arrastre (ver Campo.tsx). */
  function iniciarPulsacionLarga(evento: ReactPointerEvent): void {
    if (evento.pointerType !== 'touch' || deshabilitado) return;
    origenPulsacionRef.current = { x: evento.clientX, y: evento.clientY };
    pulsacionLargaRef.current = setTimeout(() => {
      pulsacionLargaRef.current = null;
      onDuplicar();
    }, UMBRAL_PULSACION_LARGA_MS);

    function mover(e: PointerEvent): void {
      const origen = origenPulsacionRef.current;
      if (!origen) return;
      if (Math.hypot(e.clientX - origen.x, e.clientY - origen.y) > UMBRAL_MOVIMIENTO_CANCELA_PULSACION) {
        cancelarPulsacionLarga();
      }
    }
    function terminar(): void {
      cancelarPulsacionLarga();
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', terminar);
      window.removeEventListener('pointercancel', terminar);
    }
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', terminar);
    window.addEventListener('pointercancel', terminar);
  }

  function manejarPointerDownTirador(evento: ReactPointerEvent): void {
    evento.stopPropagation();
    evento.preventDefault();
    const elemento = contenedorRef.current;
    if (!elemento) return;
    const rect = elemento.getBoundingClientRect();
    const centroX = rect.left + rect.width / 2;
    const centroY = rect.top + rect.height / 2;
    rotandoRef.current = true;

    function mover(e: PointerEvent): void {
      if (!rotandoRef.current) return;
      const dx = e.clientX - centroX;
      const dy = e.clientY - centroY;
      onRotar(Math.round(normalizarAngulo((Math.atan2(dx, -dy) * 180) / Math.PI)));
    }
    function soltar(): void {
      rotandoRef.current = false;
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
    }
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
  }

  function manejarTecladoTirador(evento: ReactKeyboardEvent): void {
    if (evento.key === 'ArrowLeft') {
      evento.preventDefault();
      onRotar(normalizarAngulo(objeto.rotacion - PASO_TECLADO_ROTACION));
    } else if (evento.key === 'ArrowRight') {
      evento.preventDefault();
      onRotar(normalizarAngulo(objeto.rotacion + PASO_TECLADO_ROTACION));
    } else if (evento.key === 'Home') {
      evento.preventDefault();
      onRotar(0);
    }
  }

  const anguloRad = (objeto.rotacion * Math.PI) / 180;
  const tiradorX = RADIO_TIRADOR_ROTACION * Math.sin(anguloRad);
  const tiradorY = -RADIO_TIRADOR_ROTACION * Math.cos(anguloRad);

  return (
    <div
      ref={setNodeRef}
      style={estilo}
      className="touch-none"
      {...attributes}
      {...listeners}
      onPointerDown={(evento) => {
        listeners?.onPointerDown?.(evento);
        onSeleccionar();
        iniciarPulsacionLarga(evento);
      }}
    >
      <div
        ref={contenedorRef}
        className={`relative rounded-full ${seleccionado ? 'ring-2 ring-club-rojo ring-offset-2 ring-offset-transparent' : ''}`}
      >
        <IconoObjeto tipo={objeto.tipo} color={COLORES_OBJETO[objeto.color]} rotacion={objeto.rotacion} />
        {seleccionado && rotable && (
          <div
            role="slider"
            tabIndex={0}
            aria-label={`Rotar ${ETIQUETAS_OBJETO[objeto.tipo]}`}
            aria-valuenow={objeto.rotacion}
            aria-valuemin={0}
            aria-valuemax={359}
            aria-orientation="horizontal"
            onPointerDown={manejarPointerDownTirador}
            onKeyDown={manejarTecladoTirador}
            title="Arrastra para rotar (flechas para ajustar)"
            className="absolute left-1/2 top-1/2 flex h-5 w-5 touch-none cursor-grab items-center justify-center rounded-full bg-club-rojo text-[10px] text-white shadow-tarjeta ring-2 ring-club-negro active:cursor-grabbing"
            style={{ transform: `translate(-50%, -50%) translate(${tiradorX}px, ${tiradorY}px)` }}
          >
            <span aria-hidden="true">↻</span>
          </div>
        )}
      </div>
    </div>
  );
}

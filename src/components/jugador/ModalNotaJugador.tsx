import { useEffect, useRef, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Boton } from '../ui/Boton';

interface ModalNotaJugadorProps {
  abierto: boolean;
  nombreJugador: string;
  notaActual: string;
  onGuardar: (nota: string) => void;
  onCerrar: () => void;
}

const LIMITE_CARACTERES = 200;

export function ModalNotaJugador({ abierto, nombreJugador, notaActual, onGuardar, onCerrar }: ModalNotaJugadorProps) {
  const [valor, setValor] = useState(notaActual);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (abierto) setValor(notaActual);
  }, [abierto, notaActual]);

  useEffect(() => {
    if (abierto) areaRef.current?.focus();
  }, [abierto]);

  function guardar(): void {
    onGuardar(valor);
    onCerrar();
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={`Nota para ${nombreJugador}`} ancho="sm">
      <div className="flex flex-col gap-2">
        <textarea
          ref={areaRef}
          value={valor}
          onChange={(e) => setValor(e.target.value.slice(0, LIMITE_CARACTERES))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) guardar();
            if (e.key === 'Escape') onCerrar();
          }}
          placeholder="Ej. Vigilar la banda derecha, marcaje individual…"
          rows={4}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-club-plata/50 outline-none focus:border-club-rojo"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-club-plata/60">{valor.length}/{LIMITE_CARACTERES}</span>
          <div className="flex gap-2">
            <Boton variante="fantasma" tamano="sm" onClick={onCerrar}>
              Cancelar
            </Boton>
            <Boton variante="primario" tamano="sm" onClick={guardar}>
              Guardar nota
            </Boton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

import { useEffect, useRef } from 'react';

interface AccionMenu {
  etiqueta: string;
  onSeleccionar: () => void;
  peligro?: boolean;
}

interface MenuJugadorProps {
  x: number;
  y: number;
  acciones: AccionMenu[];
  onCerrar: () => void;
}

export function MenuJugador({ x, y, acciones, onCerrar }: MenuJugadorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function manejarFuera(evento: PointerEvent) {
      if (ref.current && !ref.current.contains(evento.target as Node)) onCerrar();
    }
    function manejarEsc(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onCerrar();
    }
    document.addEventListener('pointerdown', manejarFuera);
    document.addEventListener('keydown', manejarEsc);
    return () => {
      document.removeEventListener('pointerdown', manejarFuera);
      document.removeEventListener('keydown', manejarEsc);
    };
  }, [onCerrar]);

  const clampX = Math.min(x, window.innerWidth - 210);
  const clampY = Math.min(y, window.innerHeight - acciones.length * 44 - 16);

  return (
    <div
      ref={ref}
      role="menu"
      className="superficie-vidrio animar-entrada-tarjeta fixed z-[90] min-w-[190px] overflow-hidden rounded-lg border border-white/10 shadow-elevada"
      style={{ left: Math.max(8, clampX), top: Math.max(8, clampY) }}
    >
      {acciones.map((accion) => (
        <button
          key={accion.etiqueta}
          role="menuitem"
          onClick={() => {
            accion.onSeleccionar();
            onCerrar();
          }}
          className={`block min-h-[44px] w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-white/10 ${
            accion.peligro ? 'text-club-rojo' : 'text-white'
          }`}
        >
          {accion.etiqueta}
        </button>
      ))}
    </div>
  );
}

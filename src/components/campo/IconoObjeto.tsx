import type { TipoObjeto } from '../../types';

interface IconoObjetoProps {
  tipo: TipoObjeto;
  color: string;
  tamano?: number;
  rotacion?: number;
}

/** Icono SVG simple y reconocible por tipo de objeto de entrenamiento (FA1). */
export function IconoObjeto({ tipo, color, tamano = 28, rotacion = 0 }: IconoObjetoProps) {
  const trazo = '#00000066';

  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 32 32"
      className="pointer-events-none drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
      style={{ transform: rotacion ? `rotate(${rotacion}deg)` : undefined }}
      aria-hidden="true"
    >
      {tipo === 'cono' && <polygon points="16,4 26,28 6,28" fill={color} stroke={trazo} strokeWidth="1" />}

      {tipo === 'cono_plano' && <ellipse cx="16" cy="18" rx="12" ry="6" fill={color} stroke={trazo} strokeWidth="1" />}

      {tipo === 'pica' && (
        <>
          <ellipse cx="16" cy="28" rx="7" ry="2.5" fill={color} stroke={trazo} strokeWidth="1" />
          <rect x="14.5" y="3" width="3" height="25" fill={color} stroke={trazo} strokeWidth="1" />
        </>
      )}

      {tipo === 'escalera' && (
        <g stroke={color} strokeWidth="2.5" fill="none">
          <rect x="4" y="6" width="24" height="20" rx="1" stroke={color} />
          <line x1="4" y1="12" x2="28" y2="12" />
          <line x1="4" y1="18" x2="28" y2="18" />
          <line x1="4" y1="24" x2="28" y2="24" />
        </g>
      )}

      {tipo === 'mini_porteria' && (
        <g stroke={color} strokeWidth="2.5" fill="none">
          <line x1="4" y1="28" x2="4" y2="6" />
          <line x1="28" y1="28" x2="28" y2="6" />
          <line x1="4" y1="6" x2="28" y2="6" />
          <path d="M6 8 L11 12 M12 8 L17 12 M18 8 L23 12 M24 8 L26 10" strokeWidth="1" opacity="0.6" />
        </g>
      )}

      {tipo === 'aro' && <circle cx="16" cy="16" r="12" fill="none" stroke={color} strokeWidth="4" />}

      {tipo === 'maniqui' && (
        <g fill={color} stroke={trazo} strokeWidth="1">
          <circle cx="16" cy="7" r="5" />
          <path d="M8 30 L10 14 Q16 10 22 14 L24 30 Z" />
        </g>
      )}
    </svg>
  );
}

import { useEscalaCampo } from '../../hooks/useCampoEscala';
import type { JugadorEnCampo, JugadorRival, Marcaje } from '../../types';

interface CapaMarcajesProps {
  marcajes: Marcaje[];
  titulares: JugadorEnCampo[];
  jugadoresRival: JugadorRival[];
  onEliminar: (id: string) => void;
}

/** Líneas de marcaje entre un jugador propio y uno rival (FA4). Tocar la línea la elimina. */
export function CapaMarcajes({ marcajes, titulares, jugadoresRival, onEliminar }: CapaMarcajesProps) {
  const { aPixeles, ancho, alto } = useEscalaCampo();

  if (marcajes.length === 0 || ancho === 0) return null;

  return (
    <svg className="absolute inset-0" width={ancho} height={alto} aria-hidden="true">
      {marcajes.map((marcaje) => {
        const propio = titulares.find((t) => t.jugadorId === marcaje.jugadorPropioId);
        const rival = jugadoresRival.find((j) => j.id === marcaje.jugadorRivalId);
        if (!propio || !rival) return null;
        const a = aPixeles({ x: propio.x, y: propio.y });
        const b = aPixeles({ x: rival.x, y: rival.y });
        return (
          <g key={marcaje.id} className="pointer-events-auto cursor-pointer" onClick={() => onEliminar(marcaje.id)}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={14} />
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#D4111E"
              strokeWidth={2}
              strokeDasharray="6 5"
              opacity={0.85}
            />
          </g>
        );
      })}
    </svg>
  );
}

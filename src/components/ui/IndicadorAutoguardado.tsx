import { useAlineacionStore } from '../../store/alineacionStore';

const TEXTO: Record<string, string> = {
  guardado: 'Guardado',
  guardando: 'Guardando…',
  pendiente: 'Guardando…',
  error: 'Error al guardar',
};

const PUNTO: Record<string, string> = {
  guardado: 'bg-emerald-500',
  guardando: 'bg-amber-400 animate-pulse',
  pendiente: 'bg-amber-400 animate-pulse',
  error: 'bg-club-rojo',
};

export function IndicadorAutoguardado() {
  const estado = useAlineacionStore((s) => s.estadoGuardado);
  return (
    <div className="flex items-center gap-1.5 text-xs text-club-plata/80" role="status" aria-live="polite">
      <span className={`h-1.5 w-1.5 rounded-full ${PUNTO[estado]}`} />
      <span className="hidden sm:inline">{TEXTO[estado]}</span>
    </div>
  );
}

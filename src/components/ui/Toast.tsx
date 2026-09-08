import { useUiStore, type Toast as ToastType } from '../../store/uiStore';

const COLORES: Record<ToastType['tipo'], string> = {
  info: 'border-blue-500/40 bg-blue-950/90',
  exito: 'border-emerald-500/40 bg-emerald-950/90',
  error: 'border-club-rojo/50 bg-red-950/90',
};

export function Toast({ toast }: { toast: ToastType }) {
  const cerrarToast = useUiStore((s) => s.cerrarToast);
  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 text-sm text-white shadow-elevada backdrop-blur ${COLORES[toast.tipo]}`}
    >
      <span>{toast.mensaje}</span>
      {toast.accion && (
        <button onClick={toast.accion.ejecutar} className="font-semibold underline underline-offset-2">
          {toast.accion.etiqueta}
        </button>
      )}
      <button
        onClick={() => cerrarToast(toast.id)}
        aria-label="Cerrar aviso"
        className="ml-1 opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Boton } from '../ui/Boton';
import { MedidorFortaleza, evaluarFortaleza } from './MedidorFortaleza';

interface PantallaNuevaContrasenaProps {
  onListo: () => void;
}

export function PantallaNuevaContrasena({ onListo }: PantallaNuevaContrasenaProps) {
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const fortaleza = evaluarFortaleza(password);
  const valido = fortaleza.valida && password === confirmar;

  async function manejarEnvio(evento: FormEvent): Promise<void> {
    evento.preventDefault();
    if (!valido) return;
    setEnviando(true);
    setError(null);
    try {
      const { error: errorSupabase } = await supabase.auth.updateUser({ password });
      if (errorSupabase) {
        setError('No se pudo actualizar la contraseña. El enlace puede haber expirado, solicita uno nuevo.');
        return;
      }
      setExito(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-club-negro p-4">
      <div className="superficie-vidrio relative z-10 w-full max-w-[380px] rounded-2xl border border-white/10 p-6 shadow-elevada animar-entrada-tarjeta">
        <h1 className="mb-1 text-center font-display text-xl font-bold uppercase tracking-wide text-white">Nueva contraseña</h1>
        <p className="mb-5 text-center text-xs text-club-plata/60">Elige una contraseña nueva para tu cuenta.</p>

        {exito ? (
          <div className="flex flex-col gap-3 text-center">
            <p className="rounded-lg bg-emerald-500/15 px-3 py-3 text-sm text-emerald-400">
              Contraseña actualizada correctamente.
            </p>
            <Boton variante="primario" onClick={onListo} className="w-full">
              Continuar
            </Boton>
          </div>
        ) : (
          <form onSubmit={manejarEnvio} className="flex flex-col gap-3">
            <label className="text-xs text-club-plata">
              Contraseña nueva
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-club-rojo"
              />
              <div className="mt-1.5">
                <MedidorFortaleza password={password} />
              </div>
            </label>

            <label className="text-xs text-club-plata">
              Confirmar contraseña
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-club-rojo"
              />
              {confirmar.length > 0 && confirmar !== password && (
                <span className="text-[11px] text-club-rojo">Las contraseñas no coinciden.</span>
              )}
            </label>

            {error && <p className="rounded-lg bg-club-rojo/15 px-3 py-2 text-xs text-club-rojo">{error}</p>}

            <Boton type="submit" variante="primario" disabled={!valido || enviando} className="mt-1 w-full">
              {enviando ? 'Guardando…' : 'Guardar contraseña'}
            </Boton>
          </form>
        )}
      </div>
    </div>
  );
}

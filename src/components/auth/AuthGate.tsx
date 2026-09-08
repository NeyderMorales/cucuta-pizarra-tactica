import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabaseConfigurado } from '../../lib/supabaseClient';
import { PantallaAcceso } from './PantallaAcceso';
import { FormularioRegistro } from './FormularioRegistro';
import { PantallaNuevaContrasena } from './PantallaNuevaContrasena';
import { PantallaEstadoCuenta } from './PantallaEstadoCuenta';

function PantallaCargaAuth() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-club-negro text-club-plata">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-club-rojo border-t-transparent" />
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const inicializar = useAuthStore((s) => s.inicializar);
  const cargando = useAuthStore((s) => s.cargando);
  const session = useAuthStore((s) => s.session);
  const perfil = useAuthStore((s) => s.perfil);
  const enRecuperacion = useAuthStore((s) => s.enRecuperacion);
  const finalizarRecuperacion = useAuthStore((s) => s.finalizarRecuperacion);

  const [pantalla, setPantalla] = useState<'login' | 'registro'>('login');

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  if (!supabaseConfigurado) return <>{children}</>;
  if (cargando) return <PantallaCargaAuth />;

  if (enRecuperacion) {
    return <PantallaNuevaContrasena onListo={finalizarRecuperacion} />;
  }

  if (!session) {
    return pantalla === 'login' ? (
      <PantallaAcceso onIrARegistro={() => setPantalla('registro')} />
    ) : (
      <FormularioRegistro onVolver={() => setPantalla('login')} />
    );
  }

  if (!perfil) return <PantallaCargaAuth />;

  if (perfil.estado !== 'activo') {
    return <PantallaEstadoCuenta estado={perfil.estado} />;
  }

  return <>{children}</>;
}

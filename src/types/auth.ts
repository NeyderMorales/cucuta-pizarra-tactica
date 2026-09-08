export type RolUsuario = 'entrenador' | 'invitado';
export type EstadoCuenta = 'activo' | 'pendiente' | 'bloqueado';

export interface Perfil {
  id: string;
  usuario: string;
  nombre_completo: string;
  rol: RolUsuario;
  estado: EstadoCuenta;
  creado_en: string;
}

export type ResultadoIntento = 'exito' | 'fallido' | 'bloqueado';
export type MetodoIntento = 'password' | 'remember_token';

export interface IntentoLogin {
  id: number;
  user_id: string | null;
  usuario_intentado: string;
  resultado: ResultadoIntento;
  metodo: MetodoIntento;
  dispositivo: string | null;
  user_agent: string | null;
  ip: string | null;
  ciudad: string | null;
  pais: string | null;
  session_id: string | null;
  ocurrido_en: string;
}

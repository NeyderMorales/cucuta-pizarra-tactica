export interface DatosIp {
  ip: string | null;
  ciudad: string | null;
  pais: string | null;
}

const SIN_DATOS: DatosIp = { ip: null, ciudad: null, pais: null };

/**
 * Mejor esfuerzo, no bloqueante: consulta un servicio público (ipapi.co) para
 * anotar IP/ciudad/país aproximados en el historial de accesos (FA8). Esto
 * envía la IP del usuario a un tercero — si el club prefiere no hacerlo,
 * basta con no llamar a esta función (queda "IP no disponible" en la UI, sin
 * romper nada más). Nunca bloquea el login: si falla o tarda, se ignora.
 */
export async function obtenerDatosIp(timeoutMs = 2500): Promise<DatosIp> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);
  try {
    const respuesta = await fetch('https://ipapi.co/json/', { signal: controlador.signal });
    if (!respuesta.ok) return SIN_DATOS;
    const datos = (await respuesta.json()) as { ip?: string; city?: string; country_name?: string };
    return {
      ip: datos.ip ?? null,
      ciudad: datos.city ?? null,
      pais: datos.country_name ?? null,
    };
  } catch {
    return SIN_DATOS;
  } finally {
    clearTimeout(temporizador);
  }
}

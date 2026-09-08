/** Deriva un texto legible ("Tablet · iPadOS · Safari") del user-agent, sin librerías externas. */
export function describirDispositivo(userAgent: string): string {
  const ua = userAgent;
  let tipo = 'Escritorio';
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && /Mobile/.test(ua))) tipo = 'Tablet';
  else if (/Tablet|PlayBook/.test(ua)) tipo = 'Tablet';
  else if (/Mobi|Android(?!.*Tablet)|iPhone/.test(ua)) tipo = 'Móvil';

  let so = 'SO desconocido';
  if (/iPad|iPhone|iPod/.test(ua)) so = 'iOS';
  else if (/Macintosh/.test(ua)) so = 'macOS';
  else if (/Windows/.test(ua)) so = 'Windows';
  else if (/Android/.test(ua)) so = 'Android';
  else if (/Linux/.test(ua)) so = 'Linux';

  let navegador = 'Navegador desconocido';
  if (/Edg\//.test(ua)) navegador = 'Edge';
  else if (/OPR\/|Opera/.test(ua)) navegador = 'Opera';
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) navegador = 'Chrome';
  else if (/CriOS/.test(ua)) navegador = 'Chrome';
  else if (/Firefox\//.test(ua)) navegador = 'Firefox';
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) navegador = 'Safari';

  return `${tipo} · ${so} · ${navegador}`;
}

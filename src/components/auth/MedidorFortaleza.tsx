const CONTRASENAS_COMUNES = new Set([
  '12345678', 'password', 'password1', 'contraseña', 'contrasena123', 'qwertyui',
  '11111111', 'cucuta123', 'futbol123', 'admin1234', 'bienvenido', 'iloveyou1',
]);

export interface EvaluacionFortaleza {
  puntaje: 0 | 1 | 2 | 3 | 4;
  etiqueta: string;
  valida: boolean;
  motivo?: string;
}

export function evaluarFortaleza(password: string): EvaluacionFortaleza {
  if (password.length < 10) {
    return { puntaje: 0, etiqueta: 'Muy corta', valida: false, motivo: 'Usa al menos 10 caracteres.' };
  }
  if (CONTRASENAS_COMUNES.has(password.toLowerCase())) {
    return { puntaje: 0, etiqueta: 'Muy común', valida: false, motivo: 'Esa contraseña aparece en listas filtradas conocidas.' };
  }

  let puntaje = 1;
  if (password.length >= 14) puntaje++;
  if (password.length >= 18) puntaje++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) puntaje++;
  if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) puntaje++;
  const puntajeFinal = Math.min(4, puntaje) as 0 | 1 | 2 | 3 | 4;

  const etiquetas = ['Muy corta', 'Débil', 'Aceptable', 'Buena', 'Excelente'];
  return { puntaje: puntajeFinal, etiqueta: etiquetas[puntajeFinal]!, valida: true };
}

export function MedidorFortaleza({ password }: { password: string }) {
  if (!password) return null;
  const evaluacion = evaluarFortaleza(password);
  const colores = ['bg-club-rojo', 'bg-club-rojo', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-base ${
              i <= evaluacion.puntaje - 1 || (evaluacion.puntaje === 0 && i === 0) ? colores[evaluacion.puntaje] : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] ${evaluacion.valida ? 'text-club-plata/60' : 'text-club-rojo'}`}>
        {evaluacion.motivo ?? evaluacion.etiqueta}
      </p>
    </div>
  );
}

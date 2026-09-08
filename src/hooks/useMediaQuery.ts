import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [coincide, setCoincide] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const escuchar = (evento: MediaQueryListEvent) => setCoincide(evento.matches);
    setCoincide(mql.matches);
    mql.addEventListener('change', escuchar);
    return () => mql.removeEventListener('change', escuchar);
  }, [query]);

  return coincide;
}

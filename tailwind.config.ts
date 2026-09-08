import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        club: {
          rojo: '#D4111E',
          'rojo-oscuro': '#8C0B14',
          negro: '#111111',
          carbon: '#1A1A1D',
          grafito: '#232327',
          plata: '#C7C9CC',
          cesped: '#1E5B32',
          'cesped-claro': '#256B3C',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        sans: ['"Archivo"', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        rapido: '120ms',
        base: '180ms',
        lento: '260ms',
      },
      boxShadow: {
        tarjeta: '0 6px 16px -4px rgba(0,0,0,0.55)',
        elevada: '0 14px 28px -6px rgba(0,0,0,0.65)',
      },
      height: {
        dvh: '100dvh',
      },
      minHeight: {
        dvh: '100dvh',
      },
    },
  },
  plugins: [],
} satisfies Config;

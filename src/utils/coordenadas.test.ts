import { describe, expect, it } from 'vitest';
import { distancia, pixelesAPorcentaje, porcentajeAPixeles } from './coordenadas';

describe('porcentajeAPixeles / pixelesAPorcentaje', () => {
  it('convierte porcentaje a píxeles y de vuelta sin pérdida en orientación vertical', () => {
    const dimensiones = { ancho: 320, alto: 560 };
    const original = { x: 25, y: 75 };
    const px = porcentajeAPixeles(original, dimensiones, 'vertical');
    expect(px).toEqual({ x: 80, y: 420 });
    expect(pixelesAPorcentaje(px, dimensiones, 'vertical')).toEqual(original);
  });

  it('convierte porcentaje a píxeles y de vuelta sin pérdida en orientación horizontal (ejes rotados)', () => {
    const dimensiones = { ancho: 800, alto: 500 };
    const original = { x: 30, y: 90 };
    const px = porcentajeAPixeles(original, dimensiones, 'horizontal');
    // en horizontal, x normalizado usa el alto de pantalla y el "y" (largo del campo) usa el ancho
    expect(px).toEqual({ x: 720, y: 150 });
    expect(pixelesAPorcentaje(px, dimensiones, 'horizontal')).toEqual(original);
  });

  it('mantiene la posición relativa al cambiar el tamaño del contenedor (responsivo)', () => {
    const pequeno = { ancho: 320, alto: 568 };
    const grande = { ancho: 1600, alto: 900 };
    const porcentaje = { x: 50, y: 84 };

    const pxPequeno = porcentajeAPixeles(porcentaje, pequeno, 'vertical');
    const pxGrande = porcentajeAPixeles(porcentaje, grande, 'vertical');

    expect(pixelesAPorcentaje(pxPequeno, pequeno, 'vertical')).toEqual(porcentaje);
    expect(pixelesAPorcentaje(pxGrande, grande, 'vertical')).toEqual(porcentaje);
  });

  it('limita el resultado al rango 0-100 aunque el píxel esté fuera del contenedor', () => {
    const dimensiones = { ancho: 100, alto: 100 };
    expect(pixelesAPorcentaje({ x: -50, y: 9999 }, dimensiones, 'vertical')).toEqual({ x: 0, y: 100 });
  });

  it('devuelve el origen si las dimensiones del contenedor todavía no se han medido', () => {
    expect(pixelesAPorcentaje({ x: 10, y: 10 }, { ancho: 0, alto: 100 }, 'vertical')).toEqual({ x: 0, y: 0 });
  });
});

describe('distancia', () => {
  it('calcula la distancia euclidiana entre dos puntos', () => {
    expect(distancia({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

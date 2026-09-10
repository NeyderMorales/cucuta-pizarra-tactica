import { beforeEach, describe, expect, it } from 'vitest';
import { useAlineacionStore } from '../store/alineacionStore';
import { usePlantillaStore } from '../store/plantillaStore';
import { obtenerFormacion } from '../data/formaciones';

/**
 * Reglas de la jugada animada: cada frame es una instantánea de lo que se mueve,
 * el frame activo se captura solo al cambiar de frame (nadie pulsa "guardar"), y
 * moverse por la secuencia nunca destruye lo ya definido en otros frames.
 */
describe('secuencia táctica: frames', () => {
  const estado = () => useAlineacionStore.getState();
  const doc = () => estado().historial.presente;
  const posicionDe = (jugadorId: string) => doc().titulares.find((t) => t.jugadorId === jugadorId);

  let jugadorId: string;

  beforeEach(() => {
    useAlineacionStore.getState().nuevaAlineacion();
    const formacion = obtenerFormacion(doc().formacionId)!;
    const zona = formacion.zonas[0]!;
    jugadorId = usePlantillaStore.getState().jugadores[0]!.id;
    estado().asignarJugador(zona.id, zona.x, zona.y, jugadorId);
  });

  it('arranca sin secuencia: la pizarra se comporta como siempre', () => {
    expect(doc().secuencia).toBeNull();
  });

  it('al iniciar una jugada, el estado actual queda como primer frame', () => {
    estado().iniciarSecuencia();
    const secuencia = doc().secuencia!;
    expect(secuencia.frames).toHaveLength(1);
    expect(secuencia.indiceActivo).toBe(0);
    expect(secuencia.frames[0]!.titulares).toHaveLength(1);
  });

  it('mover a un jugador y cambiar de frame no destruye el frame anterior', () => {
    estado().iniciarSecuencia();
    const inicial = { ...posicionDe(jugadorId)! };

    estado().agregarFrame();
    estado().moverJugador(jugadorId, 80, 20);
    expect(posicionDe(jugadorId)).toMatchObject({ x: 80, y: 20 });

    // Volver al primero devuelve la posición de partida…
    estado().irAFrame(0);
    expect(posicionDe(jugadorId)).toMatchObject({ x: inicial.x, y: inicial.y });

    // …y el segundo conserva lo suyo, sin haber pulsado ningún "guardar".
    estado().irAFrame(1);
    expect(posicionDe(jugadorId)).toMatchObject({ x: 80, y: 20 });
  });

  it('duplicar copia el frame y eliminar respeta el mínimo de uno', () => {
    estado().iniciarSecuencia();
    estado().duplicarFrame(0);
    expect(doc().secuencia!.frames).toHaveLength(2);

    estado().eliminarFrame(1);
    expect(doc().secuencia!.frames).toHaveLength(1);

    estado().eliminarFrame(0);
    expect(doc().secuencia!.frames).toHaveLength(1);
  });

  it('los frames entran en el historial: deshacer revierte el frame añadido', () => {
    estado().iniciarSecuencia();
    estado().agregarFrame();
    expect(doc().secuencia!.frames).toHaveLength(2);

    estado().deshacer();
    expect(doc().secuencia!.frames).toHaveLength(1);
  });

  it('descartar la jugada devuelve la pizarra a su estado normal', () => {
    estado().iniciarSecuencia();
    estado().agregarFrame();
    estado().descartarSecuencia();
    expect(doc().secuencia).toBeNull();
    // El tablero conserva a los jugadores: descartar la animación no vacía el campo.
    expect(doc().titulares).toHaveLength(1);
  });
});

/**
 * La jugada se reproduce leyendo los frames guardados, no lo que hay en
 * pantalla. Estas pruebas cubren el volcado del frame activo, que es lo que
 * mantiene sincronizadas ambas cosas.
 */
describe('secuencia táctica: volcado del frame activo', () => {
  const estado = () => useAlineacionStore.getState();
  const doc = () => estado().historial.presente;

  let jugadorId: string;

  beforeEach(() => {
    useAlineacionStore.getState().nuevaAlineacion();
    const formacion = obtenerFormacion(doc().formacionId)!;
    const zona = formacion.zonas[0]!;
    jugadorId = usePlantillaStore.getState().jugadores[0]!.id;
    estado().asignarJugador(zona.id, zona.x, zona.y, jugadorId);
  });

  it('ir al frame en el que ya se está guarda lo editado sin moverse de sitio', () => {
    estado().iniciarSecuencia();
    estado().moverJugador(jugadorId, 75, 15);
    estado().irAFrame(0);

    expect(doc().secuencia!.indiceActivo).toBe(0);
    expect(doc().secuencia!.frames[0]!.titulares[0]).toMatchObject({ x: 75, y: 15 });
  });

  it('volcar un frame sin cambios no ensucia el historial', () => {
    estado().iniciarSecuencia();
    const pasosAntes = estado().historial.pasado.length;
    estado().irAFrame(0);
    estado().irAFrame(0);
    expect(estado().historial.pasado.length).toBe(pasosAntes);
  });
});

export type Posicion =
  | 'POR'
  | 'LD'
  | 'DFC'
  | 'LI'
  | 'MCD'
  | 'MC'
  | 'MCO'
  | 'MD'
  | 'MI'
  | 'ED'
  | 'EI'
  | 'SD'
  | 'DC';

export type PiePreferido = 'izquierdo' | 'derecho' | 'ambos';

export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  dorsal: number;
  posicionNatural: Posicion;
  posicionesSecundarias: Posicion[];
  fotoUrl: string | null;
  piePreferido: PiePreferido;
  activo: boolean;
}

export interface ZonaFormacion {
  id: string;
  posicion: Posicion;
  x: number;
  y: number;
}

export interface Formacion {
  id: string;
  nombre: string;
  variante?: string;
  zonas: ZonaFormacion[];
}

export interface JugadorEnCampo {
  jugadorId: string;
  x: number;
  y: number;
  zonaOrigenId?: string;
  esCapitan: boolean;
  nota?: string;
}

export type TipoTrazo = 'libre' | 'flecha' | 'discontinua' | 'zona' | 'texto';

export interface PuntoNormalizado {
  x: number;
  y: number;
}

export interface Trazo {
  id: string;
  tipo: TipoTrazo;
  puntos: PuntoNormalizado[];
  color: string;
  grosor: 1 | 2 | 3;
  texto?: string;
}

// --- Anexo A: objetos de entrenamiento (FA1) ---

export type TipoObjeto = 'cono' | 'cono_plano' | 'pica' | 'escalera' | 'mini_porteria' | 'aro' | 'maniqui';
export type ColorObjeto = 'naranja' | 'amarillo' | 'blanco' | 'rojo' | 'negro';

export interface ObjetoCampo {
  id: string;
  tipo: TipoObjeto;
  x: number;
  y: number;
  color: ColorObjeto;
  rotacion: number;
}

// --- Anexo A: balón (FA2) ---

export interface Balon {
  id: string;
  x: number;
  y: number;
  jugadorPoseedorId: string | null;
}

// --- Anexo A: cuadrícula y zonas (FA3) ---

export type PresetCuadricula =
  | 'off'
  | 'tercios'
  | 'carriles-5'
  | 'juego-posicion'
  | 'zonas-12'
  | 'zonas-18'
  | 'mitades'
  | 'personalizada';

export type ColorCelda = 'rojo' | 'ambar' | 'azul';
export type EstiloLineaCuadricula = 'solida' | 'discontinua' | 'puntos';

export interface CuadriculaCampo {
  preset: PresetCuadricula;
  columnas: number;
  filas: number;
  opacidad: number;
  estiloLinea: EstiloLineaCuadricula;
  mostrarEtiquetas: boolean;
  imantar: boolean;
  celdasPintadas: Record<string, ColorCelda>;
}

// --- Anexo A: equipo rival (FA4) ---

export interface JugadorRival {
  id: string;
  dorsal: number;
  apellido?: string;
  posicion: Posicion;
  x: number;
  y: number;
  zonaOrigenId?: string;
}

export type PaletaRival = 'blanco' | 'gris' | 'azul';
export type ModoVistaEquipos = 'solo_nosotros' | 'ambos' | 'solo_rival';

export interface EquipoRival {
  nombre: string;
  formacionId: string;
  paleta: PaletaRival;
  jugadores: JugadorRival[];
  visible: boolean;
  modoVista: ModoVistaEquipos;
}

export interface Marcaje {
  id: string;
  jugadorPropioId: string;
  jugadorRivalId: string;
}

// --- Anexo A: identidad de cancha (FA5) ---

export type TemaCancha = 'estadio' | 'neutro' | 'entrenamiento' | 'tactico';
export type VistaCampo = 'completo' | 'medio' | 'tercio';

export interface IdentidadCancha {
  tema: TemaCancha;
  vista: VistaCampo;
  mostrarEscudo: boolean;
  mostrarValla: boolean;
  rotado180: boolean;
}

export interface Alineacion {
  id: string;
  nombre: string;
  formacionId: string;
  titulares: JugadorEnCampo[];
  banquillo: string[];
  trazos: Trazo[];
  notas: string;
  creadaEn: string;
  modificadaEn: string;
  objetos: ObjetoCampo[];
  balones: Balon[];
  cuadricula: CuadriculaCampo;
  rival: EquipoRival | null;
  marcajes: Marcaje[];
  cancha: IdentidadCancha;
}

export type Orientacion = 'vertical' | 'horizontal';

export type EstadoGuardado = 'guardado' | 'guardando' | 'pendiente' | 'error';

export type Herramienta = 'seleccion' | 'libre' | 'flecha' | 'discontinua' | 'zona' | 'texto' | 'borrador';

export type EstrategiaCambioFormacion = 'reubicar' | 'vaciar' | 'cancelar';

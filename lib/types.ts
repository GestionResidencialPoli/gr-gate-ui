export type EstadoAforo = "DISPONIBLE" | "POCOS_CUPOS" | "COMPLETO";
export const TIPOS_VISITA = ["SOCIAL", "DOMICILIO", "SERVICIO", "OTRO"] as const;
export type TipoVisita = (typeof TIPOS_VISITA)[number];

export type Aforo = {
  total: number;
  ocupados: number;
  disponibles: number;
  sobrecupo: boolean;
  estado: EstadoAforo;
  actualizadoEn: string;
};

export type CambioAforo = {
  id: number;
  totalAnterior: number;
  totalNuevo: number;
  ocupadosEnElCambio: number;
  cambiadoPor: { userId: number; email: string };
  cambiadoEn: string;
};

export type Visitante = {
  id: number;
  documento: string;
  nombre: string;
};

export type Visita = {
  id: number;
  visitante: Visitante;
  apartamento: { id: number; torre: string; numero: string };
  tipoVisita: TipoVisita;
  conVehiculo: boolean;
  placa: string | null;
  estado: "ABIERTA" | "CERRADA";
  entrada: { en: string; vigilante: { userId: number; email: string } };
  salida: { en: string; vigilante: { userId: number; email: string } } | null;
  minutosDentro: number;
  posibleOlvido: boolean;
};

export type IngresoInput = {
  documento: string;
  nombre?: string;
  torre: string;
  numero: string;
  tipoVisita: TipoVisita;
  conVehiculo: boolean;
  placa?: string;
  cerrarVisitaAnterior: boolean;
};

export type PageResult<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

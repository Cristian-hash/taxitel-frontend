export interface CotizacionRequest {
  
  empresa: string;
  paradas: string[];
  tieneMensajeria: boolean;
  minutosEspera: number;
}

export interface Tramo {
  origen: string;
  destino: string;
  tarifaBase: number;
}

export interface CotizacionResponse {
  tramos: Tramo[];
  tarifaBaseTotal: number;
  recargoMensajeria: number;
  recargoEspera: number;
  total: number; // Angular exigía saber que existe un Total
}
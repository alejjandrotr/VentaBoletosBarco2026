export interface CrearReglaItinerarioDTO {
  id?: string;
  nombre: string;
  tipoAplicacion: 'DIAS_SEMANA' | 'FECHA_ESPECIFICA';
  diasSemana?: number[];
  fechaEspecifica?: string;
  rutaId: string;
  horaPartida: string; // 'HH:mm'
  embarcacionDefaultId: string;
  activo?: boolean;
}

export interface ActualizarReglaItinerarioDTO {
  nombre?: string;
  tipoAplicacion?: 'DIAS_SEMANA' | 'FECHA_ESPECIFICA';
  diasSemana?: number[];
  fechaEspecifica?: string;
  rutaId?: string;
  horaPartida?: string;
  embarcacionDefaultId?: string;
  activo?: boolean;
}

export interface ReglaItinerarioResponseDTO {
  id: string;
  nombre: string;
  tipoAplicacion: string;
  diasSemana?: number[];
  fechaEspecifica?: string;
  rutaId: string;
  rutaNombre?: string;
  horaPartida: string;
  embarcacionDefaultId: string;
  embarcacionNombre?: string;
  embarcacionCodigo?: string;
  activo: boolean;
}

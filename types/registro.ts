export interface IntIngredienteActivoDto {
  nombre: string;
  concentracion: string;
  porcentaje: string;
}

export interface IntAvanceDto {
  numeroExpediente: string;
  presentacionExpediente: string;
  terminoRegistro: string;
  comentario: string;
  statusAvance: string;
  valor: string;
}

export interface IntCertificadoDto {
  numeroCertificado: string;
  fechaRegistro: string;
  fechaActualizacion: string;
  vigenciaRegistro: string;
  formulador: IntEmpresaDto[];
  fabricante: IntEmpresaDto[];
}

export interface IntEmpresaDto {
  nombre: string;
  pais: string;
  direccion: string;
}

export interface IntMarcaDto {
  registroMarcaId?: number;
  marcaRegistrada: string;
  numeroRegistro: string;
  claseRegistroMarca: string;
  tipoRegistroMarca: string;
  fechaRegistro: string;
  vigencia: string;
  logo: string;
}

export interface IntPlagaDto {
  nombreComun: string;
  nombreCientifico: string;
  dosis: string;
  lmr: string;
  pcDias?: number;
  prHoras?: number;
}

export interface IntUsoDto {
  cultivoId?: number;
  cultivoNombre: string;
  numeroResolucion: string;
  plagas: IntPlagaDto[];
}

export interface IntProductoRegistradoEntity {
  registroProductoId?: number;
  tipoProducto: string;
  producto: string;
  ingredienteActivo: IntIngredienteActivoDto[];
  formulacion: string;
  claseUso: string;
  bandaToxicologica: string;
  presentacionRegistrada: string;
  tipoEnvase: string;
  materialesEnvase: string;
  descripcion: string;
  dictamenTecnico: string;
  estabilidadProducto: string;
  avance: IntAvanceDto;
  certificado: IntCertificadoDto;
  fabricantes: IntEmpresaDto[];
  formuladores: IntEmpresaDto[];
  marca: IntMarcaDto;
  usos: IntUsoDto[];
}

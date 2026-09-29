export interface Hogar {
  id_hogar: number;
  nombre_hogar: string;
  fecha_creacion?: Date | string;
}

export interface Miembro {
  id_miembro: number;
  id_hogar?: number | null;
  nombre_completo: string;
  correo: string;
  telefono?: string | null;
  estado_activo: boolean;
  contrasena?: string;
  correo_ofuscado?: string;
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion?: string | null;
}

export interface Transaccion {
  id_transaccion: number;
  id_miembro: number;
  id_categoria: number;
  tipo_movimiento: 'Ingreso' | 'Egreso' | string;
  monto: number;
  medio_pago: string;
  descripcion_gasto?: string | null;
  fecha_registro: Date | string;
}

// Interfaces para consultas con JOIN (Reportes del Informe)
export interface MiembroConHogar {
  nombre_hogar: string;
  nombre_completo: string;
}

export interface TransaccionConHogar {
  nombre_hogar: string;
  nombre_completo: string;
  monto: number;
}

export interface TransaccionConMiembro {
  nombre_completo: string;
  monto: number;
  fecha_registro: Date | string;
}

export interface TransaccionDetallada {
  nombre_completo: string;
  nombre_categoria: string;
  monto: number;
}

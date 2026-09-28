export interface Miembro {
  id_miembro: number;
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

// Interfaces para consultas complejas con JOIN
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

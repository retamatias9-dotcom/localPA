export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_kilo: number | null;
  precio_por_kilo: boolean;
  imagen_url: string;
  categoria: string;
  marca: string;
  stock: number;
  created_at: string;
}

export type ProductoFormData = Omit<Producto, 'id' | 'created_at'>;

/** 'unidad' = bolsa cerrada · 'kilo' = bolsa abierta para vender suelto por kilo. */
export type TipoVenta = 'unidad' | 'kilo';

export interface Venta {
  id: string;
  producto_id: string | null;
  producto_nombre: string;
  marca: string | null;
  /** Siempre en bolsas, se abran o no. */
  cantidad: number;
  tipo: TipoVenta;
  precio_unitario: number;
  total: number;
  vendido_por: string | null;
  /** Facturar es opcional: una venta sin facturar queda en false. */
  facturada: boolean;
  factura_numero: string | null;
  factura_cliente: string | null;
  /** CUIT o DNI del cliente. */
  factura_doc: string | null;
  factura_fecha: string | null;
  /** true si la factura fiscal se emitió en Comprobantes en Línea de AFIP. */
  factura_externa: boolean;
  created_at: string;
}

export type VentaFormData = Omit<Venta, 'id' | 'created_at'>;

/** Datos que se cargan al facturar una venta. */
export interface FacturaData {
  factura_numero: string;
  factura_cliente: string;
  factura_doc: string | null;
  /** true = el número corresponde a una factura emitida en AFIP. */
  externa?: boolean;
}

/**
 * Datos del emisor: a nombre de quién salen las facturas. Se editan desde
 * Panel → Facturación, así la app se puede entregar a otro negocio sin tocar código.
 */
export interface ConfigNegocio {
  nombre: string;
  detalle: string;
  contacto: string;
  cuit: string;
  domicilio: string;
  condicion_iva: string;
  ingresos_brutos: string;
  inicio_actividades: string;
}

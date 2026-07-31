export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_kilo: number | null;
  precio_por_kilo: boolean;
  imagen_url: string;
  categoria: string;
  created_at: string;
}

export type ProductoFormData = Omit<Producto, 'id' | 'created_at'>;

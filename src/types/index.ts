export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria: string;
  created_at: string;
}

export type ProductoFormData = Omit<Producto, 'id' | 'created_at'>;

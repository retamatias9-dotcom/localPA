import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { mostrarAvisoPago } from '../components/AvisoPago';
import type { Producto, ProductoFormData, TipoVenta } from '../types';

export function useProducts() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setProductos(data as Producto[]);
      mostrarAvisoPago();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  async function createProducto(formData: ProductoFormData) {
    const { data, error } = await supabase
      .from('productos')
      .insert(formData)
      .select()
      .single();

    if (error) return { error: error.message };
    setProductos((prev) => [data as Producto, ...prev]);
    return { error: null };
  }

  async function updateProducto(id: string, formData: ProductoFormData) {
    const { data, error } = await supabase
      .from('productos')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    setProductos((prev) => prev.map((p) => (p.id === id ? (data as Producto) : p)));
    return { error: null };
  }

  async function deleteProducto(id: string) {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) return { error: error.message };
    setProductos((prev) => prev.filter((p) => p.id !== id));
    return { error: null };
  }

  // Registra un movimiento y descuenta el stock del producto correspondiente.
  // La cantidad siempre son bolsas. Abrir una bolsa (tipo 'kilo') descuenta stock
  // igual que una venta, pero no lleva importe: no es una venta.
  async function venderProducto(
    producto: Producto,
    cantidad: number,
    tipo: TipoVenta,
    vendidoPor: string | null
  ) {
    const precioUnitario = tipo === 'kilo' ? 0 : producto.precio;
    const total = precioUnitario * cantidad;
    const nuevoStock = Math.max(0, producto.stock - cantidad);

    const { error: ventaError } = await supabase.from('ventas').insert({
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      marca: producto.marca || null,
      cantidad,
      tipo,
      precio_unitario: precioUnitario,
      total,
      vendido_por: vendidoPor,
    });
    if (ventaError) return { error: ventaError.message };

    const { data, error: stockError } = await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', producto.id)
      .select()
      .single();

    if (stockError) return { error: stockError.message };
    setProductos((prev) => prev.map((p) => (p.id === producto.id ? (data as Producto) : p)));
    return { error: null, producto: data as Producto };
  }

  return {
    productos,
    loading,
    error,
    refetch: fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    venderProducto,
  };
}

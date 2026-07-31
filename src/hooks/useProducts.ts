import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Producto, ProductoFormData } from '../types';

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

  return {
    productos,
    loading,
    error,
    refetch: fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto,
  };
}

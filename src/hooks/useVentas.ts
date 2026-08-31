import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { FacturaData, Venta } from '../types';

export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setVentas(data as Venta[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  // Facturar es opcional y no toca la venta en sí (importes, stock ni fecha):
  // solo le agrega los datos del comprobante emitido.
  async function facturarVenta(id: string, datos: FacturaData) {
    const { data, error } = await supabase
      .from('ventas')
      .update({
        facturada: true,
        factura_numero: datos.factura_numero,
        factura_cliente: datos.factura_cliente || null,
        factura_doc: datos.factura_doc || null,
        factura_fecha: new Date().toISOString(),
        factura_externa: datos.externa ?? false,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    const venta = data as Venta;
    setVentas((prev) => prev.map((v) => (v.id === id ? venta : v)));
    return { error: null, venta };
  }

  // Deja la venta como no facturada y borra los datos del comprobante, para
  // poder volver a facturarla desde cero si se cargó algo mal.
  async function anularFactura(id: string) {
    const { data, error } = await supabase
      .from('ventas')
      .update({
        facturada: false,
        factura_numero: null,
        factura_cliente: null,
        factura_doc: null,
        factura_fecha: null,
        factura_externa: false,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { error: error.message };
    setVentas((prev) => prev.map((v) => (v.id === id ? (data as Venta) : v)));
    return { error: null };
  }

  return {
    ventas,
    loading,
    error,
    refetch: fetchVentas,
    facturarVenta,
    anularFactura,
  };
}

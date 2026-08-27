import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { NEGOCIO_POR_DEFECTO } from '../lib/comprobante';
import type { ConfigNegocio } from '../types';

/**
 * Datos del emisor de las facturas. Es una única fila en config_negocio: si
 * todavía no se cargó nada, se usan los valores por defecto para que el
 * comprobante nunca salga vacío.
 */
export function useConfigNegocio() {
  const [config, setConfig] = useState<ConfigNegocio>(NEGOCIO_POR_DEFECTO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('config_negocio')
      .select('*')
      .eq('id', true)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else if (data) {
      setConfig({ ...NEGOCIO_POR_DEFECTO, ...(data as ConfigNegocio) });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  async function guardar(nuevos: ConfigNegocio) {
    const { data, error } = await supabase
      .from('config_negocio')
      .update({ ...nuevos, updated_at: new Date().toISOString() })
      .eq('id', true)
      .select()
      .single();

    if (error) return { error: error.message };
    setConfig({ ...NEGOCIO_POR_DEFECTO, ...(data as ConfigNegocio) });
    return { error: null };
  }

  return { config, loading, error, guardar, refetch: fetchConfig };
}

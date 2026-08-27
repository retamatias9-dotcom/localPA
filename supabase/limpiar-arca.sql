-- Elimina todo rastro de la facturación electrónica ARCA de la base.
-- Pegar en Supabase > SQL Editor > New query > Run.
--
-- OJO: esto borra datos, no se puede deshacer. Correr solo si no hay ningún
-- comprobante con CAE emitido. Para confirmarlo antes:
--
--   select count(*) from public.ventas where cae is not null;
--
-- Si devuelve algo distinto de 0, hay facturas fiscales reales: pará acá,
-- porque un comprobante autorizado por ARCA no se anula borrando la fila.
--
-- Lo que NO toca: facturada, factura_numero, factura_cliente, factura_doc,
-- factura_fecha y factura_externa. Esas columnas son del comprobante interno
-- y del modo "Facturar en AFIP", que siguen funcionando.

-- 1. El índice que impedía emitir dos veces el mismo comprobante fiscal.
drop index if exists public.ventas_comprobante_unico;

-- 2. Las columnas fiscales que llenaba la Edge Function con la respuesta de ARCA.
alter table public.ventas
  drop column if exists arca_entorno,
  drop column if exists comprobante_tipo,
  drop column if exists punto_venta,
  drop column if exists comprobante_numero,
  drop column if exists doc_tipo,
  drop column if exists condicion_iva_receptor,
  drop column if exists importe_neto,
  drop column if exists importe_iva,
  drop column if exists cae,
  drop column if exists cae_vencimiento,
  drop column if exists comprobante_fecha,
  drop column if exists emisor_cuit;

-- 3. La caché del ticket de acceso de WSAA.
drop table if exists public.arca_ta;

-- config_negocio NO se borra: son los datos del emisor que salen impresos en
-- el comprobante interno y se editan desde Panel → Facturación.

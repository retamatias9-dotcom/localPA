import type { ConfigNegocio, Venta } from '../types';
import { formatCantidad, formatPrecio } from './format';

/**
 * Comprobantes en Línea de AFIP. Es una app web con sesión detrás de clave
 * fiscal: no acepta parámetros ni tiene API, así que lo único que se puede
 * hacer es abrirla y dejar los datos listos para pegar a mano.
 */
export const URL_COMPROBANTES_EN_LINEA =
  'https://auth.afip.gob.ar/contribuyente_/login.xhtml?action=SYSTEM&system=rcel';

/** Los campos del formulario de AFIP, en el mismo orden en que se cargan. */
export function datosParaAfip(venta: Venta) {
  const descripcion = [venta.producto_nombre, venta.marca].filter(Boolean).join(' - ');
  return [
    { label: 'Descripción', valor: descripcion },
    { label: 'Cantidad', valor: String(venta.cantidad) },
    { label: 'Unidad de medida', valor: 'unidades' },
    { label: 'Precio unitario', valor: venta.precio_unitario.toFixed(2) },
    { label: 'Importe total', valor: Number(venta.total).toFixed(2) },
  ];
}

/** Número del comprobante. Lo asigna la app, no hay serie fiscal. */
export const numeroComprobante = (venta: Venta) => venta.factura_numero ?? '—';

/**
 * Fallback del emisor. Los datos reales se cargan desde Panel → Facturación y
 * viven en la tabla config_negocio: esto solo evita que el comprobante salga
 * en blanco antes de configurarlo.
 */
export const NEGOCIO_POR_DEFECTO: ConfigNegocio = {
  nombre: '',
  detalle: '',
  contacto: '',
  cuit: '',
  domicilio: '',
  condicion_iva: 'Responsable Monotributo',
  ingresos_brutos: '',
  inicio_actividades: '',
};

/** Cantidad de dígitos del número de comprobante interno (0000001). */
const LARGO_NUMERO = 7;

/** Sugiere el próximo número de comprobante: el mayor ya emitido + 1. */
export function siguienteNumeroFactura(ventas: Venta[]): string {
  let mayor = 0;
  for (const v of ventas) {
    const digitos = (v.factura_numero ?? '').replace(/\D/g, '');
    if (!digitos) continue;
    const n = Number(digitos);
    if (Number.isSafeInteger(n) && n > mayor) mayor = n;
  }
  return String(mayor + 1).padStart(LARGO_NUMERO, '0');
}

function esc(valor: string) {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function filaDetalle(venta: Venta) {
  return `
    <tr>
      <td>${esc(venta.producto_nombre)}${venta.marca ? ` <span class="muted">· ${esc(venta.marca)}</span>` : ''}</td>
      <td class="num">${formatCantidad(venta.cantidad)} bolsa${venta.cantidad === 1 ? '' : 's'}</td>
      <td class="num">${formatPrecio(venta.precio_unitario)}</td>
      <td class="num">${formatPrecio(venta.total)}</td>
    </tr>`;
}

const ESTILOS = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #1c1917;
    background: #fff;
  }
  .hoja { max-width: 720px; margin: 0 auto; position: relative; }
  header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #1c1917; padding-bottom: 16px; }
  h1 { margin: 0; font-size: 20px; }
  h2 { margin: 22px 0 6px; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #78716c; }
  .muted { color: #78716c; }
  .chico { font-size: 12px; }
  .doc { text-align: right; }
  .doc .numero { font-size: 18px; font-weight: 700; }
  dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; margin: 0; font-size: 13px; }
  dt { color: #78716c; }
  dd { margin: 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 13px; }
  th, td { padding: 8px 6px; border-bottom: 1px solid #e7e5e4; text-align: left; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #78716c; }
  .num { text-align: right; white-space: nowrap; }
  tfoot td { border-bottom: none; padding-top: 6px; }
  tfoot tr.total td { font-weight: 700; font-size: 16px; padding-top: 12px; }
  footer { margin-top: 24px; border-top: 1px solid #e7e5e4; padding-top: 12px; font-size: 11px; color: #78716c; }
  .cargando { padding: 60px 0; text-align: center; color: #78716c; font-size: 14px; }
  @media print { body { padding: 0; } }
`;

const SCRIPT_IMPRIMIR = `<script>window.addEventListener('load', function () { window.print(); });</script>`;

function datosEmisor(negocio: ConfigNegocio) {
  const filas = [
    negocio.cuit && `<dt>CUIT</dt><dd>${esc(negocio.cuit)}</dd>`,
    negocio.domicilio && `<dt>Domicilio</dt><dd>${esc(negocio.domicilio)}</dd>`,
    negocio.condicion_iva && `<dt>Condición IVA</dt><dd>${esc(negocio.condicion_iva)}</dd>`,
    negocio.ingresos_brutos && `<dt>Ingresos Brutos</dt><dd>${esc(negocio.ingresos_brutos)}</dd>`,
    negocio.inicio_actividades &&
      `<dt>Inicio de actividades</dt><dd>${esc(negocio.inicio_actividades)}</dd>`,
    negocio.contacto && `<dt>Contacto</dt><dd>${esc(negocio.contacto)}</dd>`,
  ].filter(Boolean);
  return filas.length ? `<dl style="margin-top:8px">${filas.join('')}</dl>` : '';
}

function comprobanteHtml(venta: Venta, negocio: ConfigNegocio) {
  const pie = venta.factura_externa
    ? `La factura fiscal de esta venta se emitió en AFIP con el N° ${esc(venta.factura_numero ?? '—')}. Este documento es una copia interna.`
    : 'Documento no válido como factura fiscal. Comprobante interno de venta.';

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Comprobante ${esc(numeroComprobante(venta))}</title>
<style>${ESTILOS}</style>
</head>
<body>
  <div class="hoja">
    <header>
      <div>
        <h1>${esc(negocio.nombre || 'Comprobante')}</h1>
        ${negocio.detalle ? `<p class="muted chico" style="margin:4px 0 0">${esc(negocio.detalle)}</p>` : ''}
        ${datosEmisor(negocio)}
      </div>
      <div class="doc">
        <p class="muted chico" style="margin:8px 0 0">Comprobante de venta</p>
        <p class="numero" style="margin:2px 0 0">N° ${esc(numeroComprobante(venta))}</p>
        <p class="muted chico" style="margin:2px 0 0">${formatFecha(venta.factura_fecha ?? venta.created_at)}</p>
      </div>
    </header>

    <h2>Cliente</h2>
    <dl>
      <dt>Nombre</dt><dd>${esc(venta.factura_cliente || 'Consumidor final')}</dd>
      ${venta.factura_doc ? `<dt>CUIT / DNI</dt><dd>${esc(venta.factura_doc)}</dd>` : ''}
    </dl>

    <h2>Detalle</h2>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th class="num">Cantidad</th>
          <th class="num">Precio unitario</th>
          <th class="num">Importe</th>
        </tr>
      </thead>
      <tbody>${filaDetalle(venta)}</tbody>
      <tfoot>
        <tr class="total">
          <td colspan="3" class="num">Total</td>
          <td class="num">${formatPrecio(venta.total)}</td>
        </tr>
      </tfoot>
    </table>

    <h2>Datos de la venta</h2>
    <dl>
      <dt>Fecha de la venta</dt><dd>${formatFecha(venta.created_at)}</dd>
      ${venta.vendido_por ? `<dt>Vendido por</dt><dd>${esc(venta.vendido_por)}</dd>` : ''}
    </dl>

    <footer>${pie}</footer>
  </div>
  ${SCRIPT_IMPRIMIR}
</body>
</html>`;
}

/**
 * Abre la ventana del comprobante. Hay que llamarla dentro del click, antes de
 * cualquier await: si no, el navegador la bloquea por popup.
 */
export function abrirVentanaComprobante(): Window | null {
  const ventana = window.open('', '_blank', 'width=820,height=920');
  if (!ventana) return null;
  ventana.document.write(
    `<!doctype html><html lang="es"><head><meta charset="utf-8" /><title>Comprobante</title>` +
      `<style>${ESTILOS}</style></head><body><p class="cargando">Generando el comprobante...</p></body></html>`
  );
  ventana.document.close();
  return ventana;
}

/** Escribe el comprobante en una ventana ya abierta y dispara la impresión. */
export function escribirComprobante(ventana: Window, venta: Venta, negocio: ConfigNegocio) {
  ventana.document.open();
  ventana.document.write(comprobanteHtml(venta, negocio));
  ventana.document.close();
}

/**
 * Abre el comprobante en una ventana nueva y lo manda a imprimir (desde ahí se
 * puede guardar en PDF). Devuelve false si el navegador bloqueó el popup.
 */
export function imprimirComprobante(venta: Venta, negocio: ConfigNegocio): boolean {
  const ventana = abrirVentanaComprobante();
  if (!ventana) return false;
  escribirComprobante(ventana, venta, negocio);
  return true;
}

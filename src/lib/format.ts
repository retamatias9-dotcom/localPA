export const formatPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precio);

// Cantidades (stock, kilos, bolsas): admiten decimales, pero sin ceros de relleno.
export const formatCantidad = (cantidad: number) =>
  new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(cantidad);

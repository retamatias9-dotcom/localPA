// Demora agregada a cada carga de datos, mientras se muestran las animaciones
// de carga. Poner en 0 para desactivarla.
export const DEMORA_CARGA_MS = 5_000;

export function demoraCarga() {
  return new Promise<void>((resolve) => setTimeout(resolve, DEMORA_CARGA_MS));
}

export const PLACA_PATTERN = "\\s*[A-Za-z]{3}[\\s\\-]?(\\d{3}|\\d{2}[A-Za-z])\\s*";

export function normalizarPlaca(valor: string) {
  return valor.replace(/[\s-]/g, "").toUpperCase();
}

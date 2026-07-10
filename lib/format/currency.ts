const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/**
 * Formats an amount as Colombian pesos (COP), e.g. `$1.500.000`.
 */
export function formatCOP(amount: number): string {
  return COP_FORMATTER.format(amount);
}

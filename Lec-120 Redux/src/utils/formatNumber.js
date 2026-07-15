const formatter = new Intl.NumberFormat()

/**
 * Locale-aware number formatting (thousands separators, etc.) instead of
 * interpolating the raw number straight into JSX. incrementByAmount can
 * push the counter well past a single digit, so this keeps large values
 * readable and respects the viewer's locale.
 */
export function formatNumber(value) {
  return formatter.format(value)
}

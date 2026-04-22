/**
 * Conditional className joiner. Falsy values drop out so we can do:
 *   cn('a', active && 'b', extra)
 * without adding a dependency.
 */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}

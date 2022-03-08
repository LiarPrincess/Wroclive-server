/**
 * Returns difference in milliseconds.
 */
export function subtractMilliseconds(lhs: Date, rhs: Date): number {
  const lhsMilliseconds = lhs.getTime();
  const rhsMilliseconds = rhs.getTime();
  return lhsMilliseconds - rhsMilliseconds;
}

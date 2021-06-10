/** Helper function to make sure a switch is exhaustive */
export function assertNever(x: never) {
  throw Error(`Object should be never: ${x}`);
}

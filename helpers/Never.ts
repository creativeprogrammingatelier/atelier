/** Helper function to make sure a switch is exhaustive */
export function assertNever(x: never) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw Error(`Object should be never: ${x}`);
}

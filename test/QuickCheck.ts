/** Simple helpers for property-based testing. */

/** Default amount of times to run a test */
export const TEST_COUNT = 200;

/** Generate a random array of maximum length */
export function randomNumberArray(max: number) {
  const count = Math.floor(Math.random() * max);
  const array = [];
  for (let i = 0; i < count; i++) {
    array[i] = Math.floor(Math.random() * max);
  }
  return array;
}

/** Generate a random boolean */
export function randomBool() {
  return Math.random() > 0.5;
}

/** Mocha's it, but repeated TEST_COUNT times */
export function repeatIt(title: string, fn: () => void, count = TEST_COUNT) {
  return it(title, () => {
    for (let i = 0; i < count; i++) {
      fn();
    }
  });
}

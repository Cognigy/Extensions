/**
 * Promise based setTimeout
 *
 * @param {number} ms - The number of milliseconds to sleep.
 */
export function sleep (ms: number): Promise <void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
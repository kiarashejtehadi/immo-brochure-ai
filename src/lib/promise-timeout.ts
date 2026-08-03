export class TimeoutError extends Error {
  constructor(message = "Timeout") {
    super(message);
    this.name = "TimeoutError";
  }
}

/** Reject when `promise` does not settle within `ms` milliseconds. */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message = "Timeout",
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(message)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err: unknown) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/** Resolve `null` when the deadline is exceeded (never rejects on timeout). */
export function withDeadline<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ms);
    }),
  ]);
}

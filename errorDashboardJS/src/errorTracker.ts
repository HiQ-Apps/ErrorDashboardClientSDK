/**
 * Class representing an error tracker.
 * The errorTracker is a map where each key is an error message and value is an array of timestamps
 * when the error occurred. This then allows us to check if error is duplicate and to clean old timestamps
 * EG:
 * {
 *   "Error message": [1720964158, 1720964168, 1720964178, 1720964188],
 *   "Error message 2": [1720964158, 1720964168, 1720964178, 1720964188],
 *   "Error message 3": [1720964158, 1720964168, 1720964178, 1720964188]
 * }
 */
export class ErrorTracker {
  public errorTracker: Map<string, number[]>;
  public maxAge: number;

  /**
   * Initialize the errorTracker.
   * @param {number} maxAge - How long should the error be stored in memory (in milliseconds).
   */
  constructor(maxAge: number) {
    this.errorTracker = new Map();
    this.maxAge = maxAge;
  }

  /**
   * Check if an error is a duplicate in the errorTracker map.
   * @param {string} message - Error message title.
   * @param {number} timestamp - Timestamp of the error.
   * @returns {boolean} - Returns true if the error is a duplicate, false otherwise.
   */
  duplicateCheck(message: string, timestamp: number): boolean {
    if (this.errorTracker.has(message)) {
      const timestamps = this.errorTracker.get(message);
      if (timestamps?.length) {
        const lastTimestamp = timestamps[timestamps.length - 1];
        if (timestamp - lastTimestamp <= this.maxAge) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Add a timestamp to the errorTracker map.
   * @param {string} message - Error message title.
   * @param {number} timestamp - Timestamp of the error since UNIX epoch.
   * @returns {void}
   */
  addTimestamp(message: string, timestamp: number): void {
    if (!this.errorTracker.has(message)) {
      this.errorTracker.set(message, []);
    }
    this.errorTracker.get(message)?.push(timestamp);
  }

  /**
   * Clean old timestamps from the errorTracker map.
   * @param {number} currentTimestamp - Current date timestamp since UNIX epoch.
   * @returns {void}
   */
  cleanOldTimestamps(currentTimestamp: number): void {
    for (const [errorMsg, timestamps] of this.errorTracker) {
      this.errorTracker.set(
        errorMsg,
        timestamps.filter((ts) => currentTimestamp - ts <= this.maxAge)
      );
      if (this.errorTracker.get(errorMsg)?.length === 0) {
        this.errorTracker.delete(errorMsg);
      }
    }
  }
}

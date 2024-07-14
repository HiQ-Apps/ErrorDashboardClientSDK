// Tracker Dict EG: { "Error message": [1720964158,1720964168,1720964178,1720964188],
// "Error message 2": [1720964158,1720964168,1720964178,1720964188] },
// "Error message 3": [1720964158,1720964168,1720964178,1720964188] }
// }

export class ErrorTracker {
  public errorTracker: Map<string, number[]>;
  public maxAge: number;

  // Initialize the errorTracker
  // @maxAge: How long should the error be stored in memory (in milliseconds)
  constructor(maxAge: number) {
    this.errorTracker = new Map();
    this.maxAge = maxAge;
  }

  // Check if error is duplicate in errorTracker map
  // @message: Error message title
  // @timestamp: Timestamp of the error
  // @returns: boolean
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

  // Add timestamp to errorTracker map
  // @message: Error message title
  // @timestamp: Timestamp of the error since UNIX epoch
  addTimestamp(message: string, timestamp: number): void {
    if (!this.errorTracker.has(message)) {
      this.errorTracker.set(message, []);
    }
    this.errorTracker.get(message)?.push(timestamp);
  }

  // Clean old timestamps from errorTracker map
  // @currentTimestamp: Current date timestamp since UNIX epoch
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

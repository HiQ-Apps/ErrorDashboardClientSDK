import { errorDashboardFetch } from "./fetch";
import { configs, type Configs } from "./configs";
import { baseUrl } from "./environment";
import type { CreateErrorRequestType, Tag, ErrorResponseType } from "./types";
import { ErrorTracker } from "./errorTracker";

interface InitializeClient {
  clientId: string;
  clientSecret: string;
}

/**
 * Class representing a client for the error dashboard.
 */
export class ErrorDashboardClient {
  private clientId: string;
  private clientSecret: string;
  private configs: Configs;
  private errorTracker: ErrorTracker;

  /**
   * Initialize the client.
   * @param {InitializeClient} obj - Object containing clientId and clientSecret.
   */
  constructor(obj: InitializeClient) {
    this.clientId = obj.clientId;
    this.clientSecret = obj.clientSecret;
    this.configs = configs;
    this.errorTracker = new ErrorTracker(this.configs.maxAge);
    this.setupPeriodicCleanup();
  }

  /**
   * Set up periodic cleanup using config's maxAge.
   * @returns {void}
   */
  private setupPeriodicCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      this.errorTracker.cleanOldTimestamps(now);
    }, this.errorTracker.maxAge);
  }

  /**
   * Send error to the dashboard server.
   * @param {Error} error - Error object to be sent.
   * @param {string} message - Error message used to identify the error.
   * @param {Tag[]} [tags] - Additional tags to be sent with the error.
   * @returns {Promise<ErrorResponseType>} - Returns an object indicating if there was an error or success.
   */
  async sendError(
    error: Error,
    message: string,
    tags?: Tag[]
  ): Promise<ErrorResponseType> {
    const currentTime = Date.now();

    if (this.errorTracker.duplicateCheck(message, currentTime)) {
      this.configs.verbose &&
        console.log("Duplicate error detected, not sending");
      return { isError: true, isSuccess: false };
    }

    let errorStack: string | undefined;
    errorStack = error.stack;

    let userAffected = this.configs.user;
    let userAgent = navigator.userAgent;

    const buildError: CreateErrorRequestType = {
      userAffected: userAffected,
      stackTrace: errorStack,
      userAgent: userAgent,
      message: message,
      tags: tags,
    };

    const { isError, isSuccess } = await errorDashboardFetch({
      clientSecret: this.clientSecret,
      clientId: this.clientId,
      method: "POST",
      endpoint: `${baseUrl}/errors`,
      body: buildError,
    });

    if (isSuccess) {
      this.configs.verbose && console.log("Data sent to Higuard");
      this.errorTracker.addTimestamp(message, currentTime);
    }

    if (isError && this.configs.verbose) {
      console.log("Error sending data to Higuard");
    }

    return { isError, isSuccess };
  }

  /**
   * Override default configurations.
   * @param {Partial<Configs>} newConfigs - Partial configurations to be overridden.
   * @returns {void}
   */
  overrideConfigs(newConfigs: Partial<Configs>): void {
    this.configs = { ...this.configs, ...newConfigs };
  }
}

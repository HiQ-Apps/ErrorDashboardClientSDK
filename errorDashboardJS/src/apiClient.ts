import { parseUserAgent } from "./utils";
import { errorDashboardFetch } from "./fetch";
import { Configuration, type Configs } from "./configs";
import { baseUrl } from "./environment";
import type {
  Tag,
  ErrorResponseType,
  CreateErrorRequestSchema,
  UserAgentType,
  IdType,
} from "./types";
import { ErrorTracker } from "./errorTracker";

interface InitializeClient {
  clientId: string;
  clientSecret: string;
}

export class ErrorDashboardClient {
  private static instance: ErrorDashboardClient;
  private clientId: string;
  private clientSecret: string;
  private configs: Configuration;
  private errorTracker: ErrorTracker;

  /**
   * Initialize the client.
   * @param {InitializeClient} obj - Object containing clientId and clientSecret.
   */
  private constructor(obj: InitializeClient) {
    this.clientId = obj.clientId;
    this.clientSecret = obj.clientSecret;
    this.configs = new Configuration();
    this.errorTracker = new ErrorTracker(this.configs.getConfig("maxAge"));
    this.setupPeriodicCleanup();
  }

  /**
   * Get the instance of ErrorDashboardClient.
   * @param {InitializeClient} obj - Object containing clientId and clientSecret.
   * @returns {ErrorDashboardClient} - The singleton instance.
   */
  static initialize(obj: InitializeClient): ErrorDashboardClient {
    if (!ErrorDashboardClient.instance) {
      ErrorDashboardClient.instance = new ErrorDashboardClient(obj);
    }
    return ErrorDashboardClient.instance;
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
   * @param {string} attachUser - Add a user id to the error.
   * @param {boolean} attachUserAgent - Defaulted to false. Add user agent information to the error.
   * @returns {Promise<ErrorResponseType>} - Returns an object indicating if there was an error or success.
   */
  async sendError(
    error: Error,
    message: string,
    tags: Tag[] = [],
    attachUser?: IdType
  ): Promise<void> {
    const currentTime = Date.now();

    if (this.errorTracker.duplicateCheck(message, currentTime)) {
      this.configs.getConfig("verbose") &&
        console.log("Duplicate error detected, not sending");
      return;
    }

    let errorStack: string | undefined = error.stack;
    let userAffected: IdType | undefined = attachUser;
    let retryAttempts: number = this.configs.getConfig("retryAttempts");
    let retryDelay: number = this.configs.getConfig("retryDelay");

    const errorRequestBody: CreateErrorRequestSchema = {
      userAffected: userAffected,
      stackTrace: errorStack,
      message: message,
      tags: tags,
    };

    const { isError, isSuccess } = await errorDashboardFetch({
      clientSecret: this.clientSecret,
      clientId: this.clientId,
      method: "POST",
      endpoint: `${baseUrl}/errors`,
      body: errorRequestBody,
      retryAttempts,
      retryDelay,
    });

    if (isSuccess && this.configs.getConfig("verbose")) {
      console.log("Data sent to Higuard");
      this.errorTracker.addTimestamp(message, currentTime);
    } else if (isError) {
      this.configs.getConfig("verbose") &&
        console.log("Error sending data to Higuard");
    }
  }

  /**
   * Override default configurations.
   * @param {Partial<Configs>} newConfigs - Partial configurations to be overridden.
   * @returns {void}
   */
  overrideConfigs(newConfigs: Partial<Configs>): void {
    Object.entries(newConfigs).forEach(([key, value]) => {
      this.configs.setConfig(key as keyof Configs, value as any);
    });
  }

  /**
   * Static method to send error using the created instance.
   * @param {Error} error - Error object to be sent.
   * @param {string} message - Error message used to identify the error.
   * @param {Tag[]} [tags] - Additional tags to be sent with the error.
   * @param {IdType} [attachUser] - Add a user id to the error.
   * @returns {Promise<ErrorResponseType>} - Returns an object indicating if there was an error or success.
   */
  static async sendError(
    error: Error,
    message: string,
    tags: Tag[] = [],
    attachUser?: IdType
  ): Promise<void> {
    if (!ErrorDashboardClient.instance) {
      throw new Error(
        "ErrorDashboardClient not initialized. Call initialize() first."
      );
    }
    return;
  }

  /**
   * Static method to override configurations using the instance.
   * @param {Partial<Configs>} newConfigs - Partial configurations to be overridden.
   * @returns {void}
   */
  static overrideConfigs(newConfigs: Partial<Configs>): void {
    if (!ErrorDashboardClient.instance) {
      throw new Error(
        "ErrorDashboardClient not initialized. Call initialize() first."
      );
    }
    ErrorDashboardClient.instance.overrideConfigs(newConfigs);
  }
}

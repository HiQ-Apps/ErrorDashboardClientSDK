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
    attachUser?: IdType,
    attachUserAgent: boolean = false
  ): Promise<ErrorResponseType> {
    const currentTime = Date.now();

    if (this.errorTracker.duplicateCheck(message, currentTime)) {
      this.configs.getConfig("verbose") &&
        console.log("Duplicate error detected, not sending");
      this.errorTracker.addTimestamp(message, currentTime);
      return { isError: true, isSuccess: false };
    }

    let errorStack: string | undefined = error.stack;
    let userAffected: IdType | undefined = attachUser;

    if (
      this.configs.getConfig("environment") == "web" &&
      this.configs.getConfig("includeOpinionatedTags")
    ) {
      let userAgent: string | undefined = navigator.userAgent;
      if (attachUserAgent && userAgent) {
        const parsedUserAgent: UserAgentType = parseUserAgent(userAgent);
        for (const [key, value] of Object.entries(parsedUserAgent)) {
          tags.push({ tagKey: key, tagValue: value });
        }
      }
    }

    const buildError: CreateErrorRequestSchema = {
      user_affected: userAffected,
      stack_trace: errorStack,
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

    if (isSuccess && this.configs.getConfig("verbose")) {
      console.log("Data sent to Higuard");
    } else if (isError && this.configs.getConfig("verbose")) {
      console.log("Error sending data to Higuard");
    }

    this.errorTracker.addTimestamp(message, currentTime);

    return { isError, isSuccess };
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
   * @param {boolean} [attachUserAgent] - Defaulted to false. Add user agent information to the error.
   * @returns {Promise<ErrorResponseType>} - Returns an object indicating if there was an error or success.
   */
  static async sendError(
    error: Error,
    message: string,
    tags: Tag[] = [],
    attachUser?: IdType,
    attachUserAgent: boolean = false
  ): Promise<ErrorResponseType> {
    if (!ErrorDashboardClient.instance) {
      throw new Error(
        "ErrorDashboardClient not initialized. Call initialize() first."
      );
    }
    return ErrorDashboardClient.instance.sendError(
      error,
      message,
      tags,
      attachUser,
      attachUserAgent
    );
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

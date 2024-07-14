import { errorDashboardFetch } from "./fetch";
import { configs, type Configs } from "./configs";
import { baseUrl } from "./environment";
import type { CreateErrorRequestType, Tag, ErrorResponseType } from "./types";
import { ErrorTracker } from "./errorTracker";

interface InitializeClient {
  clientId: string;
  clientSecret: string;
}

export class ErrorDashboardClient {
  private clientId: string;
  private clientSecret: string;
  private configs: Configs;
  private errorTracker: ErrorTracker;

  // Initialize the client
  // @obj: Object containing clientId and clientSecret
  // @returns: void
  constructor(obj: InitializeClient) {
    this.clientId = obj.clientId;
    this.clientSecret = obj.clientSecret;
    this.configs = configs;
    this.errorTracker = new ErrorTracker(this.configs.maxAge);
    this.setupPeriodicCleanup();
  }

  // Intervaled cleanup of old errors
  // @returns: void
  private setupPeriodicCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      this.errorTracker.cleanOldTimestamps(now);
    }, this.errorTracker.maxAge);
  }

  // Send error to the dashboard
  // @error: Error type object
  // @message: Error message used to identify error
  // @tags: Additional tags to be sent with the error
  // @returns: { isError: boolean, isSuccess: boolean } if dev wants to handle the response
  async sendError(
    error: Error,
    message: string,
    tags?: Tag[]
  ): Promise<ErrorResponseType> {
    const currentTime = Date.now();

    if (this.errorTracker.duplicateCheck(message, currentTime)) {
      configs.verbose && console.log("Duplicate error detected, not sending");
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
      this.errorTracker.addTimestamp(message, currentTime);
    }

    if (isError && configs.verbose) {
      console.log("Error sending data to Higuard");
    }

    if (isSuccess && configs.verbose) {
      console.log("Data sent to Higuard");
    }

    return { isError, isSuccess };
  }

  // Override default configurations
  // @newConfigs: Partial configurations to be overridden
  // @returns: void
  overrideConfigs(newConfigs: Partial<Configs>) {
    this.configs = { ...this.configs, ...newConfigs };
  }
}

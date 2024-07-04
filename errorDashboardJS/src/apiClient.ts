import { errorDashboardFetch } from "./fetch";
import { configs, type Configs } from "./configs";
import { baseUrl } from "./environment";
import type { CreateErrorRequestType, Tag } from "./types";

interface InitializeClient {
  clientId: string;
  clientSecret: string;
  window: Window;
}

export class ErrorDashboardClient {
  private clientId: string;
  private clientSecret: string;
  private window: Window;
  private configs: Configs;

  constructor(obj: InitializeClient) {
    this.clientId = obj.clientId;
    this.clientSecret = obj.clientSecret;
    this.window = obj.window;
    this.configs = configs;
  }

  async sendError(error: Error, message: string, tags?: Tag[]) {
    let errorStack: string | undefined;
    let errorLineNum: number | undefined;
    let errorPath: string | undefined;

    errorStack = error.stack || "Error stack not found";
    const stackLines = errorStack.split("\n");
    if (stackLines.length > 1) {
      // Match on first at... EG: at {filename}:{line}:{column #}
      const match = stackLines[1].match(/at\s+(.*):(\d+):(\d+)/);
      if (match) {
        errorPath = match[1];
        errorLineNum = parseInt(match[2], 10);
      } else {
        errorPath = "Error path not found";
        errorLineNum = 0;
      }
    } else {
      errorPath = "Error path not found";
      errorLineNum = 0;
    }

    let user_affected: string | undefined;

    if (this.window.document.cookie) {
      // EG: access_token=1234; path=/; expires=Wed, 09 Jun 2021 10:18:14 GMT; HttpOnly; SameSite=Lax
      if (this.window.document.cookie.includes(configs.authContext)) {
        user_affected = this.window.document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${configs.authContext}=`))
          ?.split("=")[1];
      }
    } else {
      user_affected = undefined;
    }

    const buildError: CreateErrorRequestType = {
      user_affected: user_affected,
      stack_trace: errorStack,
      path: errorPath,
      line: errorLineNum as number,
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

    return { isError, isSuccess };
  }

  overrideConfigs(newConfigs: Partial<Configs>) {
    this.configs = { ...this.configs, ...newConfigs };
  }
}

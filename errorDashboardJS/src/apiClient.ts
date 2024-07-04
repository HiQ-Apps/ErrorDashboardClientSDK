import { customFetch } from "./fetch";
import { configs, type Configs } from "./configs";
import { baseUrl } from "./environment";
import type { CreateErrorRequestType, CreateTagRequestType } from "./types";

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

  async sendError(
    error: Error,
    message: string,
    statusCode?: number,
    tags?: CreateTagRequestType[]
  ) {
    let errorStack: string | undefined;
    let errorLineNum: number | undefined;
    let errorPath: string | undefined;
    let errorUserAgent: string;

    try {
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
      errorUserAgent = this.window.navigator.userAgent;
    } catch (err) {
      errorStack = "Error stack not found";
      errorPath = "Error path not found";
      errorLineNum = 0;
      errorUserAgent = "Error user agent not found";
    }

    for (const tag of tags || []) {
      tag.tag_color = this.configs.tagColor;
    }

    const initializeTags: CreateTagRequestType[] = [];

    if (statusCode) {
      initializeTags.push({
        tag_key: "statusCode",
        tag_value: statusCode.toString(),
        tag_color: this.configs.tagColor,
      });
    }
    if (errorUserAgent) {
      initializeTags.push({
        tag_key: "userAgent",
        tag_value: errorUserAgent,
        tag_color: this.configs.tagColor,
      });
    }

    let user_affected: string | undefined;

    // Check if user
    try {
      if (this.window.document.cookie) {
        // EG: access_token=1234; path=/; expires=Wed, 09 Jun 2021 10:18:14 GMT; HttpOnly; SameSite=Lax
        if (this.window.document.cookie.includes(configs.authContext)) {
          user_affected = this.window.document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${configs.authContext}=`))
            ?.split("=")[1];
        }
      }
    } catch (err) {
      user_affected = undefined;
    }

    const buildError: CreateErrorRequestType = {
      user_affected: user_affected,
      stack_trace: errorStack,
      path: errorPath,
      line: errorLineNum as number,
      message: message,
      tags: [...initializeTags, ...(tags || [])],
    };

    const response = await customFetch({
      clientSecret: this.clientSecret,
      clientId: this.clientId,
      method: "POST",
      endpoint: `${baseUrl}/errors`,
      body: buildError,
    });

    const isError = response.error ? true : false;
    const isSuccess = response.success ? true : false;

    return { isError, isSuccess };
  }

  overrideConfigs(newConfigs: Partial<Configs>) {
    this.configs = { ...this.configs, ...newConfigs };
  }
}

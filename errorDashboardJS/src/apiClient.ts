import { errorDashboardFetch } from "./fetch";
import { configs, type Configs } from "./configs";
import { baseUrl } from "./environment";
import type { CreateErrorRequestType, Tag } from "./types";

interface InitializeClient {
  clientId: string;
  clientSecret: string;
}

export class ErrorDashboardClient {
  private clientId: string;
  private clientSecret: string;
  private configs: Configs;

  constructor(obj: InitializeClient) {
    this.clientId = obj.clientId;
    this.clientSecret = obj.clientSecret;
    this.configs = configs;
  }

  async sendError(error: Error, message: string, tags?: Tag[]) {
    let errorStack: string | undefined;

    errorStack = error.stack || "Error stack not found";

    let user_affected: string | undefined;

    if (window.document.cookie) {
      // EG: access_token=1234; path=/; expires=Wed, 09 Jun 2021 10:18:14 GMT; HttpOnly; SameSite=Lax
      if (window.document.cookie.includes(configs.authContext)) {
        user_affected = window.document.cookie
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

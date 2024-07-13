import { errorDashboardFetch } from "./fetch";
import { dateIsWithinHour } from "./utils";
import { configs, type Configs } from "./configs";
import { baseUrl } from "./environment";
import type { CreateErrorRequestType, Tag, Primitive } from "./types";

type deduplicateKey = Set<string | Date>
type deduplicateHashMap = Map<deduplicateKey, number>

interface InitializeClient {
  clientId: string;
  clientSecret: string;
}

export class ErrorDashboardClient {
  private clientId: string;
  private clientSecret: string;
  private configs: Configs;
  private deduplicateHashMap: deduplicateHashMap;

  // Get API clientId and clientSecret from HiGuard's namespace services
  // Deduplicate Hashmap

  constructor(obj: InitializeClient) {
    this.clientId = obj.clientId;
    this.clientSecret = obj.clientSecret;
    this.configs = configs;
    // this.deduplicateHashMap = {}
  }

  duplicateCheck(error: Error, message: string, tags?: Tag[]){
    if (message in this.deduplicateHashMap){
      const foundError = this.deduplicateHashMap[message]
      const now = new Date()

      if (foundError.lastSeen) {
        // if (!dateIsWithinHour(foundError.lastSeen))
          // this.deduplicateHashMap[(message, now)][count] += 1
      }
    }
  }


  // Send Error method for sending Error type data to Higuard
  // @error: Error type
  // @message: This will be the name displayed on the dashboard. Could be the Error name, custom name ETC.
  // @tags: Key and value for tag identifiers
  async sendError(error: Error, message: string, tags?: Tag[]) {
    let errorStack: string | undefined;
    
    errorStack = error.stack || "Error stack not found";

    let userAffected = this.configs.user

    const buildError: CreateErrorRequestType = {
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
      body: buildError,
    });

    if (isError && configs.verbose) {
      console.log('Error sending data to Higuard')
    }

    if (isSuccess && configs.verbose) {
      console.log('Data sent to Higuard')
    }

    return { isError, isSuccess };
  }

  // Should be used to override sdk configurations
  overrideConfigs(newConfigs: Partial<Configs>) {
    this.configs = { ...this.configs, ...newConfigs };
  }

}

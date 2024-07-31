export interface Configs {
  verbose: boolean;
  samplingRate: number;
  maxAge: number;
  environment: "web" | "node";
  includeOpinionatedTags: boolean;
}

export let defaultConfigs: Configs = {
  verbose: false,
  samplingRate: 2,
  maxAge: 20000,
  environment: "node",
  includeOpinionatedTags: false,
};

/**
 * Configuration class to handle configurations
  @param {Partial<Configs>} [configs] - Optional configurations to be set.
    @param {boolean} [configs.verbose] - Defaulted to false. Adds console.logs and console.errors
    @param {number} [configs.samplingRate] - How many of duplicate requests should be allowed per minute
    @param {number} [configs.maxAge] - How long should the error be stored in memory (in milliseconds)
    @param {"web" | "node"} [configs.environment] - Defaulted to "node". Can be "web" or "node". Used to differentiate between web and node environments.
    @param {boolean} [configs.includeOpinionatedTags] - Defaulted to false. Adds opinionated tags to the error (User-Agent, Stack Trace details)
  @returns {Configuration} - Returns a Configuration object.
*/
export class Configuration {
  private configs: Configs;

  constructor(configs?: Partial<Configs>) {
    this.configs = { ...defaultConfigs, ...configs };
  }

  public getConfig<T extends keyof Configs>(key: T): Configs[T] {
    return this.configs[key];
  }

  public setConfig<T extends keyof Configs>(key: T, value: Configs[T]): void {
    if (key === "samplingRate" && typeof value === "number" && value <= 0) {
      throw new Error("samplingRate must be a positive number");
    }
    if (key === "maxAge" && typeof value === "number" && value <= 0) {
      throw new Error("maxAge must be a positive number");
    }
    this.configs[key] = value;
  }
}

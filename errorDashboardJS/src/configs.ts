export interface Configs {
  verbose: boolean;
  samplingRate: number;
  maxAge: number;
}

// Configurations
// @verbose: Defaulted to false. Adds console.logs and console.errors
// @samplingRate: How many of duplicate requests should be allowed per minute
// @maxAge: How long should the error be stored in memory (in milliseconds)
export let configs: Configs = {
  verbose: false,
  samplingRate: 2,
  maxAge: 20000,
};

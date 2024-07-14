export interface Configs {
  user?: string;
  verbose: boolean;
  samplingRate: number;
  maxAge: number;
}

// Configurations
// @authContext: Should be used to access the current user affected by the error
// @verbose: Defaulted to false. Adds console.logs and console.errors
// @samplingRate: How many of duplicate requests should be allowed per minute
// @maxAge: How long should the error be stored in memory (in milliseconds)
// @refreshErrorTrackerRate: How often should the error tracker be refreshed (in milliseconds)
export const configs: Configs = {
  user: undefined,
  verbose: false,
  samplingRate: 2,
  maxAge: 20000,
};

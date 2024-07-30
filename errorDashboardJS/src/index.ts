import { ErrorDashboardClient } from "./apiClient";

export { ErrorDashboardClient, ErrorDashboardClient as default };
export const sendError = ErrorDashboardClient.sendError;
export const overrideConfigs = ErrorDashboardClient.overrideConfigs;

import * as useragent from "useragent";
import { DateTime } from "Luxon";
import type { UserAgentType } from "./types";

export const dateIsWithinHour = (dateCheck: DateTime<true>): boolean => {
  let currentDateTime = DateTime.now();
  let lastHour = currentDateTime.minus({ minutes: 1 });

  if (dateCheck >= lastHour && dateCheck <= currentDateTime) {
    return true;
  } else {
    return false;
  }
};

export const parseUserAgent = (ua: string): UserAgentType => {
  const agent = useragent.parse(ua);
  const os = agent.os;
  const device = agent.device;

  return {
    browserName: agent.family,
    browserVersion: agent.toVersion(),
    operatingSystem: os.family,
    osVersion: os.toVersion(),
    device: device.family !== "Other" ? device.family : undefined,
  };
};

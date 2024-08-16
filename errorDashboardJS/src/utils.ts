import { UAParser } from "ua-parser-js";
import { DateTime } from "luxon";
import type { UserAgentType } from "./types";

export const dateIsWithinHour = (dateCheck: DateTime<true>): boolean => {
  let currentDateTime = DateTime.now();
  let lastHour = currentDateTime.minus({ minutes: 60 });

  if (dateCheck >= lastHour && dateCheck <= currentDateTime) {
    return true;
  } else {
    return false;
  }
};

export const parseUserAgent = (ua: string): UserAgentType => {
  const agent = new UAParser(ua);
  const os = agent.getOS();
  const device = agent.getDevice();

  return {
    browserName: agent.getBrowser().name,
    browserVersion: agent.getBrowser().version,
    operatingSystem: os.name,
    osVersion: os.version,
    device: device.type,
  };
};

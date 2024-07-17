export type Primitive = number | string | boolean | undefined | null;
export type IdType = string | number;
export type Tag = { tagKey: string; tagValue: Primitive };

export type ErrorResponseType = {
  isSuccess?: boolean;
  isError?: boolean;
};

export type CreateErrorRequestSchema = {
  user_affected?: IdType;
  message: string;
  stack_trace?: string;
  tags?: Tag[];
};

export type CreateErrorDto = {
  userAffected?: string;
  message: string;
  tags?: Tag[];
};

export type UserAgentType = {
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  osVersion: string;
  device?: string;
};

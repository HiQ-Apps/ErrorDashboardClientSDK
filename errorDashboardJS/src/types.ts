export type Primitive = number | string | boolean | undefined | null;
export type Tag = { tagKey: string; tagValue: Primitive };

export type ErrorResponseType = {
  isSuccess?: boolean;
  isError?: boolean;
};

export type CreateErrorRequestType = {
  userAffected?: string;
  message: string;
  stackTrace?: string;
  tags?: Tag[];
};

export type CreateErrorDto = {
  userAffected?: string;
  message: string;
  tags?: Tag[];
};

export type DeduplicateType = {};

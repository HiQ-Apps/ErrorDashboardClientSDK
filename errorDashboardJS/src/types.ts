export type Primitive = number | string | boolean | undefined | null;
export type Tag = { tagKey: string; tagValue: Primitive };

export type CreateErrorRequestType = {
  user_affected?: string;
  message: string;
  stack_trace?: string;
  tags?: Tag[];
};

export type CreateErrorDto = {
  user_affected?: string;
  message: string;
  tags?: Tag[];
};

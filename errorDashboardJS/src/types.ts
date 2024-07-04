export type CreateErrorRequestType = {
  user_affected?: string;
  path?: string;
  line: number;
  message: string;
  stack_trace?: string;
  tags?: CreateTagRequestType[];
};

export type CreateErrorDto = {
  user_affected?: string;
  message: string;
  tags?: CreateTagRequestType[];
};

export type CreateTagRequestType = {
  tag_key: string;
  tag_value: string;
  tag_color?: string;
};

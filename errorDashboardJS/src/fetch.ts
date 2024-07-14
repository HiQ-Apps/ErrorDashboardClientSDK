import { CreateErrorRequestType, ErrorResponseType } from "./types";

interface CustomFetchProps {
  clientSecret: string;
  clientId: string;
  method: string;
  headers?: HeadersInit;
  endpoint: string;
  body?: CreateErrorRequestType;
}

export const errorDashboardFetch = async ({
  clientSecret,
  clientId,
  method,
  headers = {},
  endpoint,
  body,
}: CustomFetchProps): Promise<ErrorResponseType> => {
  let isError = false;
  let isSuccess = false;
  const url = new URL(endpoint);

  url.searchParams.append("client_id", clientId);

  const combinedHeaders = {
    Authorization: `${clientSecret}`,
    "Content-Type": "application/json",
    ...headers,
  };

  const options: RequestInit = {
    method: method,
    headers: combinedHeaders,
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(url, options);
  if (!response.ok) {
    isError = true;
  } else {
    isSuccess = true;
  }
  isError = false;

  return { isSuccess, isError };
};

import { CreateErrorRequestType } from "./types";

interface CustomFetchProps {
  clientSecret: string;
  clientId: string;
  method: string;
  headers?: HeadersInit;
  endpoint: string;
  body?: CreateErrorRequestType;
}

export const customFetch = async ({
  clientSecret,
  clientId,
  method,
  headers = {},
  endpoint,
  body,
}: CustomFetchProps) => {
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

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Higuard error failed to create`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Fetch error: ${error}`);
  }
};

import type { ErrorResponseType, CreateErrorRequestSchema } from "./types";

interface CustomFetchProps {
  clientSecret: string;
  clientId: string;
  method: string;
  headers?: HeadersInit;
  endpoint: string;
  body?: CreateErrorRequestSchema;
}

/**
 * Fetch function to send errors to the dashboard server.
 * @param {string} CustomFetchProps.clientSecret - Client secret for the dashboard server.
 * @param {string} CustomFetchProps.clientId - Client ID for the dashboard server.
 * @param {string} CustomFetchProps.method - HTTP method to be used.
 * @param {HeadersInit} [CustomFetchProps.headers] - Additional headers to be sent.
 * @param {string} CustomFetchProps.endpoint - Endpoint to send the data.
 * @param {CreateErrorRequestSchema} [CustomFetchProps.body] - Body of the request.
 * @returns {Promise<ErrorResponseType>} - Returns isError and isSuccess based on result of function.
 */
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

  const combinedHeaders: HeadersInit = {
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
    const response = await fetch(url.toString(), options);
    if (!response.ok) {
      isError = true;
    } else {
      isSuccess = true;
    }
  } catch (error) {
    isError = true;
  }

  return { isSuccess, isError };
};

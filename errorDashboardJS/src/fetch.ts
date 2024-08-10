import type { ErrorResponseType, CreateErrorRequestSchema } from "./types";

interface CustomFetchProps {
  clientSecret: string;
  clientId: string;
  method: string;
  headers?: HeadersInit;
  endpoint: string;
  body?: CreateErrorRequestSchema;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Fetch function to send errors to the dashboard server with retry mechanism.
 * @param {string} CustomFetchProps.clientSecret - Client secret for the dashboard server.
 * @param {string} CustomFetchProps.clientId - Client ID for the dashboard server.
 * @param {string} CustomFetchProps.method - HTTP method to be used.
 * @param {HeadersInit} [CustomFetchProps.headers] - Additional headers to be sent.
 * @param {string} CustomFetchProps.endpoint - Endpoint to send the data.
 * @param {CreateErrorRequestSchema} [CustomFetchProps.body] - Body of the request.
 * @param {number} [CustomFetchProps.retryAttempts] - Number of retry attempts.
 * @param {number} [CustomFetchProps.retryDelay] - Delay between retries in milliseconds.
 * @returns {Promise<ErrorResponseType>} - Returns isError and isSuccess based on result of function.
 */
export const errorDashboardFetch = async ({
  clientSecret,
  clientId,
  method,
  headers = {},
  endpoint,
  body,
  retryAttempts,
  retryDelay,
}: CustomFetchProps): Promise<ErrorResponseType> => {
  let isError = false;
  let isSuccess = false;
  const url = new URL(endpoint);

  headers = {
    ...headers,
    client_id: clientId,
  };

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

  for (let attempt = 0; attempt < retryAttempts; attempt++) {
    try {
      const response = await fetch(url.toString(), options);
      if (response.ok) {
        isSuccess = true;
        return { isSuccess, isError };
      } else {
        isError = true;
      }
    } catch (error) {
      console.error("Fetch error:", error);
      isError = true;
    }

    if (attempt < retryAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  return { isSuccess, isError };
};

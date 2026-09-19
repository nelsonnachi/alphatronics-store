import { ApiClientError } from "./api-client-error";

export async function apiClient<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const isFormData =
    options?.body instanceof FormData;

  let contentTypeHeader: Record<string, string>;

  if (!isFormData) {
    contentTypeHeader = {
      "Content-Type": "application/json",
    };
  } else {
    // Do not manually set Content-Type for FormData.
    // The browser adds the multipart boundary automatically.
    contentTypeHeader = {};
  }

  const headers = {
    ...contentTypeHeader,
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,

    // IMPORTANT:
    // Send the Clerk authentication cookies with
    // requests made from the browser.
    credentials: "include",
    
    headers,
  });

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new ApiClientError(
      data?.error ?? "Something went wrong.",
      response.status,
      data?.details,
    );
  }

  return data as T;
}
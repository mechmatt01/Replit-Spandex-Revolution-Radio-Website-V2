import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);

    // Check content type first
    const contentType = res.headers.get("content-type");

    // If it's not JSON, don't try to parse it
    if (!contentType || !contentType.includes("application/json")) {
      console.log("Non-JSON response detected, skipping parse");
      return null;
    }

    // Check if response has content before parsing JSON
    const text = await res.text();
    if (!text || text.trim() === "" || text === "undefined") {
      console.log("Empty or undefined response, returning null");
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error(
        "JSON parse error for query:",
        queryKey[0],
        "Error:",
        error,
        "Response text:",
        text,
      );
      return null; // Return null instead of throwing to prevent crashes
    }
  };

// Default query function for API calls
const defaultQueryFn = async ({ queryKey }: { queryKey: readonly unknown[] }) => {
  const url = queryKey[0] as string;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});


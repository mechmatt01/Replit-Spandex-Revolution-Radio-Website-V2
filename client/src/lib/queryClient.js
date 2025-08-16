import { QueryClient } from "@tanstack/react-query";
import { measureAsyncOperation } from './performance';
async function throwIfResNotOk(res) {
    if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
    }
}
export async function apiRequest(method, url, data) {
    return measureAsyncOperation(`api_request_${method.toLowerCase()}`, async () => {
        const res = await fetch(url, {
            method,
            headers: data ? { "Content-Type": "application/json" } : {},
            body: data ? JSON.stringify(data) : undefined,
            credentials: "include",
        });
        await throwIfResNotOk(res);
        return res;
    }, {
        method: method.length,
        url_length: url.length,
        has_data: data ? 1 : 0
    });
}
export const getQueryFn = ({ on401: unauthorizedBehavior }) => async ({ queryKey }) => {
    return measureAsyncOperation(`query_function_${queryKey[0]}`, async () => {
        const res = await fetch(queryKey[0], {
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
        }
        catch (error) {
            console.error("JSON parse error for query:", queryKey[0], "Error:", error, "Response text:", text);
            return null; // Return null instead of throwing to prevent crashes
        }
    }, {
        query_key_length: queryKey.length,
        unauthorized_behavior: unauthorizedBehavior === "returnNull" ? 1 : 0
    });
};
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: getQueryFn({ on401: "throw" }),
            refetchInterval: false,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
});

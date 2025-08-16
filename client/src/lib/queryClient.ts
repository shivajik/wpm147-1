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
  const token = localStorage.getItem("auth_token");
  const baseUrl = getBaseUrl();
  const fullUrl = url.startsWith('http') ? url : baseUrl + url;
  
  const res = await fetch(fullUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  // If we get a 401, redirect to login
  if (res.status === 401) {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  }

  await throwIfResNotOk(res);
  return res;
}

// New simplified API request for direct use
export async function apiCall(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("auth_token");
  const baseUrl = getBaseUrl();
  const fullUrl = url.startsWith('http') ? url : baseUrl + url;
  
  const response = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || response.statusText };
    }
    
    // If we get a 401, redirect to login
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    
    // Create error object with backend error structure
    const error = new Error(errorData.message || `HTTP ${response.status}`);
    (error as any).type = errorData.type;
    (error as any).errors = errorData.errors;
    throw error;
  }

  const text = await response.text();
  if (!text) return null;
  
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
// Get the base URL for API requests
function getBaseUrl(): string {
  // In development, use localhost
  if (import.meta.env.DEV) {
    return '';  // Relative URLs work in development with Vite proxy
  }
  
  // In production, use the current origin (same domain as the frontend)
  return '';  // Relative URLs work since frontend and backend are served from same domain
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("auth_token");
    const baseUrl = getBaseUrl();
    const url = baseUrl + queryKey.join("/");
    
    const res = await fetch(url, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // If we get a 401, redirect to login
    if (res.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes default instead of Infinity
      gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes after last use
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.message?.includes('4')) return false;
        return failureCount < 2;
      },
      // Add network-aware retries
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on client errors (4xx)
        if (error?.message?.includes('4')) return false;
        return failureCount < 1;
      },
    },
  },
});

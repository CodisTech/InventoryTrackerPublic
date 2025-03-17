import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Cache for CSRF token
let csrfToken: string | null = null;

// Function to fetch a CSRF token
async function fetchCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  
  try {
    const res = await fetch('/api/csrf-token', {
      credentials: 'include',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    
    const data = await res.json();
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('CSRF token fetch error:', error);
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  options?: { 
    data?: unknown | undefined,
    skipCsrf?: boolean 
  }
): Promise<Response> {
  const headers: Record<string, string> = {};
  const { data, skipCsrf = false } = options || {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add CSRF token for state-changing requests (POST, PATCH, DELETE)
  if (!skipCsrf && ['POST', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    try {
      const token = await fetchCsrfToken();
      headers['X-CSRF-Token'] = token;
    } catch (error) {
      console.error('Failed to include CSRF token:', error);
      // Continue without token - server will reject if token is required
    }
  }
  
  const res = await fetch(url, {
    method,
    headers,
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
    return await res.json();
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

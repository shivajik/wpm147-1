import { useQuery } from "@tanstack/react-query";
import { apiCall, queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;
      if (!token) {
        throw new Error("No token found");
      }
      
      return apiCall("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: true, // Always check auth status on mount
    enabled: typeof window !== 'undefined', // Only run on client side
  });

  const logout = () => {
    localStorage.removeItem("auth_token");
    // Clear all queries on logout
    queryClient.clear();
    window.location.href = "/login";
  };

  // If there's an auth error, clear the token (but only on client side)
  if (error && typeof window !== 'undefined' && localStorage.getItem("auth_token")) {
    localStorage.removeItem("auth_token");
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    logout,
  };
}

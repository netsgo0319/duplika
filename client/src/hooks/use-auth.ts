import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { authApi, type AuthUser } from "@/lib/api";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: authApi.me,
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      authApi.login(data),
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      authApi.register(data),
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      setLocation("/");
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}

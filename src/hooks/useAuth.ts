// hooks/useAuth.ts
import { useAuthStore } from '../stores/authStore';

export const useAuthentication = () => {
  const {
    user,
    userId,
    token,
    refreshToken,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    logoutAll,
    refreshTokenFn: refreshTokenAction,
    verify,
    getProfile,
    clearError,
    setTokens,
    getSession,
    clearAuth
  } = useAuthStore();

  return {
    user,
    userId,
    token,
    refreshToken,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    logoutAll,
    refreshTokenFn: refreshTokenAction,
    verify,
    getProfile,
    clearError,
    setTokens,
    getSession,
    clearAuth
  };
};
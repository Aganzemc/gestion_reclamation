// hooks/useAuth.ts
import { useAuthStore } from '../stores/authStore';

export const useAuthentication = () => {
  const {
    user,
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
    clearAuth
  } = useAuthStore();

  return {
    user,
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
    clearAuth
  };
};
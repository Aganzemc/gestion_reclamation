// hooks/useUsers.ts
import { useUserStore } from '../stores/userStore';

export const useUsers = () => {
  const {
    users,
    currentUser,
    loading,
    error,
    getUsers,
    getUserById,
    updateUserPassword,
    createUser,
    updateUser,
    deleteUser,
    clearError,
    setCurrentUser
  } = useUserStore();

  return {
    users,
    currentUser,
    loading,
    error,
    getUsers,
    getUserById,
    updateUserPassword,
    createUser,
    updateUser,
    deleteUser,
    clearError,
    setCurrentUser
  };
};
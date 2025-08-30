import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nom: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Données simulées des utilisateurs
const mockUsers: User[] = [
  {
    id: '1',
    nom: 'Admin Principal',
    email: 'admin@universite.fr',
    role: UserRole.ADMIN,
    dateCreation: new Date('2024-01-01'),
    actif: true
  },
  {
    id: '2', 
    nom: 'Marie Qualité',
    email: 'qa@universite.fr',
    role: UserRole.QA,
    dateCreation: new Date('2024-01-15'),
    actif: true
  },
  {
    id: '3',
    nom: 'Jean Opérations',
    email: 'sto@universite.fr', 
    role: UserRole.STO,
    dateCreation: new Date('2024-02-01'),
    actif: true
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulation d'authentification
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (nom: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulation d'inscription
    if (nom && email && password) {
      const newUser: User = {
        id: Date.now().toString(),
        nom,
        email,
        role,
        dateCreation: new Date(),
        actif: true
      };
      mockUsers.push(newUser);
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register, 
      logout,
      isAuthenticated,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
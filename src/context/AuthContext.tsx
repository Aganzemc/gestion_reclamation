import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import apiService from '../services/apiService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nom: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
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
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        // Convertir la réponse de l'API au format du frontend
        const apiUser = response.data.user;
        const frontendUser: User = {
          id: apiUser.id.toString(),
          nom: `${apiUser.prenom} ${apiUser.nom}`,
          email: apiUser.email,
          role: apiUser.roles.includes('ADMIN') ? UserRole.ADMIN :
                apiUser.roles.includes('QA') ? UserRole.QA :
                apiUser.roles.includes('STO') ? UserRole.STO : UserRole.VIEWER,
          dateCreation: new Date(),
          actif: true
        };
        
        setUser(frontendUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(frontendUser));
        return true;
      } else {
        console.error('Erreur de connexion:', response.error?.message);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
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

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
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
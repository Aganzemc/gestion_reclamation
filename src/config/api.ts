// Configuration de l'API backend
export const API_CONFIG = {
  // URL de base de l'API
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  
  // Endpoints de l'API
  ENDPOINTS: {
    // Authentification
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      VALIDATE: '/auth/validate'
    },
    
    // Utilisateurs
    USERS: {
      BASE: '/users',
      ROLES: '/users/roles',
      DEPARTMENTS: '/users/departments',
      ASSIGN_ROLE: (userId: string, roleId: string) => `/users/${userId}/roles`,
      REMOVE_ROLE: (userId: string, roleId: string) => `/users/${userId}/roles/${roleId}`
    },
    
    // Tickets
    TICKETS: {
      BASE: '/tickets',
      ASSIGN: (ticketId: string) => `/tickets/${ticketId}/assign`,
      COMMENTS: (ticketId: string) => `/tickets/${ticketId}/comments`
    },
    
    // Commentaires
    COMMENTS: {
      BASE: '/comments'
    },
    
    // Analytics
    ANALYTICS: {
      BASE: '/analytics',
      KPIS: '/analytics/kpis',
      REPORTS: '/analytics/reports'
    }
  },
  
  // Configuration des requêtes
  REQUEST_CONFIG: {
    TIMEOUT: 10000, // 10 secondes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 seconde
  },
  
  // Configuration des tokens
  TOKEN_CONFIG: {
    ACCESS_TOKEN_KEY: 'access_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    USER_KEY: 'user'
  }
};

// Fonction pour construire l'URL complète
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Fonction pour obtenir l'URL de base
export const getBaseUrl = (): string => {
  return API_CONFIG.BASE_URL;
};

// Fonction pour vérifier si l'API est accessible
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la vérification de la santé de l\'API:', error);
    return false;
  }
};

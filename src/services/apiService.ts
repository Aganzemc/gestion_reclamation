import { API_CONFIG, buildApiUrl } from '../config/api';

// Types pour les réponses de l'API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: string[];
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    nom: string;
    prenom: string;
    roles: string[];
    departments: string[];
  };
}

export interface UserCreateRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  roles: string[];
  departments: string[];
}

// Classe pour gérer les appels API
class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.loadTokens();
  }

  // Charger les tokens depuis le localStorage
  private loadTokens(): void {
    this.accessToken = localStorage.getItem(API_CONFIG.TOKEN_CONFIG.ACCESS_TOKEN_KEY);
    this.refreshToken = localStorage.getItem(API_CONFIG.TOKEN_CONFIG.REFRESH_TOKEN_KEY);
  }

  // Sauvegarder les tokens dans le localStorage
  private saveTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem(API_CONFIG.TOKEN_CONFIG.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(API_CONFIG.TOKEN_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
  }

  // Nettoyer les tokens
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(API_CONFIG.TOKEN_CONFIG.ACCESS_TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.TOKEN_CONFIG.REFRESH_TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.TOKEN_CONFIG.USER_KEY);
  }

  // Obtenir les en-têtes d'authentification
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Effectuer une requête HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = buildApiUrl(endpoint);
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Gérer les erreurs d'authentification
        if (response.status === 401) {
          // Essayer de rafraîchir le token
          if (this.refreshToken) {
            const refreshResult = await this.refreshAccessToken();
            if (refreshResult.success) {
              // Réessayer la requête originale
              return this.request(endpoint, options);
            }
          }
          // Déconnexion si le refresh échoue
          this.clearTokens();
          window.location.href = '/login';
        }

        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: data.message || `Erreur ${response.status}`,
            details: data.error?.details || [],
          },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Erreur API:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur de connexion au serveur',
          details: [error instanceof Error ? error.message : 'Erreur inconnue'],
        },
      };
    }
  }

  // Authentification
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.saveTokens(response.data.access_token, response.data.refresh_token);
      localStorage.setItem(API_CONFIG.TOKEN_CONFIG.USER_KEY, JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    if (this.refreshToken) {
      await this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });
    }

    this.clearTokens();
    return { success: true, message: 'Déconnexion réussie' };
  }

  async refreshAccessToken(): Promise<ApiResponse<{ access_token: string }>> {
    if (!this.refreshToken) {
      return {
        success: false,
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'Aucun token de rafraîchissement disponible',
        },
      };
    }

    const response = await this.request<{ access_token: string }>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      }
    );

    if (response.success && response.data) {
      this.accessToken = response.data.access_token;
      localStorage.setItem(API_CONFIG.TOKEN_CONFIG.ACCESS_TOKEN_KEY, response.data.access_token);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  // Gestion des utilisateurs
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    department?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.department) queryParams.append('department', params.department);

    const endpoint = `${API_CONFIG.ENDPOINTS.USERS.BASE}?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  async createUser(userData: UserCreateRequest): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.USERS.BASE, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserById(userId: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}`);
  }

  async updateUser(userId: string, userData: Partial<UserCreateRequest>): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.USERS.BASE}/${userId}`, {
      method: 'DELETE',
    });
  }

  async getRoles(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.USERS.ROLES);
  }

  async getDepartments(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.USERS.DEPARTMENTS);
  }

  // Gestion des tickets
  async getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    priority?: string;
    department?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.department) queryParams.append('department', params.department);

    const endpoint = `${API_CONFIG.ENDPOINTS.TICKETS.BASE}?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  async createTicket(ticketData: any): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.TICKETS.BASE, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async getTicketById(ticketId: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.TICKETS.BASE}/${ticketId}`);
  }

  async updateTicket(ticketId: string, ticketData: any): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.TICKETS.BASE}/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    });
  }

  async deleteTicket(ticketId: string): Promise<ApiResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.TICKETS.BASE}/${ticketId}`, {
      method: 'DELETE',
    });
  }

  // Gestion des commentaires
  async getTicketComments(ticketId: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.TICKETS.COMMENTS(ticketId));
  }

  async addComment(ticketId: string, commentData: { contenu: string }): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.TICKETS.COMMENTS(ticketId), {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  // Analytics et KPIs
  async getKPIs(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.ANALYTICS.KPIS);
  }

  async getReports(): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.ANALYTICS.REPORTS);
  }

  // Vérifier la santé de l'API
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Obtenir le statut de l'authentification
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Obtenir l'utilisateur actuel depuis le localStorage
  getCurrentUserFromStorage(): any {
    const userStr = localStorage.getItem(API_CONFIG.TOKEN_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}

// Instance singleton du service API
export const apiService = new ApiService();
export default apiService;

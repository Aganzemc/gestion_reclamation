import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { 
  User, 
  UserWithRoles, 
  LoginRequest, 
  LoginResponse, 
  JwtPayload,
  RefreshTokenRequest,
  RefreshTokenResponse 
} from '../types';
import { query, queryOne, transaction } from '../database/connection';
import logger from '../utils/logger';
import { logSecurityEvent } from '../utils/logger';

export class AuthService {
  
  /**
   * Authentifie un utilisateur avec email et mot de passe
   */
  static async login(loginData: LoginRequest, ipAddress?: string): Promise<LoginResponse> {
    try {
      // Récupérer l'utilisateur par email
      const users = await query<User>(
        'SELECT * FROM users WHERE email = $1 AND status = $2',
        [loginData.email, 'ACTIVE']
      );
      
      if (users.length === 0) {
        logSecurityEvent('Tentative de connexion avec email inexistant', {
          email: loginData.email,
          ip: ipAddress
        });
        throw new Error('Email ou mot de passe incorrect');
      }
      
      const user = users[0];
      
      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);
      
      if (!isPasswordValid) {
        logSecurityEvent('Tentative de connexion avec mot de passe incorrect', {
          email: loginData.email,
          ip: ipAddress
        });
        throw new Error('Email ou mot de passe incorrect');
      }
      
      // Récupérer les rôles et départements de l'utilisateur
      const userWithRoles = await this.getUserWithRoles(user.id);
      
      // Générer les tokens
      const accessToken = this.generateAccessToken(userWithRoles);
      const refreshToken = await this.generateRefreshToken(user.id);
      
      // Mettre à jour la date de dernière connexion
      await query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [user.id]
      );
      
      // Logger la connexion réussie
      logger.info('Connexion utilisateur réussie', {
        userId: user.id,
        email: user.email,
        ip: ipAddress
      });
      
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: userWithRoles,
        expires_in: this.getTokenExpirationTime()
      };
      
    } catch (error) {
      logger.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }
  
  /**
   * Déconnecte un utilisateur en révoquant son refresh token
   */
  static async logout(userId: number, refreshToken: string): Promise<void> {
    try {
      // Révoquer le refresh token
      await query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1 AND token = $2',
        [userId, refreshToken]
      );
      
      logger.info('Utilisateur déconnecté', { userId });
      
    } catch (error) {
      logger.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }
  
  /**
   * Rafraîchit un access token avec un refresh token
   */
  static async refreshToken(refreshData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      // Vérifier que le refresh token existe et n'est pas révoqué
      const tokens = await query(
        'SELECT * FROM refresh_tokens WHERE token = $1 AND is_revoked = false AND expires_at > NOW()',
        [refreshData.refresh_token]
      );
      
      if (tokens.length === 0) {
        throw new Error('Refresh token invalide ou expiré');
      }
      
      const refreshToken = tokens[0];
      
      // Récupérer l'utilisateur
      const users = await query<User>(
        'SELECT * FROM users WHERE id = $1 AND status = $2',
        [refreshToken.user_id, 'ACTIVE']
      );
      
      if (users.length === 0) {
        throw new Error('Utilisateur non trouvé ou inactif');
      }
      
      const user = users[0];
      const userWithRoles = await this.getUserWithRoles(user.id);
      
      // Générer un nouveau access token
      const newAccessToken = this.generateAccessToken(userWithRoles);
      
      return {
        access_token: newAccessToken,
        expires_in: this.getTokenExpirationTime()
      };
      
    } catch (error) {
      logger.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }
  
  /**
   * Valide un access token JWT
   */
  static verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expiré');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token invalide');
      } else {
        throw new Error('Erreur de validation du token');
      }
    }
  }
  
  /**
   * Génère un hash pour un mot de passe
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcrypt_rounds);
  }
  
  /**
   * Vérifie si un mot de passe respecte les critères de sécurité
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Génère un access token JWT
   */
  private static generateAccessToken(user: UserWithRoles): string {
    const payload: JwtPayload = {
      user_id: user.id,
      email: user.email,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.getTokenExpirationTime()
    };
    
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expires_in
    });
  }
  
  /**
   * Génère et stocke un refresh token
   */
  private static async generateRefreshToken(userId: number): Promise<string> {
    const refreshToken = jwt.sign(
      { user_id: userId, type: 'refresh' },
      config.jwt.refresh_secret,
      { expiresIn: config.jwt.refresh_expires_in }
    );
    
    // Calculer la date d'expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours
    
    // Stocker le refresh token en base
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, refreshToken, expiresAt]
    );
    
    return refreshToken;
  }
  
  /**
   * Récupère un utilisateur avec ses rôles et départements
   */
  private static async getUserWithRoles(userId: number): Promise<UserWithRoles> {
    const users = await query<any>(
      `SELECT 
        u.id, u.email, u.first_name, u.last_name, u.status, 
        u.created_at, u.updated_at, u.last_login_at, u.email_verified,
        array_agg(DISTINCT r.code) FILTER (WHERE r.code IS NOT NULL) as roles,
        array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL) as departments
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN user_departments ud ON u.id = ud.user_id
      LEFT JOIN departments d ON ud.department_id = d.id
      WHERE u.id = $1
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.status, 
               u.created_at, u.updated_at, u.last_login_at, u.email_verified`,
      [userId]
    );
    
    if (users.length === 0) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const user = users[0];
    return {
      ...user,
      roles: user.roles || [],
      departments: user.departments || []
    };
  }
  
  /**
   * Retourne le temps d'expiration du token en secondes
   */
  private static getTokenExpirationTime(): number {
    const expiresIn = config.jwt.expires_in;
    
    if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 3600;
    } else if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 86400;
    } else {
      return parseInt(expiresIn);
    }
  }
  
  /**
   * Nettoie les refresh tokens expirés
   */
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await query(
        'DELETE FROM refresh_tokens WHERE expires_at < NOW() OR is_revoked = true'
      );
      
      if (result.length > 0) {
        logger.info(`Nettoyage de ${result.length} refresh tokens expirés`);
      }
    } catch (error) {
      logger.error('Erreur lors du nettoyage des tokens expirés:', error);
    }
  }
}

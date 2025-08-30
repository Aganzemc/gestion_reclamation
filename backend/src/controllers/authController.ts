import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginRequest, RefreshTokenRequest } from '../types';
import logger from '../utils/logger';
import { logSecurityEvent } from '../utils/logger';

export class AuthController {
  
  /**
   * POST /auth/login
   * Authentifie un utilisateur et retourne un token JWT
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;
      
      // Validation des données d'entrée
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email et mot de passe requis',
          code: 'MISSING_CREDENTIALS'
        });
        return;
      }
      
      // Validation du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: 'Format d\'email invalide',
          code: 'INVALID_EMAIL_FORMAT'
        });
        return;
      }
      
      // Récupérer l'adresse IP du client
      const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      
      // Authentifier l'utilisateur
      const loginResult = await AuthService.login({ email, password }, ipAddress);
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        data: loginResult,
        message: 'Connexion réussie'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la connexion:', error);
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes('Email ou mot de passe incorrect')) {
          res.status(401).json({
            success: false,
            error: 'Email ou mot de passe incorrect',
            code: 'INVALID_CREDENTIALS'
          });
          return;
        }
      }
      
      // Erreur générique
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
  
  /**
   * POST /auth/logout
   * Déconnecte un utilisateur en révoquant son refresh token
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      const { refresh_token } = req.body;
      
      if (!refresh_token) {
        res.status(400).json({
          success: false,
          error: 'Refresh token requis',
          code: 'MISSING_REFRESH_TOKEN'
        });
        return;
      }
      
      // Déconnecter l'utilisateur
      await AuthService.logout(req.user.user_id, refresh_token);
      
      // Logger l'événement de déconnexion
      logSecurityEvent('Utilisateur déconnecté', {
        userId: req.user.user_id,
        email: req.user.email,
        ip: req.ip
      });
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la déconnexion:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
  
  /**
   * POST /auth/refresh
   * Rafraîchit un access token avec un refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refresh_token }: RefreshTokenRequest = req.body;
      
      if (!refresh_token) {
        res.status(400).json({
          success: false,
          error: 'Refresh token requis',
          code: 'MISSING_REFRESH_TOKEN'
        });
        return;
      }
      
      // Rafraîchir le token
      const refreshResult = await AuthService.refreshToken({ refresh_token });
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        data: refreshResult,
        message: 'Token rafraîchi avec succès'
      });
      
    } catch (error) {
      logger.error('Erreur lors du rafraîchissement du token:', error);
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes('Refresh token invalide')) {
          res.status(401).json({
            success: false,
            error: 'Refresh token invalide ou expiré',
            code: 'INVALID_REFRESH_TOKEN'
          });
          return;
        }
        
        if (error.message.includes('Utilisateur non trouvé')) {
          res.status(401).json({
            success: false,
            error: 'Utilisateur non trouvé ou inactif',
            code: 'USER_NOT_FOUND'
          });
          return;
        }
      }
      
      // Erreur générique
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
  
  /**
   * GET /auth/me
   * Récupère les informations de l'utilisateur connecté
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      // Retourner les informations de l'utilisateur
      res.status(200).json({
        success: true,
        data: {
          user_id: req.user.user_id,
          email: req.user.email,
          roles: req.user.roles
        },
        message: 'Informations utilisateur récupérées'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la récupération des informations utilisateur:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
  
  /**
   * POST /auth/validate
   * Valide un token JWT (pour tests et vérifications)
   */
  static async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Token requis',
          code: 'MISSING_TOKEN'
        });
        return;
      }
      
      // Valider le token
      const decoded = AuthService.verifyToken(token);
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        data: {
          valid: true,
          user_id: decoded.user_id,
          email: decoded.email,
          roles: decoded.roles,
          exp: decoded.exp
        },
        message: 'Token valide'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la validation du token:', error);
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes('Token expiré')) {
          res.status(401).json({
            success: false,
            error: 'Token expiré',
            code: 'TOKEN_EXPIRED'
          });
          return;
        }
        
        if (error.message.includes('Token invalide')) {
          res.status(401).json({
            success: false,
            error: 'Token invalide',
            code: 'TOKEN_INVALID'
          });
          return;
        }
      }
      
      // Erreur générique
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

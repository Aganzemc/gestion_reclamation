import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { UserCreate, UserUpdate, PaginationParams, UserFilters } from '../types';
import logger from '../utils/logger';

export class UserController {
  
  /**
   * POST /users
   * Crée un nouvel utilisateur (ADMIN only)
   */
  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      const userData: UserCreate = req.body;
      
      // Validation des données d'entrée
      if (!userData.email || !userData.password || !userData.first_name || !userData.last_name) {
        res.status(400).json({
          success: false,
          error: 'Tous les champs obligatoires doivent être fournis',
          code: 'MISSING_REQUIRED_FIELDS',
          details: {
            required: ['email', 'password', 'first_name', 'last_name'],
            provided: Object.keys(userData)
          }
        });
        return;
      }
      
      // Créer l'utilisateur
      const newUser = await UserService.createUser(userData, req.user.user_id);
      
      // Retourner la réponse de succès
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Utilisateur créé avec succès'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la création de l\'utilisateur:', error);
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes('Mot de passe invalide')) {
          res.status(400).json({
            success: false,
            error: error.message,
            code: 'INVALID_PASSWORD'
          });
          return;
        }
        
        if (error.message.includes('email existe déjà')) {
          res.status(409).json({
            success: false,
            error: 'Un utilisateur avec cet email existe déjà',
            code: 'EMAIL_ALREADY_EXISTS'
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
   * GET /users
   * Récupère la liste paginée des utilisateurs avec filtres
   */
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      // Paramètres de pagination
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const sortBy = req.query['sort_by'] as string || 'created_at';
    const sortOrder = (req.query['sort_order'] as string) || 'DESC';
      
      // Validation des paramètres
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          error: 'Paramètres de pagination invalides',
          code: 'INVALID_PAGINATION_PARAMS',
          details: {
            page: 'Doit être >= 1',
            limit: 'Doit être entre 1 et 100'
          }
        });
        return;
      }
      
      const pagination: PaginationParams = {
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder as 'ASC' | 'DESC'
      };
      
      // Filtres
      const filters: UserFilters = {};
      
    if (req.query['status']) {
      filters.status = req.query['status'] as any;
    }
    if (req.query['roles']) {
      const roles = Array.isArray(req.query['roles'])
        ? req.query['roles'] as string[]
        : [req.query['roles'] as string];
      filters.roles = roles;
    }
    if (req.query['departments']) {
      const departments = Array.isArray(req.query['departments'])
        ? req.query['departments'] as string[]
        : [req.query['departments'] as string];
      filters.departments = departments;
    }
    if (req.query['search']) {
      filters.search = req.query['search'] as string;
    }
      
      // Récupérer les utilisateurs
      const users = await UserService.getUsers(pagination, filters);
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        data: users,
        message: 'Utilisateurs récupérés avec succès'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la récupération des utilisateurs:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
  
  /**
   * GET /users/:id
   * Récupère un utilisateur par son ID
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'ID utilisateur invalide',
          code: 'INVALID_USER_ID'
        });
        return;
      }
      
      // Récupérer l'utilisateur
      const user = await UserService.getUserById(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé',
          code: 'USER_NOT_FOUND'
        });
        return;
      }
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        data: user,
        message: 'Utilisateur récupéré avec succès'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'utilisateur:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
  
  /**
   * PUT /users/:id
   * Met à jour un utilisateur
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'ID utilisateur invalide',
          code: 'INVALID_USER_ID'
        });
        return;
      }
      
      const updateData: UserUpdate = req.body;
      
      // Vérifier qu'au moins un champ est fourni
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          error: 'Aucune donnée à mettre à jour',
          code: 'NO_UPDATE_DATA'
        });
        return;
      }
      
      // Mettre à jour l'utilisateur
      const updatedUser = await UserService.updateUser(userId, updateData, req.user.user_id);
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Utilisateur mis à jour avec succès'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes('Utilisateur non trouvé')) {
          res.status(404).json({
            success: false,
            error: 'Utilisateur non trouvé',
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
   * DELETE /users/:id
   * Désactive un utilisateur
   */
  static async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'ID utilisateur invalide',
          code: 'INVALID_USER_ID'
        });
        return;
      }
      
      // Désactiver l'utilisateur
      await UserService.deactivateUser(userId, req.user.user_id);
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        message: 'Utilisateur désactivé avec succès'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la désactivation de l\'utilisateur:', error);
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes('Utilisateur non trouvé')) {
          res.status(404).json({
            success: false,
            error: 'Utilisateur non trouvé',
            code: 'USER_NOT_FOUND'
          });
          return;
        }
        
        if (error.message.includes('ne peut pas se désactiver lui-même')) {
          res.status(400).json({
            success: false,
            error: 'Un utilisateur ne peut pas se désactiver lui-même',
            code: 'SELF_DEACTIVATION_NOT_ALLOWED'
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
   * GET /users/roles
   * Récupère tous les rôles disponibles
   */
  static async getRoles(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      // Récupérer les rôles
      const roles = await UserService.getRoles();
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        data: roles,
        message: 'Rôles récupérés avec succès'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la récupération des rôles:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
  
  /**
   * GET /users/departments
   * Récupère tous les départements disponibles
   */
  static async getDepartments(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      // Récupérer les départements
      const departments = await UserService.getDepartments();
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        data: departments,
        message: 'Départements récupérés avec succès'
      });
      
    } catch (error) {
      logger.error('Erreur lors de la récupération des départements:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  }
  
  /**
   * POST /users/:id/roles
   * Assigne un rôle à un utilisateur
   */
  static async assignRole(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      const userId = parseInt(req.params.id);
      const { role_id } = req.body;
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'ID utilisateur invalide',
          code: 'INVALID_USER_ID'
        });
        return;
      }
      
      if (!role_id || isNaN(role_id)) {
        res.status(400).json({
          success: false,
          error: 'ID de rôle invalide',
          code: 'INVALID_ROLE_ID'
        });
        return;
      }
      
      // Assigner le rôle
      await UserService.assignRole(userId, role_id, req.user.user_id);
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        message: 'Rôle assigné avec succès'
      });
      
    } catch (error) {
      logger.error('Erreur lors de l\'assignation du rôle:', error);
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes('Utilisateur non trouvé')) {
          res.status(404).json({
            success: false,
            error: 'Utilisateur non trouvé',
            code: 'USER_NOT_FOUND'
          });
          return;
        }
        
        if (error.message.includes('Rôle non trouvé')) {
          res.status(404).json({
            success: false,
            error: 'Rôle non trouvé',
            code: 'ROLE_NOT_FOUND'
          });
          return;
        }
        
        if (error.message.includes('déjà assigné')) {
          res.status(409).json({
            success: false,
            error: 'Ce rôle est déjà assigné à cet utilisateur',
            code: 'ROLE_ALREADY_ASSIGNED'
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
   * DELETE /users/:id/roles/:roleId
   * Retire un rôle d'un utilisateur
   */
  static async removeRole(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentification requise',
          code: 'AUTHENTICATION_REQUIRED'
        });
        return;
      }
      
      const userId = parseInt(req.params['id']);
      const roleId = parseInt(req.params['roleId']);
      
      if (isNaN(userId) || isNaN(roleId)) {
        res.status(400).json({
          success: false,
          error: 'ID utilisateur ou rôle invalide',
          code: 'INVALID_ID'
        });
        return;
      }
      
      // Retirer le rôle
      await UserService.removeRole(userId, roleId, req.user.user_id);
      
      // Retourner la réponse de succès
      res.status(200).json({
        success: true,
        message: 'Rôle retiré avec succès'
      });
      
    } catch (error) {
      logger.error('Erreur lors du retrait du rôle:', error);
      
      // Gérer les erreurs spécifiques
      if (error instanceof Error) {
        if (error.message.includes('n\'est pas assigné')) {
          res.status(404).json({
            success: false,
            error: 'Ce rôle n\'est pas assigné à cet utilisateur',
            code: 'ROLE_NOT_ASSIGNED'
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

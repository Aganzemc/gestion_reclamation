import { query, queryOne, transaction } from '../database/connection';
import { 
  User, 
  UserWithRoles, 
  UserCreate, 
  UserUpdate, 
  Role, 
  Department,
  PaginationParams,
  PaginatedResponse,
  UserFilters
} from '../types';
import { AuthService } from './authService';
import logger from '../utils/logger';
import { logAuditEvent } from '../utils/logger';

export class UserService {
  
  /**
   * Crée un nouvel utilisateur
   */
  static async createUser(userData: UserCreate, createdBy: number): Promise<UserWithRoles> {
    try {
      // Valider le mot de passe
      const passwordValidation = AuthService.validatePassword(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Mot de passe invalide: ${passwordValidation.errors.join(', ')}`);
      }
      
      // Vérifier que l'email n'existe pas déjà
      const existingUsers = await query<User>(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );
      
      if (existingUsers.length > 0) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      
      // Hasher le mot de passe
      const passwordHash = await AuthService.hashPassword(userData.password);
      
      // Créer l'utilisateur dans une transaction
      const result = await transaction(async (client) => {
        // Insérer l'utilisateur
        const userResult = await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, status, email_verified)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [userData.email, passwordHash, userData.first_name, userData.last_name, 'ACTIVE', false]
        );
        
        const newUser = userResult.rows[0];
        
        // Assigner les rôles si spécifiés
        if (userData.roles && userData.roles.length > 0) {
          for (const roleId of userData.roles) {
            await client.query(
              'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
              [newUser.id, roleId, createdBy]
            );
          }
        }
        
        // Assigner les départements si spécifiés
        if (userData.departments && userData.departments.length > 0) {
          for (const deptId of userData.departments) {
            await client.query(
              'INSERT INTO user_departments (user_id, department_id, assigned_by) VALUES ($1, $2, $3)',
              [newUser.id, deptId, createdBy]
            );
          }
        }
        
        return newUser;
      });
      
      // Récupérer l'utilisateur avec ses rôles et départements
      const userWithRoles = await this.getUserWithRoles(result.id);
      
      // Logger l'événement d'audit
      logAuditEvent('USER_CREATED', {
        userId: result.id,
        email: result.email,
        createdBy,
        roles: userData.roles || [],
        departments: userData.departments || []
      });
      
      logger.info('Utilisateur créé avec succès', {
        userId: result.id,
        email: result.email,
        createdBy
      });
      
      return userWithRoles;
      
    } catch (error) {
      logger.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }
  
  /**
   * Récupère un utilisateur par son ID avec ses rôles et départements
   */
  static async getUserById(userId: number): Promise<UserWithRoles | null> {
    try {
      const users = await query(
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
        return null;
      }
      
      const user = users[0];
      return {
        ...user,
        roles: user.roles || [],
        departments: user.departments || []
      };
      
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }
  
  /**
   * Récupère la liste paginée des utilisateurs avec filtres
   */
  static async getUsers(
    pagination: PaginationParams,
    filters: UserFilters = {}
  ): Promise<PaginatedResponse<UserWithRoles>> {
    try {
      let whereConditions = ['u.status != $1'];
      let queryParams: any[] = ['DELETED'];
      let paramIndex = 2;
      
      // Appliquer les filtres
      if (filters.status) {
        whereConditions.push(`u.status = $${paramIndex}`);
        queryParams.push(filters.status);
        paramIndex++;
      }
      
      if (filters.roles && filters.roles.length > 0) {
        const roleConditions = filters.roles.map((_, index) => `r.code = $${paramIndex + index}`);
        whereConditions.push(`(${roleConditions.join(' OR ')})`);
        queryParams.push(...filters.roles);
        paramIndex += filters.roles.length;
      }
      
      if (filters.departments && filters.departments.length > 0) {
        const deptConditions = filters.departments.map((_, index) => `d.name = $${paramIndex + index}`);
        whereConditions.push(`(${deptConditions.join(' OR ')})`);
        queryParams.push(...filters.departments);
        paramIndex += filters.departments.length;
      }
      
      if (filters.search) {
        whereConditions.push(`(
          u.email ILIKE $${paramIndex} OR 
          u.first_name ILIKE $${paramIndex} OR 
          u.last_name ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${filters.search}%`);
        paramIndex++;
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      // Requête pour le total
      const countQuery = `
        SELECT COUNT(DISTINCT u.id) as total
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        LEFT JOIN user_departments ud ON u.id = ud.user_id
        LEFT JOIN departments d ON ud.department_id = d.id
        WHERE ${whereClause}
      `;
      
      const countResult = await query(countQuery, queryParams);
      const total = parseInt(countResult[0].total);
      
      // Requête pour les données avec pagination
      const dataQuery = `
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.status, 
          u.created_at, u.updated_at, u.last_login_at, u.email_verified,
          array_agg(DISTINCT r.code) FILTER (WHERE r.code IS NOT NULL) as roles,
          array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL) as departments
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        LEFT JOIN user_departments ud ON u.id = ud.user_id
        LEFT JOIN departments d ON ud.department_id = d.id
        WHERE ${whereClause}
        GROUP BY u.id, u.email, u.first_name, u.last_name, u.status, 
                 u.created_at, u.updated_at, u.last_login_at, u.email_verified
        ORDER BY u.${pagination.sort_by || 'created_at'} ${pagination.sort_order || 'DESC'}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const offset = (pagination.page - 1) * pagination.limit;
      queryParams.push(pagination.limit, offset);
      
      const users = await query(dataQuery, queryParams);
      
      const data = users.map(user => ({
        ...user,
        roles: user.roles || [],
        departments: user.departments || []
      }));
      
      const totalPages = Math.ceil(total / pagination.limit);
      
      return {
        data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          total_pages: totalPages,
          has_next: pagination.page < totalPages,
          has_prev: pagination.page > 1
        }
      };
      
    } catch (error) {
      logger.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }
  
  /**
   * Met à jour un utilisateur
   */
  static async updateUser(
    userId: number, 
    updateData: UserUpdate, 
    updatedBy: number
  ): Promise<UserWithRoles> {
    try {
      // Vérifier que l'utilisateur existe
      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Construire la requête de mise à jour
      const updateFields: string[] = [];
      const updateParams: any[] = [];
      let paramIndex = 1;
      
      if (updateData.first_name !== undefined) {
        updateFields.push(`first_name = $${paramIndex}`);
        updateParams.push(updateData.first_name);
        paramIndex++;
      }
      
      if (updateData.last_name !== undefined) {
        updateFields.push(`last_name = $${paramIndex}`);
        updateParams.push(updateData.last_name);
        paramIndex++;
      }
      
      if (updateData.status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        updateParams.push(updateData.status);
        paramIndex++;
      }
      
      if (updateData.email_verified !== undefined) {
        updateFields.push(`email_verified = $${paramIndex}`);
        updateParams.push(updateData.email_verified);
        paramIndex++;
      }
      
      if (updateFields.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }
      
      // Ajouter l'ID de l'utilisateur et l'utilisateur qui met à jour
      updateParams.push(userId, updatedBy);
      
      // Exécuter la mise à jour
      await query(
        `UPDATE users 
         SET ${updateFields.join(', ')}, updated_at = NOW() 
         WHERE id = $${paramIndex} AND id != $${paramIndex + 1}`,
        updateParams
      );
      
      // Récupérer l'utilisateur mis à jour
      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('Erreur lors de la récupération de l\'utilisateur mis à jour');
      }
      
      // Logger l'événement d'audit
      logAuditEvent('USER_UPDATED', {
        userId,
        updatedBy,
        changes: updateData
      });
      
      logger.info('Utilisateur mis à jour avec succès', {
        userId,
        updatedBy,
        changes: updateData
      });
      
      return updatedUser;
      
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }
  
  /**
   * Désactive/supprime un utilisateur
   */
  static async deactivateUser(userId: number, deactivatedBy: number): Promise<void> {
    try {
      // Vérifier que l'utilisateur existe
      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Empêcher la désactivation de l'utilisateur qui effectue l'action
      if (userId === deactivatedBy) {
        throw new Error('Un utilisateur ne peut pas se désactiver lui-même');
      }
      
      // Désactiver l'utilisateur
      await query(
        'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2',
        ['INACTIVE', userId]
      );
      
      // Révoquer tous les refresh tokens de l'utilisateur
      await query(
        'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
        [userId]
      );
      
      // Logger l'événement d'audit
      logAuditEvent('USER_DEACTIVATED', {
        userId,
        deactivatedBy
      });
      
      logger.info('Utilisateur désactivé avec succès', {
        userId,
        deactivatedBy
      });
      
    } catch (error) {
      logger.error('Erreur lors de la désactivation de l\'utilisateur:', error);
      throw error;
    }
  }
  
  /**
   * Récupère tous les rôles disponibles
   */
  static async getRoles(): Promise<Role[]> {
    try {
      return await query<Role>('SELECT * FROM roles ORDER BY code');
    } catch (error) {
      logger.error('Erreur lors de la récupération des rôles:', error);
      throw error;
    }
  }
  
  /**
   * Récupère tous les départements disponibles
   */
  static async getDepartments(): Promise<Department[]> {
    try {
      return await query<Department>('SELECT * FROM departments ORDER BY name');
    } catch (error) {
      logger.error('Erreur lors de la récupération des départements:', error);
      throw error;
    }
  }
  
  /**
   * Assigne un rôle à un utilisateur
   */
  static async assignRole(
    userId: number, 
    roleId: number, 
    assignedBy: number
  ): Promise<void> {
    try {
      // Vérifier que l'utilisateur existe
      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Vérifier que le rôle existe
      const roles = await query<Role>('SELECT * FROM roles WHERE id = $1', [roleId]);
      if (roles.length === 0) {
        throw new Error('Rôle non trouvé');
      }
      
      // Vérifier que l'assignation n'existe pas déjà
      const existingAssignments = await query(
        'SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2',
        [userId, roleId]
      );
      
      if (existingAssignments.length > 0) {
        throw new Error('Ce rôle est déjà assigné à cet utilisateur');
      }
      
      // Assigner le rôle
      await query(
        'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
        [userId, roleId, assignedBy]
      );
      
      // Logger l'événement d'audit
      logAuditEvent('ROLE_ASSIGNED', {
        userId,
        roleId,
        assignedBy
      });
      
      logger.info('Rôle assigné avec succès', {
        userId,
        roleId,
        assignedBy
      });
      
    } catch (error) {
      logger.error('Erreur lors de l\'assignation du rôle:', error);
      throw error;
    }
  }
  
  /**
   * Retire un rôle d'un utilisateur
   */
  static async removeRole(
    userId: number, 
    roleId: number, 
    removedBy: number
  ): Promise<void> {
    try {
      // Vérifier que l'assignation existe
      const existingAssignments = await query(
        'SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2',
        [userId, roleId]
      );
      
      if (existingAssignments.length === 0) {
        throw new Error('Ce rôle n\'est pas assigné à cet utilisateur');
      }
      
      // Retirer le rôle
      await query(
        'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
        [userId, roleId]
      );
      
      // Logger l'événement d'audit
      logAuditEvent('ROLE_REMOVED', {
        userId,
        roleId,
        removedBy
      });
      
      logger.info('Rôle retiré avec succès', {
        userId,
        roleId,
        removedBy
      });
      
    } catch (error) {
      logger.error('Erreur lors du retrait du rôle:', error);
      throw error;
    }
  }
  
  /**
   * Assigne un département à un utilisateur
   */
  static async assignDepartment(
    userId: number, 
    departmentId: number, 
    assignedBy: number
  ): Promise<void> {
    try {
      // Vérifier que l'utilisateur existe
      const existingUser = await this.getUserById(userId);
      if (!existingUser) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // Vérifier que le département existe
      const departments = await query<Department>(
        'SELECT * FROM departments WHERE id = $1', 
        [departmentId]
      );
      if (departments.length === 0) {
        throw new Error('Département non trouvé');
      }
      
      // Vérifier que l'assignation n'existe pas déjà
      const existingAssignments = await query(
        'SELECT * FROM user_departments WHERE user_id = $1 AND department_id = $2',
        [userId, departmentId]
      );
      
      if (existingAssignments.length > 0) {
        throw new Error('Ce département est déjà assigné à cet utilisateur');
      }
      
      // Assigner le département
      await query(
        'INSERT INTO user_departments (user_id, department_id, assigned_by) VALUES ($1, $2, $3)',
        [userId, departmentId, assignedBy]
      );
      
      // Logger l'événement d'audit
      logAuditEvent('DEPARTMENT_ASSIGNED', {
        userId,
        departmentId,
        assignedBy
      });
      
      logger.info('Département assigné avec succès', {
        userId,
        departmentId,
        assignedBy
      });
      
    } catch (error) {
      logger.error('Erreur lors de l\'assignation du département:', error);
      throw error;
    }
  }
}

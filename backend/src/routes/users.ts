import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireRole, requirePermission } from '../middleware/auth';

const router = Router();

// =====================================================
// Routes des utilisateurs
// =====================================================

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

/**
 * POST /users
 * Crée un nouvel utilisateur (ADMIN only)
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Body:
 * {
 *   "email": "newuser@example.com",
 *   "password": "MotDePasse123!",
 *   "first_name": "Jane",
 *   "last_name": "Smith",
 *   "roles": [1, 2],
 *   "departments": [1, 3]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 2,
 *     "email": "newuser@example.com",
 *     "first_name": "Jane",
 *     "last_name": "Smith",
 *     "status": "ACTIVE",
 *     "roles": ["QA", "STO"],
 *     "departments": ["Informatique", "Pédagogie"]
 *   },
 *   "message": "Utilisateur créé avec succès"
 * }
 */
router.post('/', requireRole(['ADMIN']), UserController.createUser);

/**
 * GET /users
 * Récupère la liste paginée des utilisateurs avec filtres
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Query Parameters:
 * - page: numéro de page (défaut: 1)
 * - limit: nombre d'éléments par page (défaut: 10, max: 100)
 * - sort_by: champ de tri (défaut: created_at)
 * - sort_order: ordre de tri ASC/DESC (défaut: DESC)
 * - status: filtre par statut (ACTIVE, INACTIVE, SUSPENDED)
 * - roles: filtre par rôles (array)
 * - departments: filtre par départements (array)
 * - search: recherche textuelle
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "data": [
 *       {
 *         "id": 1,
 *         "email": "admin@example.com",
 *         "first_name": "John",
 *         "last_name": "Doe",
 *         "status": "ACTIVE",
 *         "roles": ["ADMIN"],
 *         "departments": ["Informatique"]
 *       }
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 10,
 *       "total": 25,
 *       "total_pages": 3,
 *       "has_next": true,
 *       "has_prev": false
 *     }
 *   },
 *   "message": "Utilisateurs récupérés avec succès"
 * }
 */
router.get('/', requirePermission('users', 'read'), UserController.getUsers);

/**
 * GET /users/:id
 * Récupère un utilisateur par son ID
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "email": "admin@example.com",
 *     "first_name": "John",
 *     "last_name": "Doe",
 *     "status": "ACTIVE",
 *     "created_at": "2024-01-01T00:00:00Z",
 *     "roles": ["ADMIN"],
 *     "departments": ["Informatique"]
 *   },
 *   "message": "Utilisateur récupéré avec succès"
 * }
 */
router.get('/:id', requirePermission('users', 'read'), UserController.getUserById);

/**
 * PUT /users/:id
 * Met à jour un utilisateur
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Body:
 * {
 *   "first_name": "John Updated",
 *   "status": "ACTIVE"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": 1,
 *     "email": "admin@example.com",
 *     "first_name": "John Updated",
 *     "last_name": "Doe",
 *     "status": "ACTIVE"
 *   },
 *   "message": "Utilisateur mis à jour avec succès"
 * }
 */
router.put('/:id', requirePermission('users', 'update'), UserController.updateUser);

/**
 * DELETE /users/:id
 * Désactive un utilisateur
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Utilisateur désactivé avec succès"
 * }
 */
router.delete('/:id', requireRole(['ADMIN']), UserController.deactivateUser);

/**
 * GET /users/roles
 * Récupère tous les rôles disponibles
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "code": "ADMIN",
 *       "label": "Administrateur système"
 *     },
 *     {
 *       "id": 2,
 *       "code": "QA",
 *       "label": "Responsable qualité"
 *     }
 *   ],
 *   "message": "Rôles récupérés avec succès"
 * }
 */
router.get('/roles', requirePermission('users', 'read'), UserController.getRoles);

/**
 * GET /users/departments
 * Récupère tous les départements disponibles
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Informatique",
 *       "description": "Département des technologies de l'information"
 *     },
 *     {
 *       "id": 2,
 *       "name": "Ressources Humaines",
 *       "description": "Département des ressources humaines"
 *     }
 *   ],
 *   "message": "Départements récupérés avec succès"
 * }
 */
router.get('/departments', requirePermission('users', 'read'), UserController.getDepartments);

/**
 * POST /users/:id/roles
 * Assigne un rôle à un utilisateur
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Body:
 * {
 *   "role_id": 2
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Rôle assigné avec succès"
 * }
 */
router.post('/:id/roles', requireRole(['ADMIN']), UserController.assignRole);

/**
 * DELETE /users/:id/roles/:roleId
 * Retire un rôle d'un utilisateur
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Rôle retiré avec succès"
 * }
 */
router.delete('/:id/roles/:roleId', requireRole(['ADMIN']), UserController.removeRole);

export default router;

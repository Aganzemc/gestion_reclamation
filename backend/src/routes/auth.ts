import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// =====================================================
// Routes d'authentification
// =====================================================

/**
 * POST /auth/login
 * Authentifie un utilisateur et retourne un token JWT
 * 
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "MotDePasse123!"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "user": {
 *       "id": 1,
 *       "email": "user@example.com",
 *       "first_name": "John",
 *       "last_name": "Doe",
 *       "roles": ["ADMIN"],
 *       "departments": ["Informatique"]
 *     },
 *     "expires_in": 900
 *   },
 *   "message": "Connexion réussie"
 * }
 */
router.post('/login', AuthController.login);

/**
 * POST /auth/logout
 * Déconnecte un utilisateur en révoquant son refresh token
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Body:
 * {
 *   "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Déconnexion réussie"
 * }
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * POST /auth/refresh
 * Rafraîchit un access token avec un refresh token
 * 
 * Body:
 * {
 *   "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "expires_in": 900
 *   },
 *   "message": "Token rafraîchi avec succès"
 * }
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * GET /auth/me
 * Récupère les informations de l'utilisateur connecté
 * 
 * Headers:
 * Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user_id": 1,
 *     "email": "user@example.com",
 *     "roles": ["ADMIN"]
 *   },
 *   "message": "Informations utilisateur récupérées"
 * }
 */
router.get('/me', authenticateToken, AuthController.getCurrentUser);

/**
 * POST /auth/validate
 * Valide un token JWT (pour tests et vérifications)
 * 
 * Body:
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "valid": true,
 *     "user_id": 1,
 *     "email": "user@example.com",
 *     "roles": ["ADMIN"],
 *     "exp": 1640995200
 *   },
 *   "message": "Token valide"
 * }
 */
router.post('/validate', AuthController.validateToken);

export default router;

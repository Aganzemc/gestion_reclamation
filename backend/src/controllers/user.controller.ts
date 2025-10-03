// controllers/userController.ts
import { Request, Response } from 'express';
import {prisma} from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { authService } from '../services/authServices';

export const userController = {
  // Créer un utilisateur
  async createUser(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: role || 'USER'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true
        }
      });
      
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors de la création' });
    }
  },

  // Obtenir tous les utilisateurs
  async getUsers(_req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          assignedTickets: true,
          tickets: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Obtenir un utilisateur par ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          assignedTickets: {
            include: {
              ticket: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  status: true,
                  priority: true,
                  createdAt: true
                }
              }
            }
          },
          tickets: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              createdAt: true
            }
          }
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Mettre à jour un utilisateur
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { firstName, lastName, role, status } = req.body;
      
      const user = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          role,
          status
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          updatedAt: true
        }
      });
      
      return res.json(user);
    } catch (error) {
      return res.status(400).json({ error: 'Erreur de mise à jour' });
    }
  },

  // Supprimer (désactiver) un utilisateur
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.update({
        where: { id },
        data: { status: 'INACTIVE' },
        select: {
          id: true,
          email: true,
          status: true
        }
      });
      
      res.json({ message: 'Utilisateur désactivé', user });
    } catch (error) {
      res.status(400).json({ error: 'Erreur de suppression' });
    }
  },

  async updateUserPassword(req: Request, res: Response) {
    try {
      // 1. Validation des données d'entrée
      const { currentPassword, newPassword, userId } = req.body;

      if (!currentPassword || !newPassword || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont requis: currentPassword, newPassword, userId'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
        });
      }

      // 2. Récupération de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: 'Cet utilisateur n\'a pas de mot de passe défini'
        });
      }

      // 3. Vérification du mot de passe actuel
      const isPasswordValid = authService.verifyPassword(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }

      // 4. Vérification que le nouveau mot de passe est différent de l'ancien
      const isSamePassword = await authService.verifyPassword(newPassword, user.password);
      
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: 'Le nouveau mot de passe doit être différent de l\'actuel'
        });
      }

      // 5. Hash du nouveau mot de passe
      const hashedNewPassword = await authService.hashPassword(newPassword);

      // 6. Mise à jour du mot de passe dans la base de données
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedNewPassword,
          updatedAt: new Date() 
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
          // On exclut le mot de passe de la réponse
        }
      });

      // 7. Réponse de succès
      return res.status(200).json({
        success: true,
        message: 'Mot de passe mis à jour avec succès',
        user: updatedUser
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }


  }

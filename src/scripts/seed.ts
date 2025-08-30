import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'gestion_reclamation',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Données de test
const testUsers = [
  {
    email: 'admin@example.com',
    password: 'Admin123!',
    nom: 'Administrateur',
    prenom: 'Système',
    telephone: '+1234567890',
    status: 'ACTIVE' as const,
    roles: ['ADMIN'],
    departments: ['IT']
  },
  {
    email: 'qa1@example.com',
    password: 'Qa123!',
    nom: 'Dupont',
    prenom: 'Marie',
    telephone: '+1234567891',
    status: 'ACTIVE' as const,
    roles: ['QA'],
    departments: ['Qualité']
  },
  {
    email: 'qa2@example.com',
    password: 'Qa123!',
    nom: 'Martin',
    prenom: 'Pierre',
    telephone: '+1234567892',
    status: 'ACTIVE' as const,
    roles: ['QA'],
    departments: ['Qualité']
  },
  {
    email: 'sto1@example.com',
    password: 'Sto123!',
    nom: 'Bernard',
    prenom: 'Sophie',
    telephone: '+1234567893',
    status: 'ACTIVE' as const,
    roles: ['STO'],
    departments: ['Support']
  },
  {
    email: 'sto2@example.com',
    password: 'Sto123!',
    nom: 'Petit',
    prenom: 'Jean',
    telephone: '+1234567894',
    status: 'ACTIVE' as const,
    roles: ['STO'],
    departments: ['Support']
  },
  {
    email: 'viewer1@example.com',
    password: 'Viewer123!',
    nom: 'Roux',
    prenom: 'Claire',
    telephone: '+1234567895',
    status: 'ACTIVE' as const,
    roles: ['VIEWER'],
    departments: ['Marketing']
  },
  {
    email: 'viewer2@example.com',
    password: 'Viewer123!',
    nom: 'Leroy',
    prenom: 'Thomas',
    telephone: '+1234567896',
    status: 'ACTIVE' as const,
    roles: ['VIEWER'],
    departments: ['Marketing']
  }
];

const testTickets = [
  {
    titre: 'Problème de connexion à la base de données',
    description: 'Les utilisateurs ne peuvent pas se connecter à la base de données depuis hier matin.',
    type: 'BUG' as const,
    priorite: 'HAUTE' as const,
    statut: 'EN_COURS' as const,
    createur_email: 'qa1@example.com',
    assigne_email: 'sto1@example.com',
    department: 'IT'
  },
  {
    titre: 'Interface utilisateur non responsive',
    description: 'Le tableau de bord ne s\'affiche pas correctement sur mobile.',
    type: 'AMELIORATION' as const,
    priorite: 'MOYENNE' as const,
    statut: 'OUVERT' as const,
    createur_email: 'viewer1@example.com',
    assigne_email: 'qa1@example.com',
    department: 'Qualité'
  },
  {
    titre: 'Documentation manquante',
    description: 'Il manque la documentation pour l\'API de gestion des tickets.',
    type: 'TACHE' as const,
    priorite: 'BASSE' as const,
    statut: 'OUVERT' as const,
    createur_email: 'admin@example.com',
    assigne_email: 'qa2@example.com',
    department: 'IT'
  },
  {
    titre: 'Performance lente sur les rapports',
    description: 'La génération des rapports prend plus de 30 secondes.',
    type: 'BUG' as const,
    priorite: 'HAUTE' as const,
    statut: 'EN_COURS' as const,
    createur_email: 'sto2@example.com',
    assigne_email: 'sto1@example.com',
    department: 'Support'
  }
];

const testComments = [
  {
    ticket_id: 1,
    createur_email: 'sto1@example.com',
    contenu: 'J\'ai identifié le problème. Il s\'agit d\'un timeout de connexion.',
    statut: 'ACTIF' as const
  },
  {
    ticket_id: 1,
    createur_email: 'qa1@example.com',
    contenu: 'Merci pour l\'information. Quand pensez-vous pouvoir le résoudre ?',
    statut: 'ACTIF' as const
  },
  {
    ticket_id: 2,
    createur_email: 'qa1@example.com',
    contenu: 'Je vais tester sur différents appareils mobiles.',
    statut: 'ACTIF' as const
  },
  {
    ticket_id: 3,
    createur_email: 'qa2@example.com',
    contenu: 'Je commence la rédaction de la documentation.',
    statut: 'ACTIF' as const
  }
];

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    logger.info('Début du seeding de la base de données...');
    
    // Commencer une transaction
    await client.query('BEGIN');
    
    // Vérifier que les rôles et départements existent
    const rolesResult = await client.query('SELECT code FROM roles');
    const departmentsResult = await client.query('SELECT nom FROM departments');
    
    if (rolesResult.rows.length === 0) {
      throw new Error('Les rôles doivent être créés avant le seeding des utilisateurs');
    }
    
    if (departmentsResult.rows.length === 0) {
      throw new Error('Les départements doivent être créés avant le seeding des utilisateurs');
    }
    
    // Créer les utilisateurs de test
    logger.info('Création des utilisateurs de test...');
    
    for (const userData of testUsers) {
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Insérer l'utilisateur
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, nom, prenom, telephone, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
        [userData.email, hashedPassword, userData.nom, userData.prenom, userData.telephone, userData.status]
      );
      
      const userId = userResult.rows[0].id;
      
      // Assigner les rôles
      for (const roleCode of userData.roles) {
        const roleResult = await client.query(
          'SELECT id FROM roles WHERE code = $1',
          [roleCode]
        );
        
        if (roleResult.rows.length > 0) {
          await client.query(
            `INSERT INTO user_roles (user_id, role_id, created_at)
             VALUES ($1, $2, NOW())`,
            [userId, roleResult.rows[0].id]
          );
        }
      }
      
      // Assigner les départements
      for (const deptName of userData.departments) {
        const deptResult = await client.query(
          'SELECT id FROM departments WHERE nom = $1',
          [deptName]
        );
        
        if (deptResult.rows.length > 0) {
          await client.query(
            `INSERT INTO user_departments (user_id, department_id, created_at)
             VALUES ($1, $2, NOW())`,
            [userId, deptResult.rows[0].id]
          );
        }
      }
      
      logger.info(`Utilisateur créé: ${userData.email}`);
    }
    
    // Créer les tickets de test
    logger.info('Création des tickets de test...');
    
    for (const ticketData of testTickets) {
      // Récupérer l'ID du créateur
      const createurResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [ticketData.createur_email]
      );
      
      if (createurResult.rows.length === 0) {
        logger.warn(`Créateur non trouvé: ${ticketData.createur_email}`);
        continue;
      }
      
      const createurId = createurResult.rows[0].id;
      
      // Récupérer l'ID de l'assigné
      let assigneId = null;
      if (ticketData.assigne_email) {
        const assigneResult = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [ticketData.assigne_email]
        );
        
        if (assigneResult.rows.length > 0) {
          assigneId = assigneResult.rows[0].id;
        }
      }
      
      // Récupérer l'ID du département
      const deptResult = await client.query(
        'SELECT id FROM departments WHERE nom = $1',
        [ticketData.department]
      );
      
      if (deptResult.rows.length === 0) {
        logger.warn(`Département non trouvé: ${ticketData.department}`);
        continue;
      }
      
      const deptId = deptResult.rows[0].id;
      
      // Insérer le ticket
      const ticketResult = await client.query(
        `INSERT INTO tickets (titre, description, type, priorite, statut, createur_id, assigne_id, department_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id`,
        [ticketData.titre, ticketData.description, ticketData.type, ticketData.priorite, ticketData.statut, createurId, assigneId, deptId]
      );
      
      const ticketId = ticketResult.rows[0].id;
      
      // Créer l'assignation du ticket
      if (assigneId) {
        await client.query(
          `INSERT INTO ticket_assignments (ticket_id, user_id, assigned_at, created_at)
           VALUES ($1, $2, NOW(), NOW())`,
          [ticketId, assigneId]
        );
      }
      
      logger.info(`Ticket créé: ${ticketData.titre}`);
    }
    
    // Créer les commentaires de test
    logger.info('Création des commentaires de test...');
    
    for (const commentData of testComments) {
      // Récupérer l'ID du créateur
      const createurResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [commentData.createur_email]
      );
      
      if (createurResult.rows.length === 0) {
        logger.warn(`Créateur de commentaire non trouvé: ${commentData.createur_email}`);
        continue;
      }
      
      const createurId = createurResult.rows[0].id;
      
      // Insérer le commentaire
      await client.query(
        `INSERT INTO comments (ticket_id, createur_id, contenu, statut, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [commentData.ticket_id, createurId, commentData.contenu, commentData.statut]
      );
      
      logger.info(`Commentaire créé pour le ticket ${commentData.ticket_id}`);
    }
    
    // Valider la transaction
    await client.query('COMMIT');
    
    logger.info('Seeding de la base de données terminé avec succès !');
    
    // Afficher un résumé
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const ticketCount = await client.query('SELECT COUNT(*) FROM tickets');
    const commentCount = await client.query('SELECT COUNT(*) FROM comments');
    
    logger.info(`Résumé du seeding:`);
    logger.info(`- Utilisateurs: ${userCount.rows[0].count}`);
    logger.info(`- Tickets: ${ticketCount.rows[0].count}`);
    logger.info(`- Commentaires: ${commentCount.rows[0].count}`);
    
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await client.query('ROLLBACK');
    logger.error('Erreur lors du seeding:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function cleanupTestData() {
  const client = await pool.connect();
  
  try {
    logger.info('Nettoyage des données de test...');
    
    await client.query('BEGIN');
    
    // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
    await client.query('DELETE FROM comments');
    await client.query('DELETE FROM ticket_assignments');
    await client.query('DELETE FROM tickets');
    await client.query('DELETE FROM user_departments');
    await client.query('DELETE FROM user_roles');
    await client.query('DELETE FROM users WHERE email LIKE \'%@example.com\'');
    
    await client.query('COMMIT');
    
    logger.info('Nettoyage des données de test terminé !');
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Erreur lors du nettoyage:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Fonction principale
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'seed':
        await seedDatabase();
        break;
      case 'cleanup':
        await cleanupTestData();
        break;
      default:
        logger.info('Usage: npm run db:seed [seed|cleanup]');
        logger.info('  seed: Créer les données de test');
        logger.info('  cleanup: Supprimer les données de test');
        break;
    }
  } catch (error) {
    logger.error('Erreur fatale:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

export { seedDatabase, cleanupTestData };

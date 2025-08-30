import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import logger from '../utils/logger';

// Pool de connexions PostgreSQL
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl,
  
  // Configuration du pool
  max: 20, // Nombre maximum de connexions
  min: 4,  // Nombre minimum de connexions
  idle: 10000, // Temps d'inactivité avant fermeture (10s)
  connectionTimeoutMillis: 2000, // Timeout de connexion (2s)
  idleTimeoutMillis: 30000, // Timeout d'inactivité (30s)
  
  // Configuration des requêtes
  statement_timeout: 30000, // Timeout des requêtes (30s)
  query_timeout: 30000, // Timeout des requêtes (30s)
});

// Gestion des événements du pool
pool.on('connect', (client: PoolClient) => {
  logger.debug('Nouvelle connexion à la base de données établie');
});

pool.on('error', (err: Error, client: PoolClient) => {
  logger.error('Erreur inattendue du client de base de données:', err);
});

pool.on('remove', (client: PoolClient) => {
  logger.debug('Client de base de données supprimé du pool');
});

// Test de connexion
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('✅ Connexion à la base de données réussie');
    return true;
  } catch (error) {
    logger.error('❌ Échec de la connexion à la base de données:', error);
    return false;
  }
}

// Fonction utilitaire pour exécuter des requêtes avec gestion automatique des connexions
export async function query<T = any>(
  text: string, 
  params?: any[]
): Promise<T[]> {
  const start = Date.now();
  
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Requête exécutée', {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: result.rowCount
      });
      
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Erreur lors de l\'exécution de la requête', {
      text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

// Fonction utilitaire pour exécuter une seule requête (INSERT, UPDATE, DELETE)
export async function queryOne<T = any>(
  text: string, 
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows.length > 0 ? rows[0] : null;
}

// Fonction utilitaire pour exécuter des transactions
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Fonction pour fermer le pool (à utiliser lors de l'arrêt de l'application)
export async function closePool(): Promise<void> {
  logger.info('Fermeture du pool de connexions à la base de données...');
  await pool.end();
  logger.info('Pool de connexions fermé');
}

// Export du pool pour les cas d'usage avancés
export { pool };

// Export par défaut
export default {
  query,
  queryOne,
  transaction,
  testConnection,
  closePool,
  pool
};

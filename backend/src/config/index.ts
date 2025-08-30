import dotenv from 'dotenv';
import { AppConfig } from '../types';

// Charger les variables d'environnement
dotenv.config();

// Configuration de l'application
export const config: AppConfig = {
  port: parseInt(process.env['PORT'] || '3001'),
  node_env: process.env['NODE_ENV'] || 'development',
  
  database: {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    database: process.env['DB_NAME'] || 'gestion_reclamation',
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '',
    ssl: process.env['NODE_ENV'] === 'production'
  },
  
  jwt: {
    secret: process.env['JWT_SECRET'] || 'default_jwt_secret_change_in_production',
    refresh_secret: process.env['JWT_REFRESH_SECRET'] || 'default_refresh_secret_change_in_production',
    expires_in: process.env['JWT_EXPIRES_IN'] || '15m',
    refresh_expires_in: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d'
  },
  
  bcrypt_rounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12'),
  
  rate_limit: {
    window_ms: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
    max_requests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100')
  }
};

// Validation de la configuration
export function validateConfig(): void {
  const requiredEnvVars = [
    'DB_HOST',
    'DB_NAME', 
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
  }

  if (config.jwt.secret === 'default_jwt_secret_change_in_production') {
    console.warn('⚠️  ATTENTION: JWT_SECRET utilise la valeur par défaut. Changez-la en production !');
  }

  if (config.jwt.refresh_secret === 'default_refresh_secret_change_in_production') {
    console.warn('⚠️  ATTENTION: JWT_REFRESH_SECRET utilise la valeur par défaut. Changez-la en production !');
  }
}

// Configuration pour différents environnements
export const isDevelopment = config.node_env === 'development';
export const isProduction = config.node_env === 'production';
export const isTest = config.node_env === 'test';

// Configuration CORS
export const corsOptions = {
  origin: isDevelopment 
    ? ['http://localhost:3000', 'http://localhost:5173'] // Frontend dev
    : process.env['FRONTEND_URL'] ? [process.env['FRONTEND_URL']] : [],
  credentials: true,
  optionsSuccessStatus: 200
};

// Configuration des logs
export const logConfig = {
  level: isDevelopment ? 'debug' : 'info',
  format: isDevelopment ? 'dev' : 'combined'
};

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config, validateConfig, corsOptions } from './config';
import { testConnection, closePool } from './database/connection';
import logger, { logRequest } from './utils/logger';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';

// Validation de la configuration
validateConfig();

// Création de l'application Express
const app = express();

// =====================================================
// Middleware de sécurité
// =====================================================

// Helmet pour la sécurité des en-têtes HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors(corsOptions));

// Limitation de taux (rate limiting)
const limiter = rateLimit({
  windowMs: config.rate_limit.window_ms,
  max: config.rate_limit.max_requests,
  message: {
    success: false,
    error: 'Trop de requêtes, veuillez réessayer plus tard',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Ne pas limiter les routes d'authentification
    return req.path.startsWith('/auth/login') || req.path.startsWith('/auth/refresh');
  }
});
app.use(limiter);

// =====================================================
// Middleware de parsing et logging
// =====================================================

// Parser JSON avec limite de taille
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging des requêtes HTTP
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    }
  }
}));

// Middleware de logging personnalisé
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logRequest(req, res, duration);
  });
  
  next();
});

// =====================================================
// Middleware de gestion des erreurs globales
// =====================================================

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
});

// Gestionnaire d'erreurs global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erreur non gérée:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  // Ne pas exposer les détails de l'erreur en production
  const isDevelopment = config.node_env === 'development';
  
  res.status(500).json({
    success: false,
    error: isDevelopment ? error.message : 'Erreur interne du serveur',
    code: 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: error.stack })
  });
});

// =====================================================
// Routes de l'API
// =====================================================

// Route de santé (health check)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de gestion des réclamations opérationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.node_env
  });
});

// Routes d'authentification
app.use('/auth', authRoutes);

// Routes des utilisateurs
app.use('/users', userRoutes);

// =====================================================
// Démarrage du serveur
// =====================================================

async function startServer() {
  try {
    // Tester la connexion à la base de données
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Impossible de se connecter à la base de données. Arrêt du serveur.');
      process.exit(1);
    }
    
    // Démarrer le serveur
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Serveur démarré sur le port ${config.port}`);
      logger.info(`📊 Environnement: ${config.node_env}`);
      logger.info(`🔗 URL: http://localhost:${config.port}`);
      logger.info(`📚 Documentation API: http://localhost:${config.port}/docs`);
    });
    
    // Gestion gracieuse de l'arrêt
    const gracefulShutdown = async (signal: string) => {
      logger.info(`📴 Signal ${signal} reçu. Arrêt gracieux du serveur...`);
      
      server.close(async () => {
        logger.info('🔒 Serveur HTTP fermé');
        
        try {
          await closePool();
          logger.info('🗄️  Connexions à la base de données fermées');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Erreur lors de la fermeture des connexions DB:', error);
          process.exit(1);
        }
      });
      
      // Forcer l'arrêt si le serveur ne se ferme pas dans les 30 secondes
      setTimeout(() => {
        logger.error('⏰ Arrêt forcé du serveur');
        process.exit(1);
      }, 30000);
    };
    
    // Écouter les signaux d'arrêt
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Gestion des erreurs non capturées
    process.on('uncaughtException', (error) => {
      logger.error('❌ Exception non capturée:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Rejet de promesse non géré:', reason);
      gracefulShutdown('unhandledRejection');
    });
    
  } catch (error) {
    logger.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Démarrer le serveur
startServer();

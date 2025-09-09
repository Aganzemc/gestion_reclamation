import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { testConnection, closePool } from "./lib/prisma";
import logger, { logRequest } from './utils/logger';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import notificationRoutes from './routes/notificationRoutes';
import ticketRoutes from './routes/ticketRoutes';
import assignmentRoutes from './routes/assignmentRoutes';

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

// Définir les options CORS
const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173"], // liste des domaines autorisés (ex: ton frontend React/Next.js)
  methods: ["GET", "POST", "PUT", "DELETE"], // méthodes autorisées
  allowedHeaders: ["Content-Type", "Authorization"], // headers autorisés
  credentials: true, // autorise cookies / authentification
};

// CORS
app.use(cors(corsOptions));

// // Limitation de taux (rate limiting)
// const limiter = rateLimit({
//   windowMs: config.rate_limit.window_ms,
//   max: config.rate_limit.max_requests,
//   message: {
//     success: false,
//     error: 'Trop de requêtes, veuillez réessayer plus tard',
//     code: 'RATE_LIMIT_EXCEEDED'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
//   skip: (req) => {
//     // Ne pas limiter les routes d'authentification
//     return req.path.startsWith('/auth/login') || req.path.startsWith('/auth/refresh');
//   }
// });
// app.use(limiter);

// =====================================================
// Middleware de parsing et logging
// =====================================================

// Parser JSON avec limite de taille
app.use(express.json());
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("🚀 API avec CORS activé !");
// });

// Logging des requêtes HTTP
app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    }
  }
}));

// =====================================================
// Routes de l'API
// =====================================================

// Route de santé (health check)
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de gestion des réclamations opérationnelle',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env["NODE_ENV"] || 'development'
  });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes des utilisateurs
app.use('/api/users', userRoutes);
// app.get('/users', async (req, res) => {
//   try {
//     const users = await prisma.user.findMany({
//       orderBy: { createdAt: 'desc' }
//     });
//     res.json(users);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Erreur serveur' });
//   }
// });

// Routes des notifications
app.use('/api/notifications', notificationRoutes);

// Routes des tickets
app.use('/api/tickets', ticketRoutes);

// Routes des assignations
app.use('/api/assignments', assignmentRoutes);

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
app.use((error: any, req: express.Request, _res: express.Response, _next: express.NextFunction) => {
  logger.error('Erreur non gérée:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Ne pas exposer les détails de l'erreur en production
  // const isDevelopment = config.node_env === 'development';

  // res.status(500).json({
  //   success: false,
  //   error: isDevelopment ? error.message : 'Erreur interne du serveur',
  //   code: 'INTERNAL_ERROR',
  //   ...(isDevelopment && { stack: error.stack })
  // });
});

// =====================================================
// Démarrage du serveur
// =====================================================

async function startServer() {
  try {
    // Tester la connexion
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error("Impossible de se connecter à la base de données. Arrêt du serveur.");
      process.exit(1);
    }

    const server = app.listen(4000, () => {
      logger.info(`🚀 Serveur démarré sur le port 4000`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`📴 Signal ${signal} reçu. Arrêt gracieux du serveur...`);

      server.close(async () => {
        try {
          await closePool();
          process.exit(0);
        } catch (error) {
          logger.error("❌ Erreur lors de la fermeture Prisma:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("❌ Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
}

// Démarrer le serveur
startServer();

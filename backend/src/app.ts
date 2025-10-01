import express from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import notificationRoutes from './routes/notificationRoutes';
import ticketRoutes from './routes/ticketRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import dotenv from "dotenv";

dotenv.config();

// Création de l'application Express
const app = express();

// =====================================================
// Middleware de sécurité
// =====================================================
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
  origin: [
    "http://localhost:5173",
    "https://www.aserdinanga.com",
    "http://gestion-reclamation.vercel.app",
    "https://tonfrontend.hostinger.com",
    "https://gestion-reclamation.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// CORS
app.use(cors(corsOptions));

// =====================================================
// Middleware parsing et logging
// =====================================================
app.use(express.json());

app.use(morgan('combined', {
  stream: {
    write: (message: string) => {
      console.info(message.trim());
    }
  }
}));
    
// =====================================================
// Routes
// =====================================================

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hello World !!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env["NODE_ENV"] || 'development'
  });
});

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
   
// Routes principales
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/assignments', assignmentRoutes);

// Middleware logging custom
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.info(req, res, duration);
  });

  next();
});

// =====================================================
// Gestion des erreurs globales
// =====================================================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
});

// Gestionnaire d'erreurs global
app.use((error: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.info('Erreur non gérée:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(500).json({
    success: false,
    error: process.env["NODE_ENV"] === "development" ? error.message : 'Erreur interne du serveur',
    code: 'INTERNAL_ERROR'
  });
});

export default app
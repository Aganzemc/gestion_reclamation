// Configuration de l'application

export const config = {
  // Configuration du serveur
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuration de la base de données
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'gestion_reclamation',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  },
  
  // Configuration JWT
  jwtSecret: process.env.JWT_SECRET || 'votre_secret_tres_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'votre_refresh_secret_tres_secret',
  jwtExpiresIn: '1h',
  jwtRefreshExpiresIn: '7d',
  
  // Configuration des emails (à compléter avec votre fournisseur d'email)
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'no-reply@votredomaine.com',
  },
  
  // Configuration des URLs de l'application
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Configuration des limites de taux (rate limiting)
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par fenêtre
  },
  
  // Configuration des logs
  logs: {
    level: process.env.LOG_LEVEL || 'debug',
    file: process.env.LOG_FILE || 'logs/combined.log',
    errorFile: process.env.ERROR_LOG_FILE || 'logs/error.log',
    maxSize: '20m',
    maxFiles: '14d',
  },
  
  // Configuration du CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  
  // Configuration des uploads
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },
  
  // Configuration des exports
  exports: {
    dir: process.env.EXPORTS_DIR || 'exports',
    maxRows: 10000, // Nombre maximum de lignes pour l'export
  },
  
  // Configuration des notifications
  notifications: {
    dueDateReminderDays: [1, 3, 7], // Jours avant l'échéance pour les rappels
  },
};

export default config;

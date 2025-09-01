/**
 * Classe d'erreur personnalisée pour la gestion des erreurs de l'application
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  /**
   * Crée une nouvelle instance d'AppError
   * @param message Message d'erreur lisible par l'utilisateur
   * @param statusCode Code HTTP de l'erreur (par défaut: 500)
   * @param code Code d'erreur personnalisé pour une meilleure identification
   * @param isOperational Indique si l'erreur est opérationnelle (true) ou un bug (false)
   */
  constructor(
    message: string, 
    statusCode: number = 500, 
    code?: string, 
    isOperational: boolean = true
  ) {
    super(message);

    // Définition du prototype explicitement pour l'héritage
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Capture de la stack trace, en ignorant le constructeur dans la trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Enregistrement de l'erreur dans la console en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.error(this);
    }
  }

  /**
   * Crée une erreur de validation
   * @param message Message d'erreur
   * @param code Code d'erreur personnalisé
   * @returns Une instance d'AppError avec le statut 400
   */
  static validationError(message: string, code?: string): AppError {
    return new AppError(message, 400, code || 'VALIDATION_ERROR');
  }

  /**
   * Crée une erreur d'authentification
   * @param message Message d'erreur
   * @param code Code d'erreur personnalisé
   * @returns Une instance d'AppError avec le statut 401
   */
  static authenticationError(message: string = 'Non authentifié', code?: string): AppError {
    return new AppError(message, 401, code || 'AUTHENTICATION_ERROR');
  }

  /**
   * Crée une erreur d'autorisation
   * @param message Message d'erreur
   * @param code Code d'erreur personnalisé
   * @returns Une instance d'AppError avec le statut 403
   */
  static authorizationError(message: string = 'Non autorisé', code?: string): AppError {
    return new AppError(message, 403, code || 'AUTHORIZATION_ERROR');
  }

  /**
   * Crée une erreur de ressource non trouvée
   * @param resource Nom de la ressource non trouvée
   * @param code Code d'erreur personnalisé
   * @returns Une instance d'AppError avec le statut 404
   */
  static notFound(resource: string = 'Ressource', code?: string): AppError {
    return new AppError(
      `${resource} non trouvé` + (resource.endsWith('e') ? 'e' : ''),
      404,
      code || 'NOT_FOUND'
    );
  }

  /**
   * Crée une erreur de conflit (par exemple, doublon)
   * @param message Message d'erreur
   * @param code Code d'erreur personnalisé
   * @returns Une instance d'AppError avec le statut 409
   */
  static conflict(message: string, code?: string): AppError {
    return new AppError(message, 409, code || 'CONFLICT');
  }

  /**
   * Crée une erreur de validation de schéma
   * @param errors Tableau d'erreurs de validation
   * @returns Une instance d'AppError avec le statut 422
   */
  static validationErrors(errors: Record<string, string[]>): AppError {
    const error = new AppError(
      'Erreur de validation des données',
      422,
      'VALIDATION_ERRORS'
    );
    error.errors = errors;
    return error;
  }

  /**
   * Convertit l'erreur en objet JSON pour la réponse API
   */
  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      ...(this['errors'] && { errors: this['errors'] }), // Inclut les erreurs de validation si présentes
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }), // Stack uniquement en développement
    };
  }
}

// Extension de l'interface pour inclure la propriété 'errors' optionnelle
declare global {
  interface AppError {
    errors?: Record<string, string[]>;
  }
}

export default AppError;

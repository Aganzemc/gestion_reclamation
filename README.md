# Backend de Gestion des Réclamations Étudiant

Backend Node.js/Express avec TypeScript pour la gestion des réclamations et tickets étudiants, adapté au frontend React existant.

## 🚀 Fonctionnalités

- **Authentification JWT** avec tokens d'accès et de rafraîchissement
- **Gestion des utilisateurs** avec rôles (ADMIN, QA, STO, VIEWER)
- **Gestion des tickets** avec statuts, priorités et types
- **Système de commentaires** sur les tickets
- **Gestion des départements** et assignations
- **Contrôle d'accès basé sur les rôles** (RBAC)
- **Logging complet** avec Winston
- **Base de données PostgreSQL** avec migrations
- **API REST** documentée

## 🛠️ Technologies

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Base de données**: PostgreSQL 14+
- **Authentification**: JWT + bcryptjs
- **Logging**: Winston + Morgan
- **Validation**: express-validator
- **Sécurité**: Helmet, CORS, Rate Limiting

## 📋 Prérequis

- Node.js 18+ et npm
- PostgreSQL 14+
- Git

## 🔧 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd gestion-reclamation-etudiant/backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créer un fichier `.env` à la racine du backend :

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_reclamation
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_complexe
JWT_REFRESH_SECRET=votre_secret_refresh_jwt_tres_long_et_complexe
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Serveur
PORT=3001
NODE_ENV=development

# Sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Créer la base de données PostgreSQL

```sql
CREATE DATABASE gestion_reclamation;
```

### 5. Exécuter les migrations

```bash
npm run db:migrate
```

### 6. Peupler avec des données de test (optionnel)

```bash
npm run db:seed seed
```

## 🚀 Démarrage

### Mode développement

```bash
npm run dev
```

### Mode production

```bash
npm run build
npm start
```

## 📊 Structure de la base de données

### Tables principales

- **`users`** : Utilisateurs du système
- **`roles`** : Rôles (ADMIN, QA, STO, VIEWER)
- **`departments`** : Départements de l'établissement
- **`tickets`** : Réclamations et tickets
- **`comments`** : Commentaires sur les tickets
- **`audit_logs`** : Journal d'audit des actions
- **`refresh_tokens`** : Tokens de rafraîchissement

### Vues utiles

- **`users_with_roles`** : Utilisateurs avec leurs rôles et départements
- **`tickets_with_details`** : Tickets avec informations complètes

## 🔐 Authentification

### Connexion

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "nom": "Administrateur",
      "prenom": "Système",
      "roles": ["ADMIN"],
      "departments": ["IT"]
    }
  }
}
```

### Utilisation du token

```bash
GET /users
Authorization: Bearer <access_token>
```

## 👥 Gestion des utilisateurs

### Créer un utilisateur (ADMIN uniquement)

```bash
POST /users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "nouveau@example.com",
  "password": "MotDePasse123!",
  "nom": "Nouveau",
  "prenom": "Utilisateur",
  "telephone": "+1234567890",
  "roles": ["QA"],
  "departments": ["Qualité"]
}
```

### Lister les utilisateurs avec pagination

```bash
GET /users?page=1&limit=10&role=QA&department=Qualité
Authorization: Bearer <token>
```

## 🎫 Gestion des tickets

### Créer un ticket

```bash
POST /tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "titre": "Problème de connexion",
  "description": "Impossible de se connecter au système",
  "type": "BUG",
  "priorite": "HAUTE",
  "department_id": 1
}
```

### Assigner un ticket

```bash
POST /tickets/1/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 2
}
```

## 🔍 Rôles et permissions

### Hiérarchie des rôles

1. **ADMIN** : Accès complet à tous les modules
2. **QA** : Gestion des tickets et validation
3. **STO** : Support technique et résolution
4. **VIEWER** : Consultation et création de tickets

### Permissions par ressource

| Rôle | Users | Tickets | Comments | Analytics |
|------|-------|---------|----------|-----------|
| ADMIN | CRUD | CRUD | CRUD | Full |
| QA | R | CRUD | CRUD | Limited |
| STO | R | R/U | CRUD | Limited |
| VIEWER | R | C/R | C/R | Read-only |

## 📝 Logs et monitoring

### Types de logs

- **Application** : `logs/app.log`
- **Erreurs** : `logs/error.log`
- **HTTP** : `logs/http.log`
- **Audit** : `logs/audit.log`
- **Sécurité** : `logs/security.log`

### Exemple de log d'audit

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "user_id": 1,
  "action": "CREATE_USER",
  "resource": "users",
  "resource_id": 5,
  "details": "Création de l'utilisateur nouveau@example.com"
}
```

## 🧪 Tests

### Données de test

Le script de seeding crée automatiquement :

- **7 utilisateurs** avec différents rôles
- **4 tickets** de test avec différents statuts
- **4 commentaires** sur les tickets

### Nettoyer les données de test

```bash
npm run db:seed cleanup
```

## 🚨 Gestion des erreurs

### Codes d'erreur HTTP

- **400** : Requête invalide
- **401** : Non authentifié
- **403** : Accès interdit
- **404** : Ressource non trouvée
- **409** : Conflit (ex: email déjà utilisé)
- **500** : Erreur serveur interne

### Format des erreurs

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": ["Email requis", "Mot de passe requis"]
  }
}
```

## 🔒 Sécurité

### Mesures implémentées

- **Helmet** : En-têtes HTTP sécurisés
- **CORS** : Contrôle des origines
- **Rate Limiting** : Protection contre le spam
- **Validation** : Sanitisation des entrées
- **JWT** : Tokens sécurisés avec expiration
- **bcrypt** : Hachage des mots de passe

### Bonnes pratiques

- Changer les secrets JWT en production
- Utiliser HTTPS en production
- Limiter les tentatives de connexion
- Surveiller les logs de sécurité

## 📚 API Documentation

### Endpoints principaux

#### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/logout` - Déconnexion
- `POST /auth/refresh` - Rafraîchir le token
- `GET /auth/me` - Profil utilisateur actuel

#### Utilisateurs
- `POST /users` - Créer un utilisateur
- `GET /users` - Lister les utilisateurs
- `GET /users/:id` - Détails d'un utilisateur
- `PUT /users/:id` - Modifier un utilisateur
- `DELETE /users/:id` - Désactiver un utilisateur

#### Rôles et départements
- `GET /users/roles` - Liste des rôles
- `GET /users/departments` - Liste des départements
- `POST /users/:id/roles` - Assigner un rôle
- `DELETE /users/:id/roles/:roleId` - Retirer un rôle

### Pagination

```bash
GET /users?page=1&limit=20&sort=nom&order=asc
```

**Réponse paginée :**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

## 🚀 Déploiement

### Variables d'environnement de production

```env
NODE_ENV=production
PORT=3001
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-super-refresh-secret
```

### Build et démarrage

```bash
npm run build
npm start
```

### Avec PM2

```bash
npm install -g pm2
pm2 start dist/index.js --name "gestion-reclamation"
pm2 save
pm2 startup
```

## 🤝 Contribution

### Structure du projet

```
src/
├── config/          # Configuration
├── controllers/     # Contrôleurs HTTP
├── database/        # Connexion DB
├── middleware/      # Middleware Express
├── routes/          # Routes API
├── services/        # Logique métier
├── types/           # Types TypeScript
├── utils/           # Utilitaires
└── index.ts         # Point d'entrée
```

### Standards de code

- TypeScript strict mode
- ESLint + Prettier
- JSDoc pour la documentation
- Tests unitaires (à implémenter)

## 📞 Support

Pour toute question ou problème :

1. Vérifier les logs dans `logs/`
2. Consulter la documentation de l'API
3. Vérifier la configuration de la base de données
4. Contacter l'équipe de développement

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Note** : Ce backend est conçu pour fonctionner avec le frontend React existant. Assurez-vous que les URLs et les structures de données correspondent entre les deux applications.

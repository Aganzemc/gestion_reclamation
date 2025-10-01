<<<<<<< HEAD
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" 
      ? ["error", "warn"] 
      : ["query", "info", "warn", "error"],
    // Configuration spécifique pour Neon
    datasources: {
      db: {
        url: process.env.DATABASE_URL + "&connection_limit=1&pool_timeout=30"
      }
    }
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Fonction de test de connexion améliorée
export async function testConnection(): Promise<boolean> {
  try {
    // Utilisez une query simple qui fonctionne avec le pooling
    await prisma.$queryRaw`SELECT 1 AS connection_test`;
    console.info("✅ Connexion Neon réussie");
    return true;
  } catch (error) {
    console.error("❌ Échec de la connexion Neon:", error);
    
    // Tentative avec la connexion directe (non-pooled)
    try {
      const directPrisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL_UNPOOLED
          }
        }
      });
      await directPrisma.$queryRaw`SELECT 1`;
      await directPrisma.$disconnect();
      console.info("✅ Connexion directe (non-pooled) fonctionne");
      return true;
    } catch (directError) {
      console.error("❌ Échec de la connexion directe:", directError);
      return false;
    }
  }
}

// Gestion propre de la déconnexion
export async function closePool(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.info("✅ Pool Prisma fermé");
  } catch (error) {
    console.error("❌ Erreur lors de la fermeture du pool:", error);
  }
}
=======
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Eviter le redeclare dans hot reload
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // logs utiles
  });

if (process.env["NODE_ENV"] !== "production") {
  global.prisma = prisma;
}

// 🔎 Tester la connexion
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.info("✅ Connexion à la base de données réussie");
    return true;
  } catch (error) {
    console.error("❌ Échec de la connexion à la base de données:", error);
    return false;
  }
}

// 📴 Fermer Prisma proprement
export async function closePool(): Promise<void> {
  console.info("Fermeture de Prisma...");
  await prisma.$disconnect();
  console.info("✅ Prisma déconnecté");
}
>>>>>>> ccbf412 (update backend)

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "finance.db");

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

declare global {
  // eslint-disable-next-line no-var
  var __sqlite: Database.Database | undefined;
}

const sqlite = global.__sqlite ?? new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

if (process.env.NODE_ENV !== "production") {
  global.__sqlite = sqlite;
}

// Run migrations automatically on startup
function runMigrations() {
  const migrationPath = path.join(process.cwd(), "drizzle");
  if (fs.existsSync(migrationPath)) {
    const migrationFiles = fs.readdirSync(migrationPath)
      .filter(f => f.endsWith('.sql') && f !== '_journal.json')
      .sort();
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationPath, file);
      const migrationSql = fs.readFileSync(filePath, 'utf-8');
      
      // Split by statement-breakpoint and execute each statement
      const statements = migrationSql.split('--> statement-breakpoint');
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed) {
          try {
            sqlite.exec(trimmed);
          } catch (error) {
            // Ignore errors for tables/indexes that already exist
            const errorMsg = (error as Error).message;
            if (!errorMsg.includes('already exists') && !errorMsg.includes('duplicate column')) {
              console.error(`Migration error in ${file}:`, error);
              throw error;
            }
          }
        }
      }
    }
  }
}

runMigrations();

// Auto-seed database if empty (development only)
async function autoSeed() {
  if (process.env.NODE_ENV === "production") return;
  
  try {
    const userCount = sqlite.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    if (userCount.count === 0) {
      console.log("Database is empty. Running seed...");
      // Import and run seed dynamically to avoid circular dependencies
      const { seed } = await import("./seed");
      await seed();
    }
  } catch (error) {
    // Ignore seeding errors - tables might not exist yet
    console.debug("Auto-seed skipped:", error);
  }
}

// Run seeding asynchronously without blocking startup
if (process.env.NODE_ENV !== "production") {
  autoSeed().catch(console.error);
}

export const db = drizzle(sqlite, { schema });
export { sqlite };

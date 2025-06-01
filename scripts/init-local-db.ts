import { runLocalMigrations } from "../src/lib/database-local";

console.log("Initializing local SQLite database...");

try {
  runLocalMigrations();
  console.log("✅ Local database initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize local database:", error);
  process.exit(1);
}
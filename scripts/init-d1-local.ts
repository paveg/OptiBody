#!/usr/bin/env tsx
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// D1 schema SQL for local development
const schemaSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User metrics table
CREATE TABLE IF NOT EXISTS user_metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  height REAL,
  weight REAL,
  age INTEGER,
  gender TEXT,
  activity_level TEXT,
  body_fat_percentage REAL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
`;

// Create temporary SQL file
const sqlFilePath = path.join(process.cwd(), "temp-init.sql");
fs.writeFileSync(sqlFilePath, schemaSQL);

try {
  console.log("🚀 Initializing local D1 database...");
  
  // Execute SQL using wrangler d1 execute
  execSync(
    `wrangler d1 execute DB --local --file ${sqlFilePath}`,
    { stdio: "inherit" }
  );
  
  console.log("✅ Local D1 database initialized successfully!");
  
  // Verify tables were created
  const result = execSync(
    `wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table';" --json`,
    { encoding: "utf-8" }
  );
  
  const tables = JSON.parse(result);
  console.log("📋 Created tables:", tables[0]?.results?.map((r: any) => r.name).join(", ") || "None");
  
  // Clean up temp file
  fs.unlinkSync(sqlFilePath);
} catch (error) {
  console.error("❌ Failed to initialize local D1 database:", error);
  // Clean up temp file on error
  if (fs.existsSync(sqlFilePath)) {
    fs.unlinkSync(sqlFilePath);
  }
  process.exit(1);
}
#!/usr/bin/env tsx
import { execSync } from "child_process";

// スキーマSQL
const schemaSQL = `
-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  hashed_password TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- セッションテーブル
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ユーザーメトリクステーブル
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

-- インデックス
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
`;

const databases = [
  { name: "optibody-db-prod", id: "e44df8df-b756-45e0-a499-bc4784b41bcd" },
  { name: "optibody-db-preview", id: "082869c0-603e-4952-b14d-2bc479e07c3c" }
];

async function initDatabase(dbName: string, dbId: string) {
  console.log(`\n🚀 Initializing ${dbName}...`);
  
  try {
    // SQLを直接実行
    execSync(
      `echo "${schemaSQL}" | wrangler d1 execute ${dbName} --database-id=${dbId}`,
      { stdio: "inherit", shell: true }
    );
    
    console.log(`✅ ${dbName} initialized successfully!`);
  } catch (error) {
    console.error(`❌ Failed to initialize ${dbName}:`, error);
  }
}

async function main() {
  for (const db of databases) {
    await initDatabase(db.name, db.id);
  }
}

main();
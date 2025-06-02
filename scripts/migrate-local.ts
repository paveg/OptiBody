#!/usr/bin/env tsx
import { execSync } from "child_process";
import { readdir } from "fs/promises";
import { join } from "path";

async function migrateLocal() {
  try {
    console.log("🚀 Applying migrations to local D1 database...");
    
    // drizzleディレクトリのSQLファイルを取得
    const drizzlePath = join(process.cwd(), "drizzle");
    
    try {
      const files = await readdir(drizzlePath);
      const sqlFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort(); // ファイル名順でソート
      
      if (sqlFiles.length === 0) {
        console.log("⚠️  No migration files found. Run 'pnpm db:generate' first.");
        return;
      }
      
      console.log(`📝 Found ${sqlFiles.length} migration file(s):`);
      sqlFiles.forEach(file => console.log(`  - ${file}`));
      
      // 各マイグレーションファイルを順番に実行
      for (const file of sqlFiles) {
        const filePath = join(drizzlePath, file);
        console.log(`\n🔄 Applying migration: ${file}`);
        
        try {
          execSync(
            `wrangler d1 execute DB --local --file "${filePath}"`,
            { stdio: "inherit" }
          );
          console.log(`✅ Applied: ${file}`);
        } catch (error) {
          console.error(`❌ Failed to apply ${file}:`, error);
          throw error;
        }
      }
      
      console.log("\n🎉 All migrations applied successfully!");
      
      // テーブル一覧を表示
      console.log("\n📋 Current tables:");
      const result = execSync(
        `wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table';" --json`,
        { encoding: "utf-8" }
      );
      
      const tables = JSON.parse(result);
      if (tables[0]?.results) {
        tables[0].results.forEach((table: any) => {
          console.log(`  - ${table.name}`);
        });
      }
      
    } catch (error) {
      console.error("❌ Error reading migration files:", error);
      throw error;
    }
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateLocal();
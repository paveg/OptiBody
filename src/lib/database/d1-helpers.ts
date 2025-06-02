// D1データベースのヘルパー関数
// Drizzle ORMがローカルで動作しない問題の回避策

export async function findUserByEmailOrUsername(
  d1: D1Database,
  email: string,
  username: string
) {
  const result = await d1
    .prepare(
      `SELECT * FROM users WHERE email = ?1 OR username = ?2 LIMIT 1`
    )
    .bind(email.toLowerCase(), username.toLowerCase())
    .first();
  
  return result;
}

export async function createUser(
  d1: D1Database,
  userId: string,
  email: string,
  username: string,
  hashedPassword: string
) {
  await d1
    .prepare(
      `INSERT INTO users (id, email, username, hashed_password) VALUES (?1, ?2, ?3, ?4)`
    )
    .bind(userId, email.toLowerCase(), username.toLowerCase(), hashedPassword)
    .run();
}

export async function findUserById(d1: D1Database, userId: string) {
  const result = await d1
    .prepare(`SELECT * FROM users WHERE id = ?1 LIMIT 1`)
    .bind(userId)
    .first();
  
  return result;
}

export async function findUserByEmail(d1: D1Database, email: string) {
  const result = await d1
    .prepare(`SELECT * FROM users WHERE email = ?1 LIMIT 1`)
    .bind(email.toLowerCase())
    .first();
  
  return result;
}

export async function createSession(
  d1: D1Database,
  sessionId: string,
  userId: string,
  expiresAt: number
) {
  await d1
    .prepare(
      `INSERT INTO sessions (id, user_id, expires_at) VALUES (?1, ?2, ?3)`
    )
    .bind(sessionId, userId, expiresAt)
    .run();
}

export async function deleteSession(d1: D1Database, sessionId: string) {
  await d1
    .prepare(`DELETE FROM sessions WHERE id = ?1`)
    .bind(sessionId)
    .run();
}

export async function findSessionWithUser(d1: D1Database, sessionId: string) {
  const result = await d1
    .prepare(
      `SELECT s.*, u.id as user_id, u.email, u.username 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.id = ?1 LIMIT 1`
    )
    .bind(sessionId)
    .first();
  
  return result;
}
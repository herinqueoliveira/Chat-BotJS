import { db } from "../config/db.js";

const insertUserStmt = db.prepare(
  `INSERT INTO users (name, email, phone, password_hash) VALUES (@name, @email, @phone, @passwordHash)`
);

const findByEmailStmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
const findByIdStmt = db.prepare(`SELECT * FROM users WHERE id = ?`);

export function createUser({ name, email, phone, passwordHash }) {
  const info = insertUserStmt.run({ name, email, phone, passwordHash });
  return findByIdStmt.get(info.lastInsertRowid);
}

export function findUserByEmail(email) {
  return findByEmailStmt.get(email.toLowerCase().trim());
}

export function findUserById(id) {
  return findByIdStmt.get(id);
}

export function toPublicUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}

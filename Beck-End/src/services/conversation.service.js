import { db } from "../config/db.js";

const insertConversationStmt = db.prepare(
  `INSERT INTO conversations (user_id, title) VALUES (?, ?)`
);

const findConversationStmt = db.prepare(
  `SELECT * FROM conversations WHERE id = ? AND user_id = ?`
);

const listConversationsStmt = db.prepare(
  `SELECT id, title, created_at, updated_at
   FROM conversations
   WHERE user_id = ?
   ORDER BY updated_at DESC`
);

const renameConversationStmt = db.prepare(
  `UPDATE conversations SET title = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`
);

const touchConversationStmt = db.prepare(
  `UPDATE conversations SET updated_at = datetime('now') WHERE id = ?`
);

const deleteConversationStmt = db.prepare(
  `DELETE FROM conversations WHERE id = ? AND user_id = ?`
);

export const DEFAULT_TITLE = "Nova conversa";

export function createConversation(userId, title = DEFAULT_TITLE) {
  const info = insertConversationStmt.run(userId, title);
  return findConversationStmt.get(info.lastInsertRowid, userId);
}

export function getConversationForUser(conversationId, userId) {
  return findConversationStmt.get(conversationId, userId);
}

export function listConversationsForUser(userId) {
  return listConversationsStmt.all(userId);
}

export function renameConversation(conversationId, userId, title) {
  renameConversationStmt.run(title, conversationId, userId);
  return findConversationStmt.get(conversationId, userId);
}

export function touchConversation(conversationId) {
  touchConversationStmt.run(conversationId);
}

export function deleteConversation(conversationId, userId) {
  const info = deleteConversationStmt.run(conversationId, userId);
  return info.changes > 0;
}

// Gera um título curto a partir da primeira mensagem do usuário
export function buildTitleFromMessage(message) {
  const clean = message.trim().replace(/\s+/g, " ");
  const MAX = 40;
  if (clean.length <= MAX) return clean;
  return `${clean.slice(0, MAX - 1)}…`;
}

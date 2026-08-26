import { db } from "../config/db.js";

const insertMessageStmt = db.prepare(
  `INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)`
);

const listMessagesStmt = db.prepare(
  `SELECT id, role, content, created_at
   FROM messages
   WHERE conversation_id = ?
   ORDER BY id ASC`
);

export function addMessage(conversationId, role, content) {
  const info = insertMessageStmt.run(conversationId, role, content);
  return { id: info.lastInsertRowid, conversationId, role, content };
}

export function listMessages(conversationId) {
  return listMessagesStmt.all(conversationId);
}

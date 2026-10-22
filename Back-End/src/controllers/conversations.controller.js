import {
  createConversation,
  getConversationForUser,
  listConversationsForUser,
  renameConversation,
  deleteConversation,
  DEFAULT_TITLE,
} from "../services/conversation.service.js";
import { listMessages } from "../services/message.service.js";

export function listConversations(req, res) {
  const conversations = listConversationsForUser(req.user.id);
  return res.json({ conversations });
}

export function createNewConversation(req, res) {
  const { title } = req.body || {};
  const conversation = createConversation(
    req.user.id,
    typeof title === "string" && title.trim() ? title.trim().slice(0, 80) : DEFAULT_TITLE
  );
  return res.status(201).json({ conversation });
}

export function getConversation(req, res) {
  const conversationId = Number(req.params.id);
  const conversation = getConversationForUser(conversationId, req.user.id);

  if (!conversation) {
    return res.status(404).json({ error: "Conversa não encontrada." });
  }

  const messages = listMessages(conversationId);
  return res.json({ conversation, messages });
}

export function renameConversationHandler(req, res) {
  const conversationId = Number(req.params.id);
  const { title } = req.body || {};

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "Informe um título válido." });
  }

  const existing = getConversationForUser(conversationId, req.user.id);
  if (!existing) {
    return res.status(404).json({ error: "Conversa não encontrada." });
  }

  const conversation = renameConversation(conversationId, req.user.id, title.trim().slice(0, 80));
  return res.json({ conversation });
}

export function deleteConversationHandler(req, res) {
  const conversationId = Number(req.params.id);

  const existing = getConversationForUser(conversationId, req.user.id);
  if (!existing) {
    return res.status(404).json({ error: "Conversa não encontrada." });
  }

  deleteConversation(conversationId, req.user.id);
  return res.status(204).send();
}

import {
  getConversationForUser,
  touchConversation,
  renameConversation,
  buildTitleFromMessage,
  DEFAULT_TITLE,
} from "../services/conversation.service.js";
import { addMessage, listMessages } from "../services/message.service.js";
import { generateReply } from "../services/gemini.service.js";
import { uploadsDir } from "../config/paths.js";

export async function sendMessage(req, res) {
  const conversationId = Number(req.params.id);
  const { message, file } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Campo 'message' é obrigatório." });
  }

  const conversation = getConversationForUser(conversationId, req.user.id);
  if (!conversation) {
    return res.status(404).json({ error: "Conversa não encontrada." });
  }

  // O histórico vem do banco (fonte da verdade), não do que o cliente mandar,
  // evitando que alguém finja um histórico diferente do que está salvo.
  const previousMessages = listMessages(conversationId);

  const reply = await generateReply({
    history: previousMessages,
    message: message.trim(),
    file,
    uploadsDir,
  });

  addMessage(conversationId, "user", message.trim());
  addMessage(conversationId, "model", reply);
  touchConversation(conversationId);

  let updatedConversation = conversation;
  if (conversation.title === DEFAULT_TITLE && previousMessages.length === 0) {
    updatedConversation = renameConversation(
      conversationId,
      req.user.id,
      buildTitleFromMessage(message)
    );
  }

  return res.json({ reply, conversation: updatedConversation });
}

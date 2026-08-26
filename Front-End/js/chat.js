/**
 * Controla a área de mensagens: adicionar bolhas, indicador de "digitando"
 * e limpar a tela ao trocar de conversa.
 */
export function createChatView(chatEl) {
  let typingEl = null;

  function clear() {
    chatEl.innerHTML = "";
    typingEl = null;
  }

  function addMessage(text, who) {
    const msg = document.createElement("div");
    msg.className = `msg ${who}`;

    const avatar = document.createElement("div");
    avatar.className = `avatar ${who}`;
    avatar.textContent = who === "bot" ? "IA" : "EU";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    if (who === "bot") {
      msg.append(avatar, bubble);
    } else {
      msg.append(bubble, avatar);
    }

    chatEl.appendChild(msg);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function renderHistory(messages) {
    clear();
    if (messages.length === 0) {
      addMessage("Olá! Sou um chatbot com IA. Como posso ajudar?", "bot");
      return;
    }
    for (const message of messages) {
      addMessage(message.content, message.role === "user" ? "user" : "bot");
    }
  }

  function showTyping() {
    if (typingEl) return;

    typingEl = document.createElement("div");
    typingEl.className = "msg bot";

    const avatar = document.createElement("div");
    avatar.className = "avatar bot";
    avatar.textContent = "IA";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = "digitando...";

    typingEl.append(avatar, bubble);
    chatEl.appendChild(typingEl);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function hideTyping() {
    typingEl?.remove();
    typingEl = null;
  }

  return { clear, addMessage, renderHistory, showTyping, hideTyping };
}

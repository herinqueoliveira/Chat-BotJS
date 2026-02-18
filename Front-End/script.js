const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const statusEl = document.getElementById("botStatus");
const button = form.querySelector('button[type="submit"]');

// Troque aqui se precisar
const API_URL = "http://localhost:3000/chat";

const history = [];
let busy = false;
let typingEl = null;

// ========== UI ==========
function addMessage(text, who) {
  const msg = document.createElement("div");
  msg.className = `msg ${who}`;

  // Avatar
  const avatar = document.createElement("div");
  avatar.className = `avatar ${who}`;
  avatar.textContent = who === "bot" ? "IA" : "EU";

  // Bolha
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  // Montagem (bot esquerda, user direita)
  if (who === "bot") {
    msg.appendChild(avatar);
    msg.appendChild(bubble);
  } else {
    msg.appendChild(bubble);
    msg.appendChild(avatar);
  }

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
  // evita duplicar
  if (typingEl) return;

  typingEl = document.createElement("div");
  typingEl.className = "msg bot";

  const avatar = document.createElement("div");
  avatar.className = "avatar bot";
  avatar.textContent = "IA";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = "digitando...";

  typingEl.appendChild(avatar);
  typingEl.appendChild(bubble);

  chat.appendChild(typingEl);
  chat.scrollTop = chat.scrollHeight;
}

function hideTyping() {
  if (typingEl) typingEl.remove();
  typingEl = null;
}

// ========== API ==========
async function sendMessage(message) {
  statusEl.textContent = "digitando...";
  showTyping();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: history.slice(-20), // mantém contexto sem ficar enorme
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const reply = data?.reply || "Sem resposta.";

    hideTyping();
    addMessage(reply, "bot");
    history.push({ role: "model", text: reply });

    statusEl.textContent = "online";
  } catch (e) {
    console.error(e);
    hideTyping();
    addMessage("Erro ao conectar com o servidor.", "bot");
    statusEl.textContent = "offline";
  }
}

// ========== EVENTS ==========
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (busy) return;

  const text = input.value.trim();
  if (!text) return;

  busy = true;
  button.disabled = true;

  addMessage(text, "user");
  history.push({ role: "user", text });
  input.value = "";
  input.focus();

  try {
    await sendMessage(text);
  } finally {
    busy = false;
    button.disabled = false;
  }
});

// Mensagem inicial
const welcome = "Olá! Sou um chatbot com IA. Como posso ajudar?";
addMessage(welcome, "bot");
history.push({ role: "model", text: welcome });

import { api } from "./api.js";
import { createSidebarController } from "./sidebar.js";
import { createChatView } from "./chat.js";

// ===== Elementos =====
const chatEl = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const statusEl = document.getElementById("botStatus");
const submitButton = form.querySelector('button[type="submit"]');

const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const attachedFileEl = document.getElementById("attachedFile");
const attachedFileNameEl = document.getElementById("attachedFileName");
const attachedFileIconEl = document.getElementById("attachedFileIcon");
const removeFileButton = document.getElementById("removeFileButton");

const conversationListEl = document.getElementById("conversationList");
const conversationTitleEl = document.getElementById("conversationTitle");
const newConversationButton = document.getElementById("newConversationButton");
const sidebarUserNameEl = document.getElementById("sidebarUserName");
const logoutButton = document.getElementById("logoutButton");
const toggleSidebarButton = document.getElementById("toggleSidebarButton");
const sidebarEl = document.getElementById("sidebar");

// ===== Estado =====
let currentConversationId = null;
let uploadedFile = null;
let busy = false;

const chatView = createChatView(chatEl);

const sidebar = createSidebarController({
  listEl: conversationListEl,
  onSelect: (conversationId) => {
    if (conversationId === null) {
      createAndOpenConversation();
    } else {
      openConversation(conversationId);
    }
  },
  onChange: () => {},
});

// ===== Autenticação =====
async function bootstrap() {
  let user;
  try {
    ({ user } = await api.me());
  } catch {
    window.location.href = "./login.html";
    return;
  }

  sidebarUserNameEl.textContent = user.name;

  const conversations = await sidebar.reload();

  if (conversations.length > 0) {
    await openConversation(conversations[0].id);
  } else {
    await createAndOpenConversation();
  }
}

logoutButton.addEventListener("click", async () => {
  try {
    await api.logout();
  } finally {
    window.location.href = "./login.html";
  }
});

// ===== Conversas =====
async function openConversation(conversationId) {
  const { conversation, messages } = await api.getConversation(conversationId);
  currentConversationId = conversation.id;
  conversationTitleEl.textContent = conversation.title;
  sidebar.setActive(conversation.id);
  chatView.renderHistory(messages);
  clearAttachedFile();
}

async function createAndOpenConversation() {
  const { conversation } = await api.createConversation();
  sidebar.upsertLocal(conversation);
  currentConversationId = conversation.id;
  conversationTitleEl.textContent = conversation.title;
  sidebar.setActive(conversation.id);
  chatView.renderHistory([]);
  clearAttachedFile();
}

newConversationButton.addEventListener("click", () => {
  createAndOpenConversation().catch((err) => {
    console.error(err);
    chatView.addMessage("Não foi possível criar uma nova conversa.", "bot");
  });
});

toggleSidebarButton.addEventListener("click", () => {
  sidebarEl.classList.toggle("sidebar--open");
});

// ===== Upload de arquivo =====
function iconForFile(filename) {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  const map = {
    pdf: "📕", doc: "📄", docx: "📄", txt: "📄",
    xls: "📊", xlsx: "📊", csv: "📊",
    zip: "🗜️", rar: "🗜️",
    png: "🖼️", jpg: "🖼️", jpeg: "🖼️", gif: "🖼️",
    js: "🧩", json: "🧩", sql: "🗄️",
    mp3: "🎵", mp4: "🎬",
  };
  return map[ext] || "📄";
}

function clearAttachedFile() {
  uploadedFile = null;
  fileInput.value = "";
  attachedFileEl.style.display = "none";
  attachedFileNameEl.textContent = "";
}

uploadButton.addEventListener("click", () => fileInput.click());
removeFileButton.addEventListener("click", clearAttachedFile);

fileInput.addEventListener("change", async () => {
  if (!fileInput.files.length) return;

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const data = await api.uploadFile(formData);

    if (data.success) {
      uploadedFile = data;
      attachedFileIconEl.textContent = iconForFile(data.originalname);
      attachedFileNameEl.textContent = data.originalname;
      attachedFileEl.style.display = "flex";
    } else {
      chatView.addMessage("Erro ao anexar arquivo.", "bot");
    }
  } catch (err) {
    console.error("Erro no upload:", err);
    chatView.addMessage(`❌ Não foi possível anexar o arquivo (${err.message}).`, "bot");
  }
});

// ===== Envio de mensagens =====
async function sendMessage(message) {
  statusEl.textContent = "digitando...";
  chatView.showTyping();

  try {
    if (!currentConversationId) {
      await createAndOpenConversation();
    }

    const { reply, conversation } = await api.sendMessage(currentConversationId, {
      message,
      file: uploadedFile,
    });

    chatView.hideTyping();
    chatView.addMessage(reply, "bot");

    if (conversation) {
      conversationTitleEl.textContent = conversation.title;
      sidebar.upsertLocal(conversation);
    }

    clearAttachedFile();
    statusEl.textContent = "online";
  } catch (err) {
    console.error(err);
    chatView.hideTyping();
    chatView.addMessage("Erro ao conectar com o servidor.", "bot");
    statusEl.textContent = "offline";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (busy) return;

  const text = input.value.trim();
  if (!text) return;

  busy = true;
  submitButton.disabled = true;

  chatView.addMessage(text, "user");
  input.value = "";
  input.focus();

  try {
    await sendMessage(text);
  } finally {
    busy = false;
    submitButton.disabled = false;
  }
});

bootstrap();

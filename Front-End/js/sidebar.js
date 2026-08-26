import { api } from "./api.js";

/**
 * Controla a barra lateral de conversas: renderização da lista,
 * seleção, criação, renomeação e exclusão.
 *
 * @param {Object} options
 * @param {HTMLElement} options.listEl - elemento onde os itens são renderizados
 * @param {(conversationId: number) => void} options.onSelect - chamado ao clicar numa conversa
 * @param {() => void} options.onChange - chamado sempre que a lista muda (criação/renome/exclusão)
 */
export function createSidebarController({ listEl, onSelect, onChange }) {
  let conversations = [];
  let activeId = null;

  function render() {
    listEl.innerHTML = "";

    if (conversations.length === 0) {
      const empty = document.createElement("div");
      empty.className = "sidebar-empty";
      empty.textContent = "Nenhuma conversa ainda.";
      listEl.appendChild(empty);
      return;
    }

    for (const conversation of conversations) {
      listEl.appendChild(renderItem(conversation));
    }
  }

  function renderItem(conversation) {
    const item = document.createElement("div");
    item.className = "conversation-item" + (conversation.id === activeId ? " active" : "");
    item.dataset.id = String(conversation.id);

    const title = document.createElement("span");
    title.className = "conversation-title";
    title.textContent = conversation.title;
    title.title = conversation.title;

    const actions = document.createElement("div");
    actions.className = "conversation-actions";

    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "conversation-action";
    renameBtn.title = "Renomear conversa";
    renameBtn.textContent = "✏️";
    renameBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      handleRename(conversation);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "conversation-action";
    deleteBtn.title = "Excluir conversa";
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      handleDelete(conversation);
    });

    actions.append(renameBtn, deleteBtn);
    item.append(title, actions);

    item.addEventListener("click", () => {
      setActive(conversation.id);
      onSelect(conversation.id);
    });

    return item;
  }

  async function handleRename(conversation) {
    const newTitle = window.prompt("Novo nome da conversa:", conversation.title);
    if (!newTitle || !newTitle.trim() || newTitle.trim() === conversation.title) return;

    const { conversation: updated } = await api.renameConversation(conversation.id, newTitle.trim());
    conversations = conversations.map((c) => (c.id === updated.id ? updated : c));
    render();
    onChange();
  }

  async function handleDelete(conversation) {
    const confirmed = window.confirm(`Excluir a conversa "${conversation.title}"? Essa ação não pode ser desfeita.`);
    if (!confirmed) return;

    await api.deleteConversation(conversation.id);
    conversations = conversations.filter((c) => c.id !== conversation.id);

    const wasActive = conversation.id === activeId;
    render();
    onChange();

    if (wasActive) {
      // deixa quem chamou decidir o que abrir no lugar (ex: próxima conversa ou uma nova)
      onSelect(conversations[0]?.id ?? null);
    }
  }

  function setActive(conversationId) {
    activeId = conversationId;
    render();
  }

  async function reload() {
    const { conversations: list } = await api.listConversations();
    conversations = list;
    render();
    return conversations;
  }

  function upsertLocal(conversation) {
    const exists = conversations.some((c) => c.id === conversation.id);
    conversations = exists
      ? conversations.map((c) => (c.id === conversation.id ? conversation : c))
      : [conversation, ...conversations];
    render();
  }

  return { reload, setActive, upsertLocal, getConversations: () => conversations };
}

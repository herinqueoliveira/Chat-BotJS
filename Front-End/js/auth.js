import { api } from "./api.js";

const tabs = document.querySelectorAll(".auth-tab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authError = document.getElementById("authError");

// Se já estiver logado, pula direto pro chat
api
  .me()
  .then(() => {
    window.location.href = "./index.html";
  })
  .catch(() => {
    // não autenticado, permanece na tela de login normalmente
  });

function showError(message) {
  authError.textContent = message;
  authError.hidden = false;
}

function clearError() {
  authError.hidden = true;
  authError.textContent = "";
}

function setActiveTab(tabName) {
  clearError();

  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));

  loginForm.hidden = tabName !== "login";
  registerForm.hidden = tabName !== "register";
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const submitButton = document.getElementById("loginSubmit");
  submitButton.disabled = true;

  try {
    await api.login({
      email: document.getElementById("loginEmail").value.trim(),
      password: document.getElementById("loginPassword").value,
    });
    window.location.href = "./index.html";
  } catch (err) {
    showError(err.message || "Não foi possível entrar.");
  } finally {
    submitButton.disabled = false;
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const email = document.getElementById("registerEmail").value.trim();
  const emailConfirmation = document.getElementById("registerEmailConfirmation").value.trim();
  const password = document.getElementById("registerPassword").value;
  const passwordConfirmation = document.getElementById("registerPasswordConfirmation").value;

  // Feedback imediato no cliente (a validação que vale de verdade é a do servidor)
  if (email.toLowerCase() !== emailConfirmation.toLowerCase()) {
    showError("Os e-mails informados não coincidem.");
    return;
  }
  if (password !== passwordConfirmation) {
    showError("As senhas informadas não coincidem.");
    return;
  }

  const submitButton = document.getElementById("registerSubmit");
  submitButton.disabled = true;

  try {
    await api.register({
      name: document.getElementById("registerName").value.trim(),
      email,
      emailConfirmation,
      phone: document.getElementById("registerPhone").value.trim(),
      password,
      passwordConfirmation,
    });
    window.location.href = "./index.html";
  } catch (err) {
    showError(err.message || "Não foi possível criar a conta.");
  } finally {
    submitButton.disabled = false;
  }
});

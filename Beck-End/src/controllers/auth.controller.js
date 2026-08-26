import { createUser, findUserByEmail, toPublicUser } from "../services/user.service.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from "../utils/token.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Aceita formatos comuns de telefone: dígitos, espaços, parênteses, traço e "+" (DDI)
const PHONE_REGEX = /^[\d\s()+-]{8,20}$/;

function validateRegisterInput({ name, email, emailConfirmation, phone, password, passwordConfirmation }) {
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return "Informe um nome com pelo menos 2 caracteres.";
  }
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return "Informe um e-mail válido.";
  }
  if (!emailConfirmation || email.trim().toLowerCase() !== String(emailConfirmation).trim().toLowerCase()) {
    return "Os e-mails informados não coincidem.";
  }
  if (!phone || typeof phone !== "string" || !PHONE_REGEX.test(phone.trim())) {
    return "Informe um telefone válido.";
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  if (password !== passwordConfirmation) {
    return "As senhas informadas não coincidem.";
  }
  return null;
}

export async function register(req, res) {
  const { name, email, emailConfirmation, phone, password, passwordConfirmation } = req.body || {};

  const validationError = validateRegisterInput({
    name,
    email,
    emailConfirmation,
    phone,
    password,
    passwordConfirmation,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = findUserByEmail(normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
  }

  const passwordHash = await hashPassword(password);
  const user = createUser({
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    passwordHash,
  });

  const token = signAuthToken(user);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());

  return res.status(201).json({ user: toPublicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Informe e-mail e senha." });
  }

  const user = findUserByEmail(String(email));
  if (!user) {
    return res.status(401).json({ error: "E-mail ou senha inválidos." });
  }

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "E-mail ou senha inválidos." });
  }

  const token = signAuthToken(user);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());

  return res.json({ user: toPublicUser(user) });
}

export function logout(_req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions());
  return res.status(204).send();
}

export function me(req, res) {
  return res.json({ user: req.user });
}

import { AUTH_COOKIE_NAME, verifyAuthToken } from "../utils/token.js";
import { findUserById } from "../services/user.service.js";

// Protege rotas: exige um token JWT válido no cookie httpOnly.
// Em caso de sucesso, popula req.user com { id, name, email }.
export function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  try {
    const payload = verifyAuthToken(token);
    const user = findUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: "Sessão inválida." });
    }

    req.user = { id: user.id, name: user.name, email: user.email };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Sessão expirada ou inválida." });
  }
}

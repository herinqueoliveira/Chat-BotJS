// Middleware final: captura qualquer erro não tratado nas rotas (inclusive
// os que "caem" de handlers async, graças ao suporte nativo do Express 5)
// e devolve uma resposta JSON consistente, sem vazar detalhes internos.
export function errorHandler(err, req, res, _next) {
  console.error("Erro não tratado:", err);

  if (res.headersSent) {
    return;
  }

  res.status(err.status || 500).json({
    error: err.publicMessage || "Erro interno no servidor.",
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Rota não encontrada." });
}

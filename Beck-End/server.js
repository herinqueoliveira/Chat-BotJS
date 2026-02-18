import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY não definida no .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Servidor online" });
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Campo 'message' é obrigatório." });
    }

    // history esperado: [{ role: "user"|"model", text: "..." }, ...]
    const safeHistory = Array.isArray(history) ? history : [];
    const promptParts = safeHistory
      .filter((h) => h && typeof h.text === "string" && typeof h.role === "string")
      .map((h) => `${h.role === "user" ? "Usuário" : "Assistente"}: ${h.text}`)
      .join("\n");

    const prompt = `${promptParts}\nUsuário: ${message}\nAssistente:`;

    const result = await model.generateContent(prompt);
    const reply = result?.response?.text?.() || "Sem resposta.";

    return res.json({ reply });
  } catch (err) {
    console.error("Erro no /chat:", err);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

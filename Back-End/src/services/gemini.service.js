import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { env } from "../config/env.js";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const MAX_FILE_CHARS = 15000; // limite de caracteres extraídos por arquivo, pra não estourar o contexto

const TEXT_EXTENSIONS = [
  "txt", "js", "jsx", "ts", "tsx", "json", "csv", "sql", "html", "css",
  "md", "log", "yml", "yaml", "sh", "bash", "py", "java", "c", "cpp",
  "h", "go", "rb", "php", "rs", "kt", "swift", "xml", "ini", "conf", "env",
];
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp"];

// Lê o conteúdo de um arquivo anexado e devolve algo que o Gemini consiga entender:
// - { type: "text", text }        -> pra arquivos de texto/pdf/docx
// - { type: "image", inlineData } -> pra imagens (o Gemini enxerga a imagem de verdade)
// - { type: "unsupported" }       -> tipo que ainda não sabemos ler
// - { type: "error", message }    -> algo deu errado ao ler
export async function readAttachedFile(file, uploadsDir) {
  const filePath = path.isAbsolute(file.path) ? file.path : path.join(uploadsDir, path.basename(file.path));
  const originalName = file.originalname || file.filename || "arquivo";
  const ext = path.extname(originalName).toLowerCase().replace(".", "");

  if (!fs.existsSync(filePath)) {
    return { type: "error", message: "Arquivo não encontrado no servidor (pode já ter sido removido)." };
  }

  try {
    if (IMAGE_EXTENSIONS.includes(ext)) {
      const buffer = fs.readFileSync(filePath);
      return {
        type: "image",
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        },
      };
    }

    if (ext === "pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return { type: "text", text: (data.text || "").slice(0, MAX_FILE_CHARS) };
    }

    if (ext === "docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return { type: "text", text: (result.value || "").slice(0, MAX_FILE_CHARS) };
    }

    if (TEXT_EXTENSIONS.includes(ext)) {
      const text = fs.readFileSync(filePath, "utf-8");
      return { type: "text", text: text.slice(0, MAX_FILE_CHARS) };
    }

    return { type: "unsupported" };
  } catch (err) {
    console.error("Erro ao ler arquivo anexado:", err);
    return { type: "error", message: "Não consegui abrir o conteúdo desse arquivo." };
  }
}

// Monta o prompt a partir do histórico salvo no banco (fonte da verdade),
// da mensagem atual e, opcionalmente, de um arquivo anexado.
export async function generateReply({ history, message, file, uploadsDir }) {
  const promptParts = history
    .map((h) => `${h.role === "user" ? "Usuário" : "Assistente"}: ${h.content}`)
    .join("\n");

  let promptText = `${promptParts}\nUsuário: ${message}`;
  const geminiParts = [];

  if (file && file.path) {
    const fileResult = await readAttachedFile(file, uploadsDir);
    const fileName = file.originalname || file.filename || "arquivo";

    if (fileResult.type === "text") {
      promptText += `\n\n[Conteúdo do arquivo anexado "${fileName}"]:\n${fileResult.text}`;
    } else if (fileResult.type === "image") {
      promptText += `\n\n[O usuário também anexou a imagem "${fileName}", disponível abaixo.]`;
      geminiParts.push({ inlineData: fileResult.inlineData });
    } else if (fileResult.type === "unsupported") {
      promptText += `\n\n[O usuário anexou o arquivo "${fileName}", mas esse tipo de arquivo ainda não pode ser lido. Avise isso educadamente.]`;
    } else if (fileResult.type === "error") {
      promptText += `\n\n[O usuário anexou o arquivo "${fileName}", mas houve um erro ao lê-lo: ${fileResult.message}]`;
    }
  }

  promptText += `\nAssistente:`;
  geminiParts.unshift({ text: promptText });

  const result = await model.generateContent(geminiParts);
  return result?.response?.text?.() || "Sem resposta.";
}

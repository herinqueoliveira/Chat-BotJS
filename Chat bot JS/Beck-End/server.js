import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = "COLE_SUA_CHAVE_OPENAI_AQUI";

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try{
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method:"POST",
        headers:{
          "Authorization":`Bearer ${OPENAI_KEY}`,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          model:"gpt-4o-mini",
          messages:[
            { role:"system", content:"Você é um assistente educado e claro." },
            { role:"user", content:userMessage }
          ]
        })
      }
    );

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });

  }catch{
    res.status(500).json({ reply:"Erro no servidor." });
  }
});

app.listen(3000, () =>
  console.log("Servidor rodando em http://localhost:3000")
);

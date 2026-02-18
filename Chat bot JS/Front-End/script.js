const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const status = document.getElementById("botStatus");

function addMessage(text, who){
  const msg = document.createElement("div");
  msg.className = `msg ${who}`;
  msg.innerHTML = `<div class="bubble">${text}</div>`;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

async function respond(message){
  status.textContent = "digitando...";

  try{
    const res = await fetch("http://localhost:3000/chat",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ message })
    });

    const data = await res.json();
    addMessage(data.reply, "bot");
    status.textContent = "online";

  }catch{
    addMessage("Erro ao conectar ao servidor.", "bot");
    status.textContent = "offline";
  }
}

form.addEventListener("submit", e=>{
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;
  addMessage(text, "user");
  input.value = "";
  respond(text);
});

addMessage("Olá! Sou um chatbot com IA. Como posso ajudar?", "bot");

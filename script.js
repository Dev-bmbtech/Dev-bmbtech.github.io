const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Hifadhi chat history
let chats = JSON.parse(localStorage.getItem("chats")) || [];
chats.forEach(msg => addMessage(msg.text, msg.sender));

function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Save message
  chats.push({ text, sender });
  localStorage.setItem("chats", JSON.stringify(chats));
}

// === Custom identity check ===
function checkIdentity(question) {
  const q = question.toLowerCase();

  // Kiswahili
  if (q.includes("unaitwa nani") || q.includes("jina lako nani") || q.includes("wewe nani")) {
    return "Ninaitwa B.M.B TECH 🤖";
  }

  // English
  if (q.includes("what is your name") || q.includes("who are you") || q.includes("your name")) {
    return "My name is B.M.B TECH 🤖";
  }

  return null; // sio swali la jina
}

async function fetchFromAPIs(query) {
  const apis = [
    `https://api.giftedtech.web.id/api/ai/ai?apikey=gifted&q=${encodeURIComponent(query)}`,
    `https://api.giftedtech.web.id/api/ai/chat?apikey=gifted&q=${encodeURIComponent(query)}`,
    `https://api.giftedtech.web.id/api/ai/gpt?apikey=gifted&q=${encodeURIComponent(query)}`
  ];

  for (let url of apis) {
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.result) {
        return data.result;
      }
    } catch (err) {
      console.log("API error:", err);
    }
  }

  return "⚠️ Samahani, hakuna jibu lililopatikana kwa sasa.";
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  // Cheki kama ni swali la jina
  const identityAnswer = checkIdentity(text);
  if (identityAnswer) {
    addMessage(identityAnswer, "bot");
    return;
  }

  addMessage("⏳ Inatafuta jibu...", "bot");

  const reply = await fetchFromAPIs(text);

  // Ondoa message ya loading
  let loadingMsg = document.querySelector(".bot:last-child");
  if (loadingMsg && loadingMsg.textContent === "⏳ Inatafuta jibu...") {
    loadingMsg.remove();
  }

  addMessage(reply, "bot");
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

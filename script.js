const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const imgBtn = document.getElementById("img-btn");

// Load old chats from localStorage
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

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  // Call AI API (replace URL & key with your API)
  try {
    const res = await fetch("YOUR_AI_API_ENDPOINT", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer YOUR_API_KEY" },
      body: JSON.stringify({ prompt: text })
    });
    const data = await res.json();
    addMessage(data.reply || "⚠️ No response", "bot");
  } catch (err) {
    addMessage("❌ Error connecting to AI", "bot");
  }
}

async function generateImage() {
  const text = prompt("Enter description for image:");
  if (!text) return;

  try {
    const res = await fetch("YOUR_IMAGE_API_ENDPOINT", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer YOUR_API_KEY" },
      body: JSON.stringify({ prompt: text })
    });
    const data = await res.json();

    const img = document.createElement("img");
    img.src = data.url || "";
    img.style.maxWidth = "100%";
    img.style.borderRadius = "10px";
    chatBox.appendChild(img);
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    addMessage("❌ Error generating image", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
imgBtn.addEventListener("click", generateImage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const historyList = document.getElementById("history-list");
const newChatBtn = document.getElementById("new-chat-btn");
const searchInput = document.getElementById("search-input");

// Multiple chat sessions
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let currentSession = { id: Date.now(), messages: [] };

// On load
renderHistory();
loadSession(currentSession);

function addMessage(text, sender) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  currentSession.messages.push({ text, sender });
  saveSessions();
}

function saveSessions() {
  const index = sessions.findIndex(s => s.id === currentSession.id);
  if (index >= 0) {
    sessions[index] = currentSession;
  } else {
    sessions.push(currentSession);
  }
  localStorage.setItem("sessions", JSON.stringify(sessions));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  sessions.forEach(session => {
    const li = document.createElement("li");
    li.className = "session-item";
    li.textContent = session.messages[0]?.text?.slice(0, 30) || "New chat";

    // Delete button: mistari mitatu + neno Delete
    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "⋮⋮⋮ <span class='delete-text'>Delete</span>";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm("Delete this chat?")) {
        deleteSession(session.id);
      }
    };

    li.appendChild(deleteBtn);
    li.onclick = () => loadSession(session);
    historyList.appendChild(li);
  });
}

function deleteSession(id) {
  sessions = sessions.filter(s => s.id !== id);
  if (currentSession.id === id) {
    currentSession = { id: Date.now(), messages: [] };
    loadSession(currentSession);
  }
  saveSessions();
}

function loadSession(session) {
  currentSession = session;
  chatBox.innerHTML = "";
  session.messages.forEach(m => addMessage(m.text, m.sender));
}

// === Identity Check ===
function checkIdentity(question) {
  const q = question.toLowerCase();

  if (q.includes("unaitwa nani") || q.includes("jina lako nani") || q.includes("wewe nani")) {
    return "Ninaitwa B.M.B TECH 🤖";
  }

  if (q.includes("what is your name") || q.includes("who are you") || q.includes("your name")) {
    return "My name is B.M.B TECH 🤖";
  }

  return null;
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

  return "⚠️ Hakuna jibu lililopatikana kwa sasa.";
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  const identityAnswer = checkIdentity(text);
  if (identityAnswer) {
    addMessage(identityAnswer, "bot");
    return;
  }

  addMessage("⏳ Inatafuta jibu...", "bot");

  const reply = await fetchFromAPIs(text);

  let loadingMsg = document.querySelector(".bot:last-child");
  if (loadingMsg && loadingMsg.textContent === "⏳ Inatafuta jibu...") {
    loadingMsg.remove();
  }

  addMessage(reply, "bot");
}

// === Controls ===
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

newChatBtn.addEventListener("click", () => {
  currentSession = { id: Date.now(), messages: [] };
  chatBox.innerHTML = "";
  saveSessions();
});

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = sessions.filter(session =>
    session.messages.some(m => m.text.toLowerCase().includes(keyword))
  );

  historyList.innerHTML = "";
  filtered.forEach(session => {
    const li = document.createElement("li");
    li.className = "session-item";
    li.textContent = session.messages[0]?.text?.slice(0, 30) || "New chat";

    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "⋮⋮⋮ <span class='delete-text'>Delete</span>";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm("Delete this chat?")) {
        deleteSession(session.id);
      }
    };

    li.appendChild(deleteBtn);
    li.onclick = () => loadSession(session);
    historyList.appendChild(li);
  });
});

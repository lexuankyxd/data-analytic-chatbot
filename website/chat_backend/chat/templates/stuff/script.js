function sendMessage() {
  const input = document.getElementById("userInput");
  const chatWindow = document.getElementById("chatWindow");
  const userText = input.value.trim();

  if (userText === "") return;

  // Create user message
  const userMessage = document.createElement("div");
  userMessage.className = "message user";
  userMessage.textContent = userText;
  chatWindow.appendChild(userMessage);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  input.value = "";

  // Simulate bot response
  setTimeout(() => {
    const botMessage = document.createElement("div");
    botMessage.className = "message bot";
    botMessage.textContent = "You said: " + userText;
    chatWindow.appendChild(botMessage);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 600);
}

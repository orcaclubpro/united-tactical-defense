/**
 * United Defense Tactical - Chatbot Implementation
 */

document.addEventListener('DOMContentLoaded', function() {
  // Create chatbot elements
  const chatbotHTML = `
    <div id="udt-chatbot" class="udt-chatbot">
      <button id="chat-toggle" class="chat-toggle" aria-label="Chat with us">
        <span class="chat-icon">💬</span>
      </button>

      <div id="chat-container" class="chat-container">
        <div class="chat-header">
          <h3>United Defense Tactical</h3>
          <button id="chat-close" class="chat-close" aria-label="Close chat">✕</button>
        </div>

        <div id="chat-messages" class="chat-messages">
          <!-- Messages will appear here -->
        </div>

        <div class="chat-input-container">
          <input type="text" id="chat-input" placeholder="Ask a question...">
          <button id="chat-send" class="chat-send">Send</button>
        </div>
      </div>
    </div>
  `;

  // Append chatbot to body
  const chatbotContainer = document.createElement('div');
  chatbotContainer.innerHTML = chatbotHTML;
  document.body.appendChild(chatbotContainer.firstElementChild);

  // Add chatbot styles
  const chatbotStyles = document.createElement('style');
  chatbotStyles.textContent = `
    .udt-chatbot {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: var(--font-body);
    }

    .chat-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--color-tactical-red);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-fast);
    }

    .chat-toggle:hover {
      transform: scale(1.05);
      background-color: var(--color-navy);
    }

    .chat-icon {
      font-size: 24px;
    }

    .chat-container {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      background-color: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      display: none;
    }

    .chat-header {
      background-color: var(--color-navy);
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-header h3 {
      margin: 0;
      font-size: 18px;
    }

    .chat-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 16px;
    }

    .chat-messages {
      flex-grow: 1;
      padding: 15px;
      overflow-y: auto;
    }

    .message {
      margin-bottom: 15px;
      padding: 10px 15px;
      border-radius: 18px;
      max-width: 80%;
      line-height: 1.4;
    }

    .user-message {
      background-color: #E5E5EA;
      margin-left: auto;
      border-bottom-right-radius: 5px;
    }

    .bot-message {
      background-color: var(--color-tactical-red);
      color: white;
      margin-right: auto;
      border-bottom-left-radius: 5px;
    }

    .chat-input-container {
      display: flex;
      padding: 10px;
      border-top: 1px solid rgba(0,0,0,0.1);
    }

    #chat-input {
      flex-grow: 1;
      padding: 10px;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: var(--radius-sm);
      font-size: 14px;
    }

    .chat-send {
      background-color: var(--color-tactical-red);
      color: white;
      border: none;
      padding: 0 15px;
      margin-left: 5px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 600;
    }

    .typing-indicator {
      display: flex;
      padding: 10px 15px;
      background-color: rgba(0,0,0,0.05);
      border-radius: 18px;
      margin-right: auto;
      margin-bottom: 15px;
      border-bottom-left-radius: 5px;
      width: fit-content;
    }

    .typing-indicator span {
      height: 8px;
      width: 8px;
      background-color: rgba(0,0,0,0.5);
      border-radius: 50%;
      margin: 0 2px;
      display: inline-block;
      animation: typing 1.4s infinite both;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
      100% { transform: translateY(0); }
    }

    /* Mobile responsive styles */
    @media (max-width: 576px) {
      .chat-container {
        width: 90vw;
        height: 70vh;
        bottom: 80px;
        right: 0;
      }
    }
  `;
  document.head.appendChild(chatbotStyles);

  // Get DOM elements
  const chatToggle = document.getElementById('chat-toggle');
  const chatContainer = document.getElementById('chat-container');
  const chatClose = document.getElementById('chat-close');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  // Toggle chat open/closed
  chatToggle.addEventListener('click', function() {
    chatContainer.style.display = chatContainer.style.display === 'flex' ? 'none' : 'flex';
    if (chatContainer.style.display === 'flex') {
      // If no messages, add initial greeting
      if (chatMessages.children.length === 0) {
        addBotMessage("Hi there! I'm the United Defense Tactical assistant. How can I help you with firearms training or self-defense classes today?");
      }
      chatInput.focus();
    }
  });

  // Close chat
  chatClose.addEventListener('click', function() {
    chatContainer.style.display = 'none';
  });

  // Send message on button click
  chatSend.addEventListener('click', sendMessage);

  // Send message on Enter key
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Function to send message
  function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
      // Add user message to chat
      addUserMessage(message);

      // Clear input
      chatInput.value = '';

      // Show typing indicator
      showTypingIndicator();

      // Process the message and get response
      processMessage(message);
    }
  }

  // Add user message to chat
  function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user-message');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
  }

  // Add bot message to chat
  function addBotMessage(message) {
    // Remove typing indicator if exists
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'bot-message');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    scrollToBottom();
  }

  // Show typing indicator
  function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('typing-indicator');
    typingElement.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typingElement);
    scrollToBottom();
  }

  // Scroll to bottom of chat
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Process user message and get response
  function processMessage(message) {
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();

    // Simulate response delay (300-1200ms)
    setTimeout(() => {
      // Simple response logic based on keywords
      if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee')) {
        addBotMessage("Our training packages start at $149/month for our Basic Defense package. We also offer Tactical Defender ($249/month) and Elite Operator ($399/month) packages. All new members can try a free first class! Would you like more details about what's included in each package?");
      }
      else if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where')) {
        addBotMessage("We're located at 160 S Old Springs Road #155, Anaheim Hills, CA 92808. Our facility features state-of-the-art training equipment and simulation areas. Would you like directions?");
      }
      else if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('time')) {
        addBotMessage("Our hours of operation are:\n• Monday-Friday: 9:00 AM - 8:00 PM\n• Saturday: 9:00 AM - 6:00 PM\n• Sunday: 10:00 AM - 4:00 PM\nWhen would you like to visit us?");
      }
      else if (lowerMessage.includes('instructor') || lowerMessage.includes('teach')) {
        addBotMessage("Our elite instructor team is led by Casey Forester and Ty Kern, both with extensive military and tactical experience. We also have specialized instructors like Sarah Martinez who focuses on defensive tactics and women's self-defense. Would you like to know more about any specific instructor?");
      }
      else if (lowerMessage.includes('class') || lowerMessage.includes('course') || lowerMessage.includes('program') || lowerMessage.includes('training')) {
        addBotMessage("We offer several training programs including Defensive Handgun, Home Defense Mastery, Advanced Tactical, and Non-Firearm Defense. All our programs follow our 8-level training system to take you from beginner to expert. Which program interests you most?");
      }
      else if (lowerMessage.includes('free') || lowerMessage.includes('trial')) {
        addBotMessage("Yes! We offer a free first class for all new members. It's a great way to experience our training approach with zero risk. Would you like me to help you schedule your free class?");
      }
      else if (lowerMessage.includes('experience') || lowerMessage.includes('beginner') || lowerMessage.includes('never')) {
        addBotMessage("No prior experience is needed! Our training programs are designed for all levels, from complete beginners to advanced practitioners. Our Level 1 classes cover all the essentials of safety and handling fundamentals. Many of our members had never handled a firearm before joining us.");
      }
      else if (lowerMessage.includes('equipment') || lowerMessage.includes('bring') || lowerMessage.includes('firearm') || lowerMessage.includes('gun')) {
        addBotMessage("For beginner classes, we provide all necessary equipment, including firearms, holsters, and safety gear. As you advance, you may prefer to use your own equipment, but it's never required. For specialized courses, we'll provide a detailed equipment list ahead of time.");
      }
      else if (lowerMessage.includes('phone') || lowerMessage.includes('call') || lowerMessage.includes('contact')) {
        addBotMessage("You can reach us at (657) 276-0457 or email us at anaheimhills@uniteddefensetactical.com. Would you prefer I help schedule a call with one of our instructors?");
      }
      else if (lowerMessage.includes('book') || lowerMessage.includes('sign up') || lowerMessage.includes('register') || lowerMessage.includes('schedule')) {
        addBotMessage("To schedule your first class, you can fill out the form on our website, call us at (657) 276-0457, or I can collect your information now and have an instructor contact you. What would work best for you?");
      }
      else if (lowerMessage.includes('thank')) {
        addBotMessage("You're welcome! If you have any other questions, feel free to ask. We look forward to training with you soon!");
      }
      else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        addBotMessage("Thanks for chatting! We look forward to seeing you at United Defense Tactical soon. Stay safe!");
      }
      else {
        addBotMessage("Thanks for reaching out! I'd be happy to answer questions about our firearms and self-defense training programs, membership options, facility, or scheduling a free class. What specific information are you looking for today?");
      }
    }, Math.floor(Math.random() * 900) + 300); // Random delay between 300-1200ms
  }
});

import React, { useEffect, useState, useRef } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("Hi there! I'm the United Defense Tactical assistant. How can I help you with firearms training or self-defense classes today?");
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addUserMessage(inputValue);
      setInputValue('');
      processMessage(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const addUserMessage = (message) => {
    setMessages(prev => [...prev, { type: 'user', text: message }]);
  };

  const addBotMessage = (message) => {
    setMessages(prev => [...prev, { type: 'bot', text: message }]);
  };

  const processMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
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
      else {
        addBotMessage("Thanks for reaching out! I'd be happy to answer questions about our firearms and self-defense training programs, membership options, facility, or scheduling a free class. What specific information are you looking for today?");
      }
    }, Math.floor(Math.random() * 900) + 300);
  };

  return (
    <div className="udt-chatbot">
      <button 
        className="chat-toggle" 
        aria-label="Chat with us"
        onClick={toggleChat}
      >
        <span className="chat-icon">💬</span>
      </button>

      <div 
        className="chat-container"
        style={{ display: isOpen ? 'flex' : 'none' }}
      >
        <div className="chat-header">
          <h3>United Defense Tactical</h3>
          <button 
            className="chat-close" 
            aria-label="Close chat"
            onClick={toggleChat}
          >
            ✕
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.type === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {msg.text}
            </div>
          ))}
          
          {isTyping && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <input 
            type="text" 
            id="chat-input" 
            placeholder="Ask a question..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="chat-send"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;

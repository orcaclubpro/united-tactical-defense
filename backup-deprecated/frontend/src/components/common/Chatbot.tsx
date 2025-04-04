import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.scss';

interface UserInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  preferredProgram: string | null;
  experienceLevel: string | null;
}

interface ConversationState {
  currentFlow: string;
  previousFlow: string | null;
  userInfo: UserInfo;
  interactionCount: number;
  leadQualified: boolean;
  readyForContact: boolean;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; type: 'user' | 'bot' }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState<{ text: string; value: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const [conversationState, setConversationState] = useState<ConversationState>({
    currentFlow: 'greeting',
    previousFlow: null,
    userInfo: {
      name: null,
      email: null,
      phone: null,
      preferredProgram: null,
      experienceLevel: null
    },
    interactionCount: 0,
    leadQualified: false,
    readyForContact: false
  });

  // Conversation flows
  const conversationFlows = {
    greeting: {
      initial: "👋 Welcome to United Defense Tactical! I'm your virtual assistant. How can I help you today?",
      followUp: () => [
        { text: "Tell me about your training programs", value: "programs" },
        { text: "What makes UDT different?", value: "difference" },
        { text: "I want to book a free class", value: "free_class" },
        { text: "What does training cost?", value: "pricing" }
      ]
    },
    programs: {
      responses: [
        "Our training programs include:",
        "• Reality-based Firearms Training\n• Force on Force Simulations\n• Situational Awareness & Threat Assessment\n• Non-lethal Self Defense\n• Specialized Vehicle Defense\n• Active Shooter Response"
      ],
      followUp: () => [
        { text: "Tell me more about Force on Force", value: "force_on_force" },
        { text: "What's Reality-based training?", value: "reality_based" },
        { text: "I want to try a class", value: "free_class" },
        { text: "What do classes cost?", value: "pricing" }
      ]
    },
    difference: {
      responses: [
        "What makes UDT different is our instructors' real-world experience and our reality-based approach.",
        "Our lead instructors have military and law enforcement backgrounds with actual combat experience. We focus on practical scenarios you might encounter in real life, not just range shooting."
      ],
      followUp: () => [
        { text: "Tell me about your facility", value: "facility" },
        { text: "Can I try a class?", value: "free_class" },
        { text: "Who are the instructors?", value: "instructors" }
      ]
    },
    free_class: {
      responses: ["I'd be happy to help you book a free introductory class! First, could you tell me your name?"],
      beforeRespond: () => {
        return "That's a great choice! Our free intro class is the perfect way to experience our training approach.";
      }
    },
    get_name: {
      beforeRespond: function() {
        if (conversationState.userInfo.name) {
          return `Great, thanks ${conversationState.userInfo.name}! Now, what's your email address?`;
        }
        return null;
      }
    },
    get_email: {
      beforeRespond: function() {
        return "Perfect! And what's a good phone number to reach you?";
      }
    },
    get_phone: {
      beforeRespond: function() {
        return "Excellent! Almost done. Which training program interests you most?";
      },
      followUp: () => [
        { text: "Self-Defense Basics", value: "self_defense" },
        { text: "Firearms Training", value: "firearms" },
        { text: "Force on Force", value: "force_on_force" },
        { text: "Not sure yet", value: "undecided" }
      ]
    },
    get_program: {
      beforeRespond: function() {
        const program = conversationState.userInfo.preferredProgram;
        let response = "Great choice! ";
        
        if (program === "self_defense") {
          response += "Our Self-Defense program is perfect for learning essential protection skills.";
        } else if (program === "firearms") {
          response += "Our Firearms Training covers everything from basics to advanced tactical skills.";
        } else if (program === "force_on_force") {
          response += "Force on Force training will prepare you for real-world scenarios with realistic simulations.";
        } else {
          response += "No problem! Our instructors can help you find the right program.";
        }
        
        return response + " Last question: what's your experience level?";
      },
      followUp: () => [
        { text: "Complete Beginner", value: "beginner" },
        { text: "Some Experience", value: "intermediate" },
        { text: "Experienced", value: "advanced" }
      ]
    },
    confirmation: {
      responses: [
        "Thank you! We've scheduled your free introductory class. One of our instructors will contact you shortly to confirm the details.",
        "Is there anything specific you'd like to know before your first visit?"
      ],
      followUp: () => [
        { text: "What should I bring?", value: "what_to_bring" },
        { text: "Where are you located?", value: "location" },
        { text: "How long is the class?", value: "class_duration" },
        { text: "No more questions", value: "goodbye" }
      ]
    }
  };

  // Auto-open chat after 45 seconds if no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length === 0) {
        setIsOpen(true);
        startConversation();
      }
    }, 45000);

    return () => clearTimeout(timer);
  }, [messages]);

  // Scroll to bottom of chat whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, quickReplies]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      startConversation();
    }
  };

  const startConversation = () => {
    // Reset conversation state
    setConversationState({
      currentFlow: 'greeting',
      previousFlow: null,
      userInfo: {
        name: null,
        email: null,
        phone: null,
        preferredProgram: null,
        experienceLevel: null
      },
      interactionCount: 0,
      leadQualified: false,
      readyForContact: false
    });

    // Add initial greeting
    const greeting = conversationFlows.greeting.initial;
    addBotMessage(greeting);

    // Add quick reply options for greeting
    const options = conversationFlows.greeting.followUp();
    if (options) {
      setQuickReplies(options);
    }
  };

  const handleQuickReply = (text: string, value: string) => {
    // Add user message
    addUserMessage(text);
    
    // Clear quick replies
    setQuickReplies([]);
    
    // Process the selected flow
    processFlow(value);
  };

  const sendMessage = () => {
    if (message.trim()) {
      // Add user message
      addUserMessage(message);
      
      // Clear input
      setMessage('');
      
      // Show typing indicator
      setIsTyping(true);
      
      // Process message
      processMessage(message);
    }
  };

  const processMessage = (message: string) => {
    // Increment interaction count
    setConversationState(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1
    }));

    // Simulate processing time
    setTimeout(() => {
      setIsTyping(false);
      
      const currentFlow = conversationState.currentFlow;
      
      // Handle lead capture flow
      if (currentFlow === 'free_class') {
        // Store name
        setConversationState(prev => ({
          ...prev,
          userInfo: { ...prev.userInfo, name: message },
          currentFlow: 'get_email'
        }));
        
        // Process next flow
        processFlow('get_email');
      }
      else if (currentFlow === 'get_email') {
        // Validate and store email
        if (message.includes('@') && message.includes('.')) {
          setConversationState(prev => ({
            ...prev,
            userInfo: { ...prev.userInfo, email: message },
            currentFlow: 'get_phone'
          }));
          
          // Process next flow
          processFlow('get_phone');
        } else {
          addBotMessage("That doesn't look like a valid email address. Please provide a valid email so we can send you booking confirmation.");
        }
      }
      else if (currentFlow === 'get_phone') {
        // Store phone
        setConversationState(prev => ({
          ...prev,
          userInfo: { ...prev.userInfo, phone: message },
          currentFlow: 'get_program'
        }));
        
        // Process next flow
        processFlow('get_program');
      }
      else if (currentFlow === 'get_program' && !conversationState.userInfo.preferredProgram) {
        // Already handled via quick replies, but fallback handle text input
        processFlow('get_experience');
      }
      else if (currentFlow === 'get_experience' && !conversationState.userInfo.experienceLevel) {
        // Store experience and complete lead qualification
        setConversationState(prev => ({
          ...prev,
          userInfo: { ...prev.userInfo, experienceLevel: message },
          leadQualified: true,
          currentFlow: 'confirmation'
        }));
        
        // Process confirmation
        processFlow('confirmation');
      }
      else {
        // Handle non-specific user query with a fallback
        addBotMessage("I'm here to help! Would you like to learn more about our programs or book a free class?");
        
        setQuickReplies([
          { text: "Tell me about programs", value: "programs" },
          { text: "Book a free class", value: "free_class" }
        ]);
      }
    }, Math.random() * 500 + 500); // Random delay for natural feel
  };

  const processFlow = (flowName: string) => {
    if (!flowName || !conversationFlows[flowName as keyof typeof conversationFlows]) {
      console.error("Unknown flow:", flowName);
      return;
    }

    // Update conversation state
    setConversationState(prev => ({
      ...prev,
      previousFlow: prev.currentFlow,
      currentFlow: flowName
    }));

    const flow = conversationFlows[flowName as keyof typeof conversationFlows];

    // Call beforeRespond function if it exists
    if (flow.beforeRespond) {
      const customResponse = flow.beforeRespond();
      if (customResponse) {
        addBotMessage(customResponse);
      }
    }

    // Add responses for this flow
    if (flow.responses) {
      // For multiple responses, add them with delays between
      let delay = 0;
      flow.responses.forEach((response: string, index: number) => {
        setTimeout(() => {
          addBotMessage(response);

          // Add quick replies after the last response
          if (index === flow.responses.length - 1 && flow.followUp) {
            const options = flow.followUp();
            if (options) {
              setQuickReplies(options);
            }
          }
        }, delay);

        delay += Math.random() * 500 + 500; // Random delay between messages
      });
    }

    // If no responses but has followUp, add quick replies
    if (!flow.responses && flow.followUp) {
      const options = flow.followUp();
      if (options) {
        setQuickReplies(options);
      }
    }

    // If this is the confirmation step
    if (flowName === 'confirmation') {
      // We can trigger actual lead submission to CRM/backend here
      console.log("Lead submitted:", conversationState.userInfo);
    }
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { type: 'user', text }]);
  };

  const addBotMessage = (text: string) => {
    setIsTyping(false);
    setMessages(prev => [...prev, { type: 'bot', text }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="udt-chatbot">
      <button 
        className="chat-toggle" 
        onClick={toggleChat}
        aria-label="Chat with us"
      >
        <span className="chat-icon">💬</span>
      </button>

      <div className={`chat-container ${isOpen ? 'active' : ''}`}>
        <div className="chat-header">
          <h3>United Defense Tactical</h3>
          <button 
            className="chat-close" 
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        <div className="chat-messages" ref={chatMessagesRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}-message`}>
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
          
          {quickReplies.length > 0 && (
            <div className="quick-replies">
              {quickReplies.map((reply, index) => (
                <button 
                  key={index} 
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply(reply.text, reply.value)}
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            id="chat-input"
            placeholder="Ask a question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="chat-send"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot; 
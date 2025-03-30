
/**
 * United Defense Tactical - Enhanced Chatbot Implementation
 * Conversation-focused lead generation system
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

  // Get DOM elements
  const chatToggle = document.getElementById('chat-toggle');
  const chatContainer = document.getElementById('chat-container');
  const chatClose = document.getElementById('chat-close');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  // Conversation flow tracking
  let conversationState = {
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
  };

  // Convert all program names to lowercase for easier matching
  const programKeywords = {
    'handgun': 'Defensive Handgun',
    'pistol': 'Defensive Handgun',
    'defensive handgun': 'Defensive Handgun',
    'home': 'Home Defense Mastery',
    'house': 'Home Defense Mastery',
    'home defense': 'Home Defense Mastery',
    'home defense mastery': 'Home Defense Mastery',
    'tactical': 'Advanced Tactical',
    'advanced': 'Advanced Tactical',
    'advanced tactical': 'Advanced Tactical',
    'non-firearm': 'Non-Firearm Defense',
    'self-defense': 'Non-Firearm Defense',
    'hand-to-hand': 'Non-Firearm Defense',
    'non firearm defense': 'Non-Firearm Defense',
    'non-firearm defense': 'Non-Firearm Defense'
  };

  // Conversation flows
  const conversationFlows = {
    greeting: {
      initial: "Hi there! I'm the United Defense Tactical assistant. How can I help you today with firearms training or self-defense classes?",
      followUp: function() {
        return [
          {
            text: "Looking for training options",
            value: "programs"
          },
          {
            text: "Want to try a free class",
            value: "free_class"
          },
          {
            text: "Questions about pricing",
            value: "pricing"
          },
          {
            text: "Need location/hours info",
            value: "location"
          }
        ];
      }
    },

    pricing: {
      responses: [
        "Our training packages start at $149/month for our Basic Defense package. We also offer Tactical Defender ($249/month) and Elite Operator ($399/month) packages. All new members can try a free first class!",
        "Would you like to know more about what's included in each package, or would you prefer to schedule your free class to see our facility in person?"
      ],
      followUp: function() {
        return [
          {
            text: "Tell me what's included",
            value: "pricing_details"
          },
          {
            text: "Schedule a free class",
            value: "free_class"
          },
          {
            text: "Ask something else",
            value: "greeting"
          }
        ];
      }
    },

    pricing_details: {
      responses: [
        "Here's what each package includes:",
        "• Basic Defense ($149/mo): 2 weekly sessions, foundational skills, equipment provided, online resources",
        "• Tactical Defender ($249/mo): Unlimited sessions, scenario training, simulation range access, quarterly private lessons",
        "• Elite Operator ($399/mo): All Tactical features plus VIP scheduling, monthly private lessons, elite equipment, advanced force-on-force training",
        "Many members start with a free class to see which package best suits their needs. Would you like to schedule yours?"
      ],
      followUp: function() {
        return [
          {
            text: "Schedule free class",
            value: "free_class"
          },
          {
            text: "Ask about programs",
            value: "programs"
          },
          {
            text: "Ask something else",
            value: "greeting"
          }
        ];
      }
    },

    location: {
      responses: [
        "We're located at 160 S Old Springs Road #155, Anaheim Hills, CA 92808. Our facility features state-of-the-art training equipment and simulation areas.",
        "Our hours are:\n• Monday-Friday: 9:00 AM - 8:00 PM\n• Saturday: 9:00 AM - 6:00 PM\n• Sunday: 10:00 AM - 4:00 PM",
        "Would you like to schedule a visit to see our facility in person?"
      ],
      followUp: function() {
        return [
          {
            text: "Schedule a visit",
            value: "free_class"
          },
          {
            text: "Ask about programs",
            value: "programs"
          },
          {
            text: "Ask something else",
            value: "greeting"
          }
        ];
      }
    },

    programs: {
      responses: [
        "We offer several specialized training programs:",
        "• Defensive Handgun: Master proper handling, shooting techniques, and safety protocols",
        "• Home Defense Mastery: Learn strategies to protect your home and family",
        "• Advanced Tactical: Dynamic movement, multiple threat engagement, and stress-induced scenarios",
        "• Non-Firearm Defense: Hand-to-hand combat, threat de-escalation, and personal protection",
        "Which program interests you most?"
      ],
      followUp: function() {
        return [
          {
            text: "Defensive Handgun",
            value: "program_handgun"
          },
          {
            text: "Home Defense",
            value: "program_home"
          },
          {
            text: "Advanced Tactical",
            value: "program_tactical"
          },
          {
            text: "Non-Firearm Defense",
            value: "program_nongun"
          }
        ];
      }
    },

    program_handgun: {
      responses: [
        "Our Defensive Handgun program is perfect for both beginners and experienced shooters. You'll learn proper stance, grip, trigger control, sight alignment, and defensive shooting techniques.",
        "Classes include both classroom instruction and live-fire range time in our state-of-the-art facility.",
        "Would you like to experience this program with a free introductory class?"
      ],
      beforeRespond: function() {
        conversationState.userInfo.preferredProgram = "Defensive Handgun";
        return null;
      },
      followUp: function() {
        return [
          {
            text: "Schedule free class",
            value: "free_class"
          },
          {
            text: "Ask about experience needed",
            value: "experience"
          },
          {
            text: "Ask something else",
            value: "greeting"
          }
        ];
      }
    },

    program_home: {
      responses: [
        "Our Home Defense Mastery program teaches you how to protect what matters most. You'll learn tactical room clearing, defensive positioning, threat assessment, and legal considerations of home defense.",
        "Training includes simulated home layouts and realistic scenarios to prepare you for real-world situations.",
        "Would you like to experience this program with a free introductory class?"
      ],
      beforeRespond: function() {
        conversationState.userInfo.preferredProgram = "Home Defense Mastery";
        return null;
      },
      followUp: function() {
        return [
          {
            text: "Schedule free class",
            value: "free_class"
          },
          {
            text: "Ask about experience needed",
            value: "experience"
          },
          {
            text: "Ask something else",
            value: "greeting"
          }
        ];
      }
    },

    program_tactical: {
      responses: [
        "Our Advanced Tactical program is designed for those looking to take their skills to the next level. Created by special forces veterans, this program includes dynamic movement, multiple threat engagement, and stress-induced training scenarios.",
        "This program is ideal for experienced shooters looking for the next challenge.",
        "Would you like to experience this program with a free introductory class?"
      ],
      beforeRespond: function() {
        conversationState.userInfo.preferredProgram = "Advanced Tactical";
        return null;
      },
      followUp: function() {
        return [
          {
            text: "Schedule free class",
            value: "free_class"
          },
          {
            text: "Ask about experience needed",
            value: "experience"
          },
          {
            text: "Ask something else",
            value: "greeting"
          }
        ];
      }
    },

    program_nongun: {
      responses: [
        "Our Non-Firearm Defense program teaches effective hand-to-hand combat techniques, threat de-escalation, and personal protection strategies for everyday situations when a firearm isn't present or practical.",
        "Perfect for those who want comprehensive self-defense skills beyond firearms.",
        "Would you like to experience this program with a free introductory class?"
      ],
      beforeRespond: function() {
        conversationState.userInfo.preferredProgram = "Non-Firearm Defense";
        return null;
      },
      followUp: function() {
        return [
          {
            text: "Schedule free class",
            value: "free_class"
          },
          {
            text: "Ask about experience needed",
            value: "experience"
          },
          {
            text: "Ask something else",
            value: "greeting"
          }
        ];
      }
    },

    experience: {
      responses: [
        "No prior experience is needed! Our training programs are designed for all levels, from complete beginners to advanced practitioners.",
        "Our Level 1 classes cover all the essentials of safety and handling fundamentals. Many of our members had never handled a firearm before joining us.",
        "Would you like to try a free class to get started with no pressure?"
      ],
      followUp: function() {
        return [
          {
            text: "Schedule free class",
            value: "free_class"
          },
          {
            text: "Ask about equipment",
            value: "equipment"
          },
          {
            text: "Ask something else",
            value: "greeting"
          }
        ];
      }
    },

    equipment: {
      responses: [
        "For beginner classes, we provide all necessary equipment, including firearms, holsters, and safety gear. You don't need to bring anything except comfortable clothing.",
        "As you advance, you may prefer to use your own equipment, but it's never required. For specialized courses, we'll provide a detailed equipment list ahead of time.",
        "Ready to try a free class with all equipment provided?"
      ],
      followUp: function() {
        return [
          {
            text: "Schedule free class",
            value: "free_class"
          },
          {
            text: "Ask about pricing",
            value: "pricing"
          },
          {
            text: "Ask something else",
            value: "greeting"
          }
        ];
      }
    },

    free_class: {
      responses: [
        "Great choice! Our free introductory class is the perfect way to experience our training approach with zero risk or obligation.",
        "To schedule your free class, I just need a few quick details from you. What's your name?"
      ],
      followUp: function() {
        return null; // This flow expects text input for the name
      }
    },

    get_name: {
      process: function(message) {
        // Save the name
        conversationState.userInfo.name = message;
        return {
          response: `Thanks, ${message}! What's the best email address to reach you?`,
          nextFlow: "get_email"
        };
      }
    },

    get_email: {
      process: function(message) {
        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(message)) {
          return {
            response: "That email address doesn't look quite right. Could you please provide a valid email?",
            nextFlow: "get_email"
          };
        }

        // Save the email
        conversationState.userInfo.email = message;
        return {
          response: "Perfect! What's the best phone number to reach you for scheduling?",
          nextFlow: "get_phone"
        };
      }
    },

    get_phone: {
      process: function(message) {
        // Basic phone validation (remove non-digits and check length)
        const phoneDigits = message.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
          return {
            response: "I need a complete phone number to reach you. Please provide a 10-digit phone number.",
            nextFlow: "get_phone"
          };
        }

        // Save the phone number
        conversationState.userInfo.phone = message;

        // If we already know their preferred program, skip to experience level
        if (conversationState.userInfo.preferredProgram) {
          return {
            response: `Great! I see you're interested in our ${conversationState.userInfo.preferredProgram} program. What's your experience level with firearms or self-defense training?`,
            nextFlow: "get_experience"
          };
        } else {
          return {
            response: "Which of our training programs are you most interested in?\n• Defensive Handgun\n• Home Defense Mastery\n• Advanced Tactical\n• Non-Firearm Defense",
            nextFlow: "get_program"
          };
        }
      }
    },

    get_program: {
      process: function(message) {
        // Try to match the program from their message
        const lowerMessage = message.toLowerCase();
        let matchedProgram = null;

        for (const keyword in programKeywords) {
          if (lowerMessage.includes(keyword)) {
            matchedProgram = programKeywords[keyword];
            break;
          }
        }

        if (!matchedProgram) {
          if (lowerMessage.includes("all") || lowerMessage.includes("not sure")) {
            matchedProgram = "All Programs";
          } else {
            return {
              response: "I didn't quite catch which program you're interested in. Please choose from: Defensive Handgun, Home Defense Mastery, Advanced Tactical, or Non-Firearm Defense.",
              nextFlow: "get_program"
            };
          }
        }

        // Save the program preference
        conversationState.userInfo.preferredProgram = matchedProgram;

        return {
          response: "What's your experience level with firearms or self-defense training?",
          nextFlow: "get_experience"
        };
      }
    },

    get_experience: {
      process: function(message) {
        // Save their experience level
        conversationState.userInfo.experienceLevel = message;
        conversationState.leadQualified = true;

        // Prepare submission data
        const leadData = {
          name: conversationState.userInfo.name,
          email: conversationState.userInfo.email,
          phone: conversationState.userInfo.phone,
          program: conversationState.userInfo.preferredProgram,
          experience: conversationState.userInfo.experienceLevel,
          source: "Chatbot",
          timestamp: new Date().toISOString()
        };

        // In a real implementation, you would send this data to your CRM or email system
        console.log("Lead generated:", leadData);

        // Store lead in localStorage for demo purposes
        const existingLeads = JSON.parse(localStorage.getItem('udtLeads') || '[]');
        existingLeads.push(leadData);
        localStorage.setItem('udtLeads', JSON.stringify(existingLeads));

        // Track event if analytics is available
        if (window.dataLayer) {
          window.dataLayer.push({
            'event': 'lead_generated',
            'leadSource': 'chatbot',
            'leadProgram': conversationState.userInfo.preferredProgram
          });
        }

        return {
          response: `Thanks for providing your information, ${conversationState.userInfo.name}! One of our instructors will contact you within 24 hours to schedule your free class in our ${conversationState.userInfo.preferredProgram} program. Is there anything specific you'd like the instructor to know before they call?`,
          nextFlow: "confirmation"
        };
      }
    },

    confirmation: {
      process: function(message) {
        return {
          response: "Perfect! We've added your note to your profile. Our team is excited to meet you and help you achieve your training goals. If you have any other questions before your call, feel free to ask me anytime!",
          nextFlow: "post_signup"
        };
      }
    },

    post_signup: {
      responses: [
        "While you wait for your call, would you like to learn more about any of our programs or services?",
      ],
      followUp: function() {
        return [
          {
            text: "Learn about instructors",
            value: "instructors"
          },
          {
            text: "Location info",
            value: "location"
          },
          {
            text: "Training process",
            value: "process"
          },
          {
            text: "No thanks, I'm good",
            value: "goodbye"
          }
        ];
      }
    },

    instructors: {
      responses: [
        "Our elite instructor team is led by Casey Forester and Ty Kern, both with extensive military and tactical experience.",
        "Casey is a former special operations team leader with 20+ years of experience, while Ty brings 40+ years of martial arts expertise and is a certified firearms instructor.",
        "We also have specialized instructors like Sarah Martinez who focuses on defensive tactics and women's self-defense.",
        "You'll meet your assigned instructor during your free class!"
      ],
      followUp: function() {
        return [
          {
            text: "Ask about women's classes",
            value: "women_classes"
          },
          {
            text: "Training process",
            value: "process"
          },
          {
            text: "No more questions",
            value: "goodbye"
          }
        ];
      }
    },

    women_classes: {
      responses: [
        "Yes! We offer women-only classes led by our female instructors, including Sarah Martinez who specializes in women's self-defense.",
        "These classes cover the same curriculum as our standard classes but in an environment many women find more comfortable when first learning.",
        "Our Women's Defensive Academy meets twice weekly and is very popular. Many women start here before joining our integrated classes."
      ],
      followUp: function() {
        if (conversationState.leadQualified) {
          return [
            {
              text: "Ask about training process",
              value: "process"
            },
            {
              text: "No more questions",
              value: "goodbye"
            }
          ];
        } else {
          return [
            {
              text: "Schedule free class",
              value: "free_class"
            },
            {
              text: "Ask about training process",
              value: "process"
            },
            {
              text: "No more questions",
              value: "goodbye"
            }
          ];
        }
      }
    },

    process: {
      responses: [
        "Our training follows a clear 8-level system that takes you from beginner to elite-level defensive skills:",
        "1. Fundamentals: Master essential safety and handling",
        "2. Defensive: Develop core protection techniques",
        "3. Tactical: Learn advanced positioning skills",
        "4. Scenario: Practice in realistic simulations",
        "5. Advanced: Execute complex defense strategies",
        "6. Mastery: Achieve expert-level certification",
        "This structured approach ensures measurable progress at every stage!"
      ],
      followUp: function() {
        if (conversationState.leadQualified) {
          return [
            {
              text: "No more questions",
              value: "goodbye"
            }
          ];
        } else {
          return [
            {
              text: "Schedule free class",
              value: "free_class"
            },
            {
              text: "No more questions",
              value: "goodbye"
            }
          ];
        }
      }
    },

    goodbye: {
      responses: [
        "Thank you for chatting with United Defense Tactical! We're looking forward to helping you achieve your training goals.",
        "If you have any other questions before your class, feel free to visit our website or call us at (657) 276-0457.",
        "Stay safe!"
      ],
      followUp: function() {
        return null;
      }
    }
  };

  // Toggle chat open/closed
  chatToggle.addEventListener('click', function() {
    chatContainer.style.display = chatContainer.style.display === 'flex' ? 'none' : 'flex';
    if (chatContainer.style.display === 'flex') {
      // If no messages, add initial greeting
      if (chatMessages.children.length === 0) {
        startConversation();
      }
      chatInput.focus();
    }
  });

  // Start a new conversation
  function startConversation() {
    // Reset conversation state
    conversationState = {
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
    };

    // Add initial greeting
    const greeting = conversationFlows.greeting.initial;
    addBotMessage(greeting);

    // Add quick reply options for greeting
    const options = conversationFlows.greeting.followUp();
    if (options) {
      addQuickReplies(options);
    }
  }

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

  // Handle quick reply button clicks
  function handleQuickReply(flow) {
    // Remove quick replies
    const quickRepliesContainer = document.querySelector('.quick-replies');
    if (quickRepliesContainer) {
      quickRepliesContainer.remove();
    }

    // Process the selected flow
    processFlow(flow);
  }

  // Add quick reply buttons
  function addQuickReplies(options) {
    // Create container for quick replies if it doesn't exist
    let quickRepliesContainer = document.querySelector('.quick-replies');
    if (quickRepliesContainer) {
      quickRepliesContainer.remove();
    }

    quickRepliesContainer = document.createElement('div');
    quickRepliesContainer.classList.add('quick-replies');

    // Add each option as a button
    options.forEach(option => {
      const button = document.createElement('button');
      button.classList.add('quick-reply-btn');
      button.textContent = option.text;
      button.addEventListener('click', function() {
        // Add user's selection as a message
        addUserMessage(option.text);

        // Handle the selected option
        handleQuickReply(option.value);
      });

      quickRepliesContainer.appendChild(button);
    });

    // Add quick replies to chat
    chatMessages.appendChild(quickRepliesContainer);
    scrollToBottom();
  }

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

      // Process the message
      processMessage(message);
    }
  }

  // Process user message and determine next step
  function processMessage(message) {
    // Increment interaction count
    conversationState.interactionCount++;

    // Check if we're in a flow that needs to process user input
    const currentFlow = conversationState.currentFlow;

    // If in lead collection mode (get_name, get_email, etc.)
    if (currentFlow.startsWith('get_') || currentFlow === 'confirmation') {
      const flowHandler = conversationFlows[currentFlow];
      if (flowHandler && flowHandler.process) {
        const result = flowHandler.process(message);

        // Simulate response delay
        setTimeout(() => {
          addBotMessage(result.response);

          // Transition to next flow
          processFlow(result.nextFlow);
        }, Math.random() * 500 + 500);

        return;
      }
    }

    // Handle general user messages with keyword detection
    setTimeout(() => {
      const lowerMessage = message.toLowerCase();

      // Search for keywords to determine intent
      if (currentFlow !== 'free_class' && !currentFlow.startsWith('get_')) {
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || 
            lowerMessage.includes('how much') || lowerMessage.includes('expensive')) {
          processFlow('pricing');
        }
        else if (lowerMessage.includes('location') || lowerMessage.includes('address') || 
                lowerMessage.includes('where') || lowerMessage.includes('facility')) {
          processFlow('location');
        }
        else if (lowerMessage.includes('class') || lowerMessage.includes('program') || 
                lowerMessage.includes('training') || lowerMessage.includes('learn')) {
          processFlow('programs');
        }
        else if (lowerMessage.includes('free') || lowerMessage.includes('try') || 
                lowerMessage.includes('first time') || lowerMessage.includes('sign up') || 
                lowerMessage.includes('register') || lowerMessage.includes('join')) {
          processFlow('free_class');
        }
        else if (lowerMessage.includes('experience') || lowerMessage.includes('beginner') || 
                lowerMessage.includes('never') || lowerMessage.includes('first time')) {
          processFlow('experience');
        }
        else if (lowerMessage.includes('equipment') || lowerMessage.includes('bring') || 
                lowerMessage.includes('gun') || lowerMessage.includes('firearm') || 
                lowerMessage.includes('need')) {
          processFlow('equipment');
        }
        else if (lowerMessage.includes('instructor') || lowerMessage.includes('teacher') || 
                lowerMessage.includes('staff') || lowerMessage.includes('who')) {
          processFlow('instructors');
        }
        else if (lowerMessage.includes('women') || lowerMessage.includes('female') || 
                lowerMessage.includes('lady') || lowerMessage.includes('ladies')) {
          processFlow('women_classes');
        }
        else if (lowerMessage.includes('level') || lowerMessage.includes('progress') || 
                lowerMessage.includes('advance') || lowerMessage.includes('step')) {
          processFlow('process');
        }
        else if (lowerMessage.includes('thank') || lowerMessage.includes('bye') || 
                lowerMessage.includes('goodbye') || lowerMessage.includes('later')) {
          processFlow('goodbye');
        }
        else if (conversationState.leadQualified) {
          // If they're already qualified, guide them to additional information
          processFlow('post_signup');
        }
        else {
          // Default response for unrecognized input - guide them back to main options
          addBotMessage("I'm here to help you with firearms and self-defense training information. What specific aspect are you interested in learning more about?");

          // Provide quick reply options to guide conversation
          const options = [
            {
              text: "Training programs",
              value: "programs"
            },
            {
              text: "Free class",
              value: "free_class"
            },
            {
              text: "Pricing",
              value: "pricing"
            },
            {
              text: "Location info",
              value: "location"
            }
          ];

          addQuickReplies(options);
        }
      } else {
        // If in free_class flow, move to get_name
        if (currentFlow === 'free_class') {
          processFlow('get_name');
        }
      }
    }, Math.random() * 500 + 500);
  }

  // Process a specific conversation flow
  function processFlow(flowName) {
    if (!flowName || !conversationFlows[flowName]) {
      console.error("Unknown flow:", flowName);
      return;
    }

    // Update conversation state
    conversationState.previousFlow = conversationState.currentFlow;
    conversationState.currentFlow = flowName;

    const flow = conversationFlows[flowName];

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
      flow.responses.forEach((response, index) => {
        setTimeout(() => {
          addBotMessage(response);

          // Add quick replies after the last response
          if (index === flow.responses.length - 1 && flow.followUp) {
            const options = flow.followUp();
            if (options) {
              addQuickReplies(options);
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
        addQuickReplies(options);
      }
    }

    // If this is a lead generation endpoint and user isn't qualified yet
    if (flowName === 'free_class' && !conversationState.leadQualified) {
      // We'll wait for user to respond with their name
      // The response will be handled in processMessage
    }

    // Lead follow-up prompt if qualified but not pushed to conversion yet
    if (conversationState.leadQualified && 
        conversationState.interactionCount > 5 && 
        !['free_class', 'get_name', 'get_email', 'get_phone', 'get_program', 
          'get_experience', 'confirmation', 'goodbye'].includes(flowName)) {

      setTimeout(() => {
        addBotMessage("By the way, one of our instructors will be contacting you soon. Is there anything specific you'd like them to know or prepare for your first session?");
      }, 2000);
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

  // Auto-open chat after 45 seconds if no interaction
  setTimeout(() => {
    if (chatMessages.children.length === 0) {
      chatToggle.click();
    }
  }, 45000);
});

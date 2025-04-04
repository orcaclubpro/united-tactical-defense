import React, { useState } from 'react';
import './FAQ.scss';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: "Do I need any experience with firearms to take classes?",
    answer: "No, our training programs are designed for all experience levels. We offer classes specifically for beginners with no prior experience, where safety and fundamentals are thoroughly covered before advancing to practical skills.",
    category: "General"
  },
  {
    id: 2,
    question: "Are real firearms used in your facility?",
    answer: "No, there are no real firearms involved in our facility. We use state-of-the-art simulation technology that provides realistic training experiences without the risks associated with live firearms.",
    category: "Safety"
  },
  {
    id: 3,
    question: "Do I need to bring my own equipment?",
    answer: "All necessary training equipment is provided for our classes. This is especially helpful for beginners who don't yet own personal equipment. We ensure everyone has access to the tools needed for effective training.",
    category: "Equipment"
  },
  {
    id: 4,
    question: "How often should I train to maintain proficiency?",
    answer: "For maintaining proficiency, we suggest training at least 2 times a month. Consistent practice is essential for developing and retaining muscle memory and tactical skills.",
    category: "Training"
  },
  {
    id: 5,
    question: "Do you offer private training sessions?",
    answer: "We do not offer one-on-one classes. Instead, we maintain small group training sessions with a maximum of 5 people per class. This format provides personalized attention while also allowing for important group interaction and scenario practice.",
    category: "Training"
  },
  {
    id: 6,
    question: "What qualifications do your instructors have?",
    answer: "Our instructors come from military and law enforcement backgrounds with extensive experience in tactical operations. They hold multiple certifications in firearms instruction, tactical training, and adult education. Many have combat experience and have served in specialized units.",
    category: "Instructors"
  },
  {
    id: 7,
    question: "Is there an age requirement for training?",
    answer: "Yes, participants must be at least 18 years old for all our classes. We do not currently offer youth programs or training for minors.",
    category: "General"
  },
  {
    id: 8,
    question: "Do you offer any specialized courses for women?",
    answer: "Yes, we offer women-specific courses taught by our female instructors that focus on the unique aspects of self-defense for women. These classes provide a supportive environment while covering all essential defensive skills.",
    category: "Training"
  }
];

// Categories for filtering
const categories = ["All", ...Array.from(new Set(faqItems.map(item => item.category)))];

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openItems, setOpenItems] = useState<number[]>([]);
  
  const toggleItem = (id: number) => {
    if (openItems.includes(id)) {
      setOpenItems(openItems.filter(item => item !== id));
    } else {
      setOpenItems([...openItems, id]);
    }
  };
  
  const filteredItems = activeCategory === "All" 
    ? faqItems 
    : faqItems.filter(item => item.category === activeCategory);
  
  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <header className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Answers to common questions about our training programs</p>
        </header>
        
        <div className="faq-categories">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${category === activeCategory ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="faq-container">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className={`faq-item ${openItems.includes(item.id) ? 'open' : ''}`}
            >
              <button 
                className="faq-question"
                onClick={() => toggleItem(item.id)}
                aria-expanded={openItems.includes(item.id)}
              >
                {item.question}
                <span className="toggle-icon"></span>
              </button>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="faq-cta">
          <p>Don't see your question here?</p>
          <a href="#contact" className="btn btn-primary">Contact Us</a>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 
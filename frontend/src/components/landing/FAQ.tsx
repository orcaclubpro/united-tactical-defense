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
    question: "What safety protocols do you have in place?",
    answer: "Safety is our top priority. We have a comprehensive safety protocol that includes proper firearms handling, thorough equipment checks, clear range commands, qualified supervision, and mandatory safety briefings before every class. Our instructor-to-student ratio ensures personalized attention and safe training.",
    category: "General"
  },
  {
    id: 3,
    question: "Do I need to bring my own firearm?",
    answer: "While you're welcome to train with your own firearm (subject to our safety inspection), we provide all necessary equipment for our classes, including firearms, holsters, and safety gear. This is especially helpful for beginners who don't yet own personal equipment.",
    category: "Equipment"
  },
  {
    id: 4,
    question: "How often should I train to maintain proficiency?",
    answer: "For maintaining basic proficiency, we recommend training at least 2 times a month. For those seeking to build and advance their skills, weekly training sessions provide the consistency needed for developing muscle memory and tactical proficiency.",
    category: "Training"
  },
  {
    id: 5,
    question: "Do you offer private training sessions?",
    answer: "No one-on-one classes, but it is small groups with a max of 5 people per class.",
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
    answer: "Age requirement is 18+ we do not have youth programs.",
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
import React, { useState } from "react";
import "./FAQ.scss";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    id: 0,
    question: "Are there any real firearms at the training center?",
    answer:
      "No, we are a dry facility. We do not use real firearms in any of our training programs. All equipment used for training is specifically designed for tactical simulation without the use of live ammunition.",
    category: "General",
  },
  {
    id: 1,
    question: "Do I need any experience with firearms to take classes?",
    answer:
      "No, our training programs are designed for all experience levels. We offer classes specifically for beginners with no prior experience, where safety and fundamentals are thoroughly covered before advancing to practical skills.",
    category: "General",
  },
  {
    id: 4,
    question: "How often should I train to maintain proficiency?",
    answer:
      "For optimal skill development and maintenance, we recommend the following training frequency:\n\n" +
      "• Basic Proficiency: 2-3 sessions per month\n" +
      "• Intermediate Level: 3-4 sessions per month\n" +
      "• Advanced Training: 4+ sessions per month\n\n" +
      "Consistency is key to developing muscle memory and tactical proficiency. Our flexible scheduling allows you to choose the frequency that best fits your goals and availability. Many of our students combine regular group classes with private sessions for accelerated progress.",
    category: "Training",
  },
  {
    id: 5,
    question: "Do you offer private training sessions?",
    answer:
      "We offer small group classes with a maximum of 5 people per class to ensure personalized attention and quality instruction.",
    category: "Training",
  },
  {
    id: 6,
    question: "What qualifications do your instructors have?",
    answer:
      "Our instructors come from military and law enforcement backgrounds with extensive experience in tactical operations. They hold multiple certifications in firearms instruction, tactical training, and adult education. Many have combat experience and have served in specialized units.",
    category: "Instructors",
  },
  {
    id: 7,
    question: "Is there an age requirement for training?",
    answer: "Age requirement is 18+ we do not have youth programs.",
    category: "General",
  },
  {
    id: 8,
    question: "Do you offer any specialized courses for women?",
    answer:
      "Yes, we offer women-specific courses taught by our female instructors that focus on the unique aspects of self-defense for women. These classes provide a supportive environment while covering all essential defensive skills.",
    category: "Training",
  },
];

// Categories for filtering
const categories = [
  "All",
  ...Array.from(new Set(faqItems.map((item) => item.category))),
];

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    if (openItems.includes(id)) {
      setOpenItems(openItems.filter((item) => item !== id));
    } else {
      setOpenItems([...openItems, id]);
    }
  };

  const filteredItems =
    activeCategory === "All"
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <header className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Answers to common questions about our training programs</p>
        </header>

        <div className="faq-categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${category === activeCategory ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="faq-container">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`faq-item ${openItems.includes(item.id) ? "open" : ""}`}
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
      </div>
    </section>
  );
};

export default FAQ;

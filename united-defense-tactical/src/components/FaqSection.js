
import React, { useState } from 'react';

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "Do I need to have any prior experience with firearms?",
      answer: "Absolutely not. Our training programs are designed for all experience levels, from complete beginners to advanced shooters. Our Level 1 classes assume no prior knowledge and start with essential safety and handling fundamentals. Our instructors are expert at working with first-time shooters."
    },
    {
      question: "Do I need to bring my own firearm or equipment?",
      answer: "For beginner classes, we provide all necessary equipment, including firearms, holsters, and safety gear. As you advance in your training, you may prefer to use your own equipment, but it's never required. For specialized courses, we'll provide a detailed equipment list ahead of time."
    },
    {
      question: "How long does it take to become proficient?",
      answer: "Most students develop solid foundational skills within 2-3 months of consistent training (at least once per week). Becoming truly proficient takes approximately 6 months of dedicated practice. Our structured 8-level program ensures clear progression and skill development benchmarks at each stage."
    },
    {
      question: "Is the training physically demanding?",
      answer: "Our programs accommodate various fitness levels. Basic classes focus on fundamental skills with minimal physical demands. Advanced training incorporates more movement and stress-induced scenarios. We can modify exercises based on your physical capabilities while still providing valuable training."
    },
    {
      question: "Can I upgrade my membership later?",
      answer: "Yes, you can upgrade your membership at any time. The difference in price will be prorated based on your current subscription. Many members start with the Basic Defense package and upgrade as they advance in their skills and want access to more specialized training."
    },
    {
      question: "Do you offer women-only classes?",
      answer: "Yes, we offer women-only classes led by our female instructors. These classes cover the same curriculum as our standard classes but in an environment many women find more comfortable, especially when first learning firearms and self-defense skills. Our Women's Defensive Academy meets twice weekly."
    }
  ];

  return (
    <section className="faq-section">
      <div className="container">
        <header className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know before starting your training</p>
        </header>
        
        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFaq(index)}>
                {item.question} <span>{activeIndex === index ? '-' : '+'}</span>
              </div>
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

export default FaqSection;

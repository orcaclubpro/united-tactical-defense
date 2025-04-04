import React, { useState, useEffect } from 'react';
import './Programs.scss';

interface Program {
  id: number;
  title: string;
  description: string;
  features: string[];
  image: string;
  level: string;
}

const programsData: Program[] = [
  {
    id: 1,
    title: "Firearm Simulator Training",
    description: "Experience realistic scenarios in our state-of-the-art simulator. Perfect your technique in a controlled environment.",
    features: [
      "Virtual scenarios from basic to complex",
      "Instant feedback on accuracy and timing",
      "Stress response training",
      "Decision-making under pressure"
    ],
    image: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    level: "All Levels"
  },
  {
    id: 2,
    title: "Self Defense Training",
    description: "Learn practical self-defense techniques that work in real-world situations for all skill levels.",
    features: [
      "Hand-to-hand combat fundamentals",
      "Situational awareness",
      "Threat assessment strategies",
      "Escape and evasion tactics"
    ],
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    level: "All Levels"
  },
  {
    id: 3,
    title: "UDT Indoor Range",
    description: "Practice with expert guidance at our state-of-the-art indoor shooting range with multiple lanes and training areas.",
    features: [
      "Climate-controlled environment",
      "Multiple shooting distances",
      "Target analysis systems",
      "One-on-one instruction available"
    ],
    image: "https://images.unsplash.com/photo-1550358864-518f202c02ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    level: "All Levels"
  },
  {
    id: 4,
    title: "Workshops",
    description: "Specialized training workshops focused on specific skills and scenarios, from beginners to advanced practitioners.",
    features: [
      "Weekend intensives",
      "Guest instructor series",
      "Specialized equipment training",
      "Certification preparation"
    ],
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    level: "Varies"
  },
  {
    id: 5,
    title: "CCW Program",
    description: "Complete training for Concealed Carry Weapon permit applicants, covering legal requirements, safety, and practical skills.",
    features: [
      "Legal requirements and responsibilities",
      "Concealed carry techniques and holster selection",
      "Defensive shooting scenarios",
      "CCW application assistance"
    ],
    image: "https://images.unsplash.com/photo-1584552517218-5a35154a4b17?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    level: "Beginner to Intermediate"
  }
];

const Programs: React.FC = () => {
  const [activeProgram, setActiveProgram] = useState<number>(0);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  
  // Auto-rotate through programs every 5 seconds if autoScroll is true
  useEffect(() => {
    if (!autoScroll) return;
    
    const interval = setInterval(() => {
      setActiveProgram((prev) => (prev + 1) % programsData.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoScroll]);

  // Pause auto-scroll when user interacts with programs
  const handleProgramClick = (index: number) => {
    setActiveProgram(index);
    setAutoScroll(false);
    // Resume auto-scroll after 15 seconds of inactivity
    setTimeout(() => setAutoScroll(true), 15000);
  };
  
  return (
    <section id="programs" className="programs-section">
      <div className="container">
        <header className="section-header">
          <div className="badge">SKILL DEVELOPMENT</div>
          <h2>Training <span className="highlight">Programs</span></h2>
          <p>Comprehensive training tailored to your experience level and goals</p>
        </header>
        
        <div className="programs-carousel">
          <div className="carousel-container">
            <div 
              className="carousel-track" 
              style={{ transform: `translateX(-${activeProgram * 100}%)` }}
            >
              {programsData.map((program) => (
                <div key={program.id} className="carousel-card">
                  <div className="carousel-card-image">
                    <img src={program.image} alt={program.title} />
                    <div className="program-level">{program.level}</div>
                  </div>
                  <div className="carousel-card-content">
                    <h3>{program.title}</h3>
                    <p>{program.description}</p>
                    <div className="program-features">
                      <h4>What You'll Learn:</h4>
                      <ul>
                        {program.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    <a href="#training-assessment" className="btn btn-primary">Learn More</a>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className="carousel-control prev" 
              onClick={() => handleProgramClick((activeProgram - 1 + programsData.length) % programsData.length)}
              aria-label="Previous program"
            >
              &#10094;
            </button>
            <button 
              className="carousel-control next" 
              onClick={() => handleProgramClick((activeProgram + 1) % programsData.length)}
              aria-label="Next program"
            >
              &#10095;
            </button>
          </div>
          
          <div className="carousel-pagination">
            {programsData.map((_, index) => (
              <button 
                key={index} 
                className={`pagination-dot ${index === activeProgram ? 'active' : ''}`}
                onClick={() => handleProgramClick(index)}
                aria-label={`View program ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs; 
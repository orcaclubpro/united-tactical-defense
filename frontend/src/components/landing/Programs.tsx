import React, { useState, useEffect, useRef } from 'react';
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
    image: "/assets/images/firearmsim.JPG",
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
    image: "/assets/images/selfdefense.jpeg",
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
    image: "/assets/images/udtrange.JPG",
    level: "All Levels"
  },
  {
    id: 4,
    title: "Tactical Medicine",
    description: "Learn essential medical skills for emergency situations, from basic first aid to advanced trauma care.",
    features: [
      "Emergency response protocols",
      "Trauma care techniques",
      "Medical kit preparation",
      "Scenario-based training"
    ],
    image: "/assets/images/tactical-medicine.jpg",
    level: "All Levels"
  },
  {
    id: 5,
    title: "USCCA Legal Seminars",
    description: "Comprehensive legal education for responsible gun ownership and self-defense situations.",
    features: [
      "Legal rights and responsibilities",
      "Self-defense law",
      "Case study analysis",
      "Legal protection strategies"
    ],
    image: "/assets/images/legal-seminar.jpg",
    level: "All Levels"
  },
  {
    id: 6,
    title: "Vehicle CQB",
    description: "Master close-quarters combat techniques specifically designed for vehicle-based scenarios.",
    features: [
      "Vehicle entry and exit tactics",
      "Limited space combat",
      "Vehicle-based defensive strategies",
      "Emergency response protocols"
    ],
    image: "/assets/images/vehicle-cqb.jpg",
    level: "Intermediate to Advanced"
  },
  {
    id: 7,
    title: "Women's Urban Threats",
    description: "Specialized training program designed to address common urban threats faced by women.",
    features: [
      "Situational awareness",
      "Personal safety strategies",
      "Defensive techniques",
      "Emergency response planning"
    ],
    image: "/assets/images/womens-defense.jpg",
    level: "All Levels"
  },
  {
    id: 8,
    title: "Home Defense",
    description: "Learn comprehensive strategies for protecting your home and family in emergency situations.",
    features: [
      "Home security assessment",
      "Defensive positioning",
      "Family safety protocols",
      "Emergency response planning"
    ],
    image: "/assets/images/home-defense.jpg",
    level: "All Levels"
  },
  {
    id: 9,
    title: "Firearm Familiarization",
    description: "Perfect for beginners, learn the fundamentals of firearm safety and operation.",
    features: [
      "Firearm safety rules",
      "Basic marksmanship",
      "Equipment familiarization",
      "Range etiquette"
    ],
    image: "/assets/images/firearm-basics.jpg",
    level: "Beginner"
  }
];

const Programs: React.FC = () => {
  const [activeProgram, setActiveProgram] = useState<number>(0);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
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

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setAutoScroll(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const minSwipeDistance = 50;
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped right - go to previous
        handleProgramClick((activeProgram - 1 + programsData.length) % programsData.length);
      } else {
        // Swiped left - go to next
        handleProgramClick((activeProgram + 1) % programsData.length);
      }
    }
    
    // Resume auto-scroll after 15 seconds
    setTimeout(() => setAutoScroll(true), 15000);
  };

  const openFreeClassModal = () => {
    const openModalButton = document.getElementById('open-free-class-modal');
    if (openModalButton) {
      openModalButton.click();
    }
  };
  
  return (
    <section id="programs" className="programs-section">
      <div className="container">
        <header className="section-header">
          <div className="badge">SKILL DEVELOPMENT</div>
          <h2>Training <span className="highlight">Programs</span></h2>
          <p>Comprehensive training tailored to your experience level and goals</p>
          <div className="slide-counter">
            {activeProgram + 1} / {programsData.length}
          </div>
        </header>
        
        <div className="programs-carousel">
          <div 
            className="carousel-container"
            ref={carouselRef}
          >
            <div 
              className="carousel-track" 
              style={{ transform: `translateX(-${activeProgram * 100}%)` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {programsData.map((program) => (
                <div key={program.id} className="carousel-card">
                  <div className="carousel-card-image">
                    <img src={program.image} alt={program.title} loading="lazy" />
                    <div className="program-level">{program.level}</div>
                  </div>
                  <div className="carousel-card-content">
                    <h3>{program.title}</h3>
                    <p>{program.description}</p>
                    <div className="program-features">
                      <h4>Key Features</h4>
                      <ul>
                        {program.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    <button onClick={openFreeClassModal} className="btn btn-primary">
                      Book Free Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="carousel-controls">
            <button 
              className="carousel-control prev"
              onClick={() => handleProgramClick((activeProgram - 1 + programsData.length) % programsData.length)}
              aria-label="Previous program"
            >
              ‹
            </button>
            <button 
              className="carousel-control next"
              onClick={() => handleProgramClick((activeProgram + 1) % programsData.length)}
              aria-label="Next program"
            >
              ›
            </button>
          </div>
          
          <div className="carousel-pagination">
            {programsData.map((_, index) => (
              <button
                key={index}
                className={`pagination-dot ${index === activeProgram ? 'active' : ''}`}
                onClick={() => handleProgramClick(index)}
                aria-label={`Go to program ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs; 
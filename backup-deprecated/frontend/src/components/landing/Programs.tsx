import React, { useState } from 'react';
import { placeholderImages } from '../../utils/placeholderImages';
import logo from '../../assets/images/logo.png';
import './Programs.scss';

interface Program {
  id: number;
  title: string;
  description: string;
  features: string[];
  image: string;
  targetAudience: string;
  level: string;
  icon: React.ReactNode;
}

const programsData: Program[] = [
  {
    id: 1,
    title: "Simulator Training",
    description: "Experience realistic scenario-based training in our state-of-the-art simulator without using real firearms.",
    features: [
      "Realistic scenario immersion",
      "Decision-making under pressure",
      "Force escalation/de-escalation",
      "After-action performance review"
    ],
    image: placeholderImages.programFundamentals,
    targetAudience: "All experience levels, from beginners to experienced shooters",
    level: "All Levels",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 2,
    title: "Self Defense",
    description: "Learn practical hand-to-hand combat and defensive techniques for real-world situations.",
    features: [
      "Situational awareness",
      "Hand-to-hand combat techniques",
      "Defensive tactics against common attacks",
      "Escape and evasion strategies"
    ],
    image: placeholderImages.programDefensive,
    targetAudience: "Anyone seeking personal protection skills regardless of physical ability",
    level: "All Levels",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 20C18 17.2386 15.3137 15 12 15C8.68629 15 6 17.2386 6 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 3,
    title: "Indoor Range",
    description: "Practice your skills in our controlled indoor environment with expert instruction and feedback.",
    features: [
      "Controlled training environment",
      "Personalized coaching",
      "Progressive skill development",
      "Performance tracking"
    ],
    image: placeholderImages.programHome,
    targetAudience: "Students looking to refine their tactical skills with guided practice",
    level: "All Levels",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12V20M12 8V7.99M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 4,
    title: "CCW Program",
    description: "Comprehensive training for concealed carry permit applicants, covering legal requirements and practical skills.",
    features: [
      "Legal requirements and responsibilities",
      "Concealed carry techniques",
      "Draw from concealment practice", 
      "Real-world application scenarios"
    ],
    image: placeholderImages.programAdvanced,
    targetAudience: "Those seeking concealed carry permits or wanting to improve concealed carry skills",
    level: "Intermediate",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.7 12.87L18.42 9.8C19.31 8.02 19.75 7.14 19.89 6.27C19.909 6.15762 19.9233 6.04466 19.933 5.9324C19.9321 5.44758 19.7404 4.98253 19.395 4.638C19.0496 4.29347 18.5844 4.10296 18.0996 4.10311C18.0325 4.10304 17.9655 4.10711 17.899 4.11531C17.4257 4.14664 16.9387 4.23457 16.458 4.3784C15.972 4.52512 15.4993 4.70696 15.045 4.92225C14.59 5.13774 14.1546 5.38517 13.744 5.66224C13.325 5.94644 12.9305 6.25914 12.564 6.59835C12.1928 6.9421 11.8477 7.31013 11.53 7.7H12L13.5 9.2L14.3 10L9 15.3L6 12.3V11L7.7 9.3H7.7C6.75132 8.18503 5.65534 7.20923 4.44 6.4C3.89183 6.02202 3.31353 5.68562 2.71 5.39M15.5 13.5L20 18M20 18L18 20M20 18L22 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 5,
    title: "Workshops",
    description: "Specialized training sessions focusing on specific tactical skills and scenarios.",
    features: [
      "Topic-focused intensive training",
      "Small group learning environment",
      "Hands-on skill development",
      "Expert-led instruction"
    ],
    image: placeholderImages.programAdvanced,
    targetAudience: "Students looking to develop specific tactical competencies",
    level: "Varies",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 16.0001L12 12.0001M12 12.0001L8 8.00006M12 12.0001L8 16.0001M12 12.0001L16 8.00006" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
];

const Programs: React.FC = () => {
  const [activeProgram, setActiveProgram] = useState<number>(0);
  
  return (
    <section id="programs" className="programs-section">
      <div className="container">
        <div className="section-header">
          <div className="logo-accent">
            <img src={logo} alt="United Defense Tactical" />
          </div>
          <div className="section-tag">Our Programs</div>
          <h2>Find Your <span className="highlight">Ideal Training</span> Path</h2>
          <p>Discover comprehensive training programs designed to elevate your skills and confidence at any experience level</p>
        </div>
        
        <div className="programs-intro">
          <div className="intro-text">
            <h3>Tailored to Your Goals</h3>
            <p>Whether you're just starting out or looking to advance your tactical skills, we have a program designed for your specific needs and objectives.</p>
          </div>
        </div>
        
        <div className="programs-container">
          <div className="program-tabs">
            {programsData.map((program, index) => (
              <button
                key={program.id}
                className={`program-tab ${index === activeProgram ? 'active' : ''}`}
                onClick={() => setActiveProgram(index)}
              >
                <div className="program-icon">
                  {program.icon}
                </div>
                <span className="program-title">{program.title}</span>
                <span className={`program-level ${program.level.toLowerCase().replace(' ', '-')}`}>
                  {program.level}
                </span>
              </button>
            ))}
          </div>
          
          <div className="program-content">
            <div 
              className="program-image"
              style={{ backgroundImage: `url(${programsData[activeProgram].image})` }}
            >
              <div className="overlay"></div>
            </div>
            
            <div className="program-details">
              <h3>{programsData[activeProgram].title}</h3>
              <p className="program-description">{programsData[activeProgram].description}</p>
              
              <div className="program-features">
                <h4>Program Highlights</h4>
                <ul>
                  {programsData[activeProgram].features.map((feature, index) => (
                    <li key={index}>
                      <svg className="feature-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7.5 12L10.5 15L16.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="program-target">
                <h4>Ideal For</h4>
                <p>{programsData[activeProgram].targetAudience}</p>
              </div>
              
              <div className="program-cta">
                <button className="btn btn-primary">Enroll in This Program</button>
                <button className="btn btn-outline">Get More Information</button>
              </div>
            </div>
          </div>
          
          <div className="programs-footer">
            <p>Not sure which program is right for you? <a href="#free-class">Schedule a free consultation</a> with our instructors to find your perfect fit.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs; 
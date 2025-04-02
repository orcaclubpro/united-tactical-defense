import React, { useState } from 'react';
import { placeholderImages } from '../../utils/placeholderImages';
import './Programs.scss';

interface Program {
  id: number;
  title: string;
  description: string;
  features: string[];
  image: string;
  targetAudience: string;
  level: string;
}

const programsData: Program[] = [
  {
    id: 1,
    title: "Firearms Fundamentals",
    description: "Master the basics of safe and effective firearm handling in our comprehensive introductory program.",
    features: [
      "Firearm safety protocols",
      "Proper grip and stance",
      "Sight alignment and trigger control",
      "Maintenance and storage best practices"
    ],
    image: placeholderImages.programFundamentals,
    targetAudience: "Complete beginners with little to no firearms experience",
    level: "Beginner"
  },
  {
    id: 2,
    title: "Defensive Handgun",
    description: "Develop the skills needed for effective personal protection and responsible concealed carry.",
    features: [
      "Drawing from concealment",
      "Shooting on the move",
      "Threat assessment",
      "Malfunction clearing under stress"
    ],
    image: placeholderImages.programDefensive,
    targetAudience: "Those with basic firearms experience seeking self-defense skills",
    level: "Intermediate"
  },
  {
    id: 3,
    title: "Tactical Home Defense",
    description: "Learn to protect your home and loved ones with proven tactical techniques and strategies.",
    features: [
      "Home defense planning",
      "Low-light shooting techniques",
      "Room clearing fundamentals",
      "Family safety protocols"
    ],
    image: placeholderImages.programHome,
    targetAudience: "Homeowners concerned with family protection",
    level: "All Levels"
  },
  {
    id: 4,
    title: "Advanced Tactical Training",
    description: "Elevate your defensive capabilities with advanced tactics used by military and law enforcement.",
    features: [
      "Force-on-force scenarios",
      "Multiple threat engagement",
      "Tactical movement and positioning",
      "Decision-making under stress"
    ],
    image: placeholderImages.programAdvanced,
    targetAudience: "Experienced shooters, military, and law enforcement",
    level: "Advanced"
  }
];

const Programs: React.FC = () => {
  const [activeProgram, setActiveProgram] = useState<number>(0);
  
  return (
    <section id="programs" className="programs-section">
      <div className="container">
        <header className="section-header">
          <h2>Training Programs</h2>
          <p>Comprehensive training tailored to your experience level and goals</p>
        </header>
        
        <div className="programs-container">
          <div className="program-tabs">
            {programsData.map((program, index) => (
              <button
                key={program.id}
                className={`program-tab ${index === activeProgram ? 'active' : ''}`}
                onClick={() => setActiveProgram(index)}
              >
                <span className="program-title">{program.title}</span>
                <span className="program-level">{program.level}</span>
              </button>
            ))}
          </div>
          
          <div className="program-content">
            <div className="program-image">
              <img src={programsData[activeProgram].image} alt={programsData[activeProgram].title} />
              <div className="program-audience">
                <strong>Target Audience:</strong> {programsData[activeProgram].targetAudience}
              </div>
            </div>
            
            <div className="program-details">
              <h3>{programsData[activeProgram].title}</h3>
              <p className="program-description">{programsData[activeProgram].description}</p>
              
              <div className="program-features">
                <h4>What You'll Learn:</h4>
                <ul>
                  {programsData[activeProgram].features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="program-cta">
                <a href="#training-assessment" className="btn btn-primary">Find My Ideal Program</a>
                <a href="#free-class" className="btn btn-secondary">Try a Free Class</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Programs; 
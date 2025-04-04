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
    title: "Firearm Simulator Training",
    description: "Experience realistic scenario-based training in our state-of-the-art simulator without using real firearms.",
    features: [
      "Realistic scenario immersion",
      "Decision-making under pressure",
      "Force escalation/de-escalation",
      "After-action performance review"
    ],
    image: placeholderImages.programFundamentals,
    targetAudience: "All experience levels, from beginners to experienced shooters",
    level: "All Levels"
  },
  {
    id: 2,
    title: "Self Defense Training",
    description: "Learn practical hand-to-hand combat and defensive techniques for real-world situations.",
    features: [
      "Situational awareness",
      "Hand-to-hand combat techniques",
      "Defensive tactics against common attacks",
      "Escape and evasion strategies"
    ],
    image: placeholderImages.programDefensive,
    targetAudience: "Anyone seeking personal protection skills regardless of physical ability",
    level: "All Levels"
  },
  {
    id: 3,
    title: "UDT Indoor Range",
    description: "Practice your skills in our controlled indoor environment with expert instruction and feedback.",
    features: [
      "Controlled training environment",
      "Personalized coaching",
      "Progressive skill development",
      "Performance tracking"
    ],
    image: placeholderImages.programHome,
    targetAudience: "Students looking to refine their tactical skills with guided practice",
    level: "All Levels"
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
    level: "Intermediate"
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
    level: "Varies"
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
            <div className="program-schedule">
              <img 
                src={`${process.env.PUBLIC_URL}/assets/images/schedule.jpeg`} 
                alt="Training schedule" 
                className="schedule-image" 
              />
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
              
              <div className="program-audience">
                <strong>Target Audience:</strong> {programsData[activeProgram].targetAudience}
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
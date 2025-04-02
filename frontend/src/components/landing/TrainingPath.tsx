import React, { useState } from 'react';
import './TrainingPath.scss';

interface TrainingLevel {
  id: number;
  level: string;
  title: string;
  description: string;
  skills: string[];
  outcomes: string;
  timeframe: string;
}

const trainingLevels: TrainingLevel[] = [
  {
    id: 1,
    level: "Level 1",
    title: "Safety Fundamentals",
    description: "Begin your training with essential safety protocols and firearm handling basics.",
    skills: [
      "Firearm safety rules and protocols",
      "Basic firearm mechanics and operations",
      "Proper grip, stance, and sighting",
      "Safe loading and unloading procedures"
    ],
    outcomes: "You'll develop safe handling habits and basic marksmanship foundation.",
    timeframe: "1-2 weeks"
  },
  {
    id: 2,
    level: "Level 2",
    title: "Defensive Marksmanship",
    description: "Build accuracy and consistency while introducing defensive shooting concepts.",
    skills: [
      "Sight alignment and trigger control",
      "Draw and presentation",
      "Controlled pairs and follow-up shots",
      "Malfunction clearing basics"
    ],
    outcomes: "You'll become proficient with your firearm and develop reliable accuracy.",
    timeframe: "2-4 weeks"
  },
  {
    id: 3,
    level: "Level 3",
    title: "Tactical Application",
    description: "Apply your skills to practical defensive scenarios and movement techniques.",
    skills: [
      "Shooting from different positions",
      "Moving while shooting",
      "Multiple target transitions",
      "Cover and concealment principles"
    ],
    outcomes: "You'll gain the ability to effectively engage threats while staying protected.",
    timeframe: "1-2 months"
  },
  {
    id: 4,
    level: "Level 4",
    title: "Advanced Defensive Skills",
    description: "Enhance your capabilities with advanced techniques and stress inoculation.",
    skills: [
      "One-handed shooting (strong and support hand)",
      "Shooting in low-light conditions",
      "Advanced malfunction clearance",
      "Introduction to force-on-force scenarios"
    ],
    outcomes: "You'll develop adaptability and confidence under challenging conditions.",
    timeframe: "2-3 months"
  },
  {
    id: 5,
    level: "Level 5",
    title: "Situational Readiness",
    description: "Integrate all previous skills with tactical decision making and real-world applications.",
    skills: [
      "Threat assessment and decision making",
      "Vehicle defense tactics",
      "Home defense strategies",
      "Legal and ethical considerations"
    ],
    outcomes: "You'll become a tactically sound defender ready for various defensive situations.",
    timeframe: "3-4 months"
  },
  {
    id: 6,
    level: "Level 6",
    title: "Team Tactics",
    description: "Learn to operate effectively with partners and in small groups for enhanced security.",
    skills: [
      "Communication systems and protocols",
      "Coordinated movement techniques",
      "Security team operations",
      "Family protection planning"
    ],
    outcomes: "You'll be able to work effectively with others to protect yourself and those around you.",
    timeframe: "4-6 months"
  },
  {
    id: 7,
    level: "Level 7",
    title: "Scenario Mastery",
    description: "Face complex, realistic scenarios that integrate all previous training elements.",
    skills: [
      "Stress response management",
      "Complex problem solving under pressure",
      "Tactical decision making",
      "Adaptive response to changing threats"
    ],
    outcomes: "You'll demonstrate mastery of defensive skills in unpredictable situations.",
    timeframe: "6-8 months"
  },
  {
    id: 8,
    level: "Level 8",
    title: "Instructor Development",
    description: "For those who wish to teach others, learn the principles of effective instruction.",
    skills: [
      "Teaching methodologies",
      "Student assessment techniques",
      "Curriculum development",
      "Safety supervision protocols"
    ],
    outcomes: "You'll be prepared to guide others through their defensive training journey.",
    timeframe: "8-12 months"
  }
];

const TrainingPath: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<number>(0);
  
  return (
    <section id="training-path" className="training-path-section">
      <div className="container">
        <header className="section-header">
          <h2>Your Training Path</h2>
          <p>Our 8-level training system provides a clear progression from fundamentals to mastery</p>
        </header>
        
        <div className="path-visualization">
          <div className="path-line"></div>
          {trainingLevels.map((level, index) => (
            <button
              key={level.id}
              className={`path-node ${index === activeLevel ? 'active' : ''} ${index < activeLevel ? 'completed' : ''}`}
              onClick={() => setActiveLevel(index)}
              aria-label={`View ${level.level}`}
            >
              <span className="node-level">{index + 1}</span>
              <span className="node-tooltip">{level.title}</span>
            </button>
          ))}
        </div>
        
        <div className="level-details">
          <div className="level-header">
            <div className="level-badge">{trainingLevels[activeLevel].level}</div>
            <h3 className="level-title">{trainingLevels[activeLevel].title}</h3>
          </div>
          
          <p className="level-description">{trainingLevels[activeLevel].description}</p>
          
          <div className="level-skills">
            <h4>Skills Developed:</h4>
            <ul>
              {trainingLevels[activeLevel].skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
          
          <div className="level-outcomes">
            <h4>Training Outcomes:</h4>
            <p>{trainingLevels[activeLevel].outcomes}</p>
          </div>
          
          <div className="level-timeframe">
            <h4>Typical Timeframe:</h4>
            <p>{trainingLevels[activeLevel].timeframe}</p>
          </div>
          
          <div className="level-nav">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveLevel(prev => Math.max(0, prev - 1))}
              disabled={activeLevel === 0}
            >
              Previous Level
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveLevel(prev => Math.min(trainingLevels.length - 1, prev + 1))}
              disabled={activeLevel === trainingLevels.length - 1}
            >
              Next Level
            </button>
          </div>
        </div>
        
        <div className="training-path-cta">
          <p>Ready to start your tactical training journey?</p>
          <a href="#free-class" className="btn btn-primary">Begin Your Training</a>
        </div>
      </div>
    </section>
  );
};

export default TrainingPath; 
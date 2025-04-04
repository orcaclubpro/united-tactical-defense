import React, { useState } from 'react';
import './TrainingPath.scss';

interface BeltLevel {
  id: number;
  color: string;
  title: string;
  description: string;
  skills: string[];
}

const beltLevels: BeltLevel[] = [
  {
    id: 1,
    color: "White",
    title: "White Belt",
    description: "Beginning your tactical training journey with fundamental safety and awareness skills.",
    skills: ["Weapon safety", "Basic stance", "Situational awareness", "Threat identification"]
  },
  {
    id: 2,
    color: "Yellow",
    title: "Yellow Belt",
    description: "Building the basic foundations of defensive techniques and situational readiness.",
    skills: ["Defensive positioning", "Verbal commands", "Basic draw techniques", "Threat assessment"]
  },
  {
    id: 3,
    color: "Orange",
    title: "Orange Belt",
    description: "Developing intermediate skills in tactical response and threat assessment.",
    skills: ["Intermediate draw techniques", "Movement principles", "Decision-making", "Stress management"]
  },
  {
    id: 4,
    color: "Green",
    title: "Green Belt",
    description: "Advancing your capabilities with practical application of defensive techniques.",
    skills: ["Dynamic movement", "Tactical reloading", "Cover vs. concealment", "Force escalation"]
  },
  {
    id: 5,
    color: "Blue",
    title: "Blue Belt",
    description: "Refining your tactical skills and integrating stress response management.",
    skills: ["Advanced positioning", "Multiple threat scenarios", "Low-light techniques", "Emergency medical"]
  },
  {
    id: 6,
    color: "Purple",
    title: "Purple Belt",
    description: "Mastering advanced defensive techniques and scenario-based training.",
    skills: ["Complex scenarios", "High-stress decision making", "Team tactics", "Advanced combat techniques"]
  },
  {
    id: 7,
    color: "Brown",
    title: "Brown Belt",
    description: "Incorporating complex tactical scenarios and leadership development.",
    skills: ["Leadership training", "Scenario creation", "Teaching methodologies", "Advanced tactics"]
  },
  {
    id: 8,
    color: "Black",
    title: "Black Belt",
    description: "Demonstrating mastery of defensive tactics and the ability to train others.",
    skills: ["Mastery demonstration", "Instructor development", "Course design", "Knowledge transmission"]
  }
];

const TrainingPath: React.FC = () => {
  const [activeBelt, setActiveBelt] = useState<number>(0);
  
  return (
    <section id="training-path" className="training-path-section">
      <div className="container">
        <header className="section-header">
          <h2>Your Training Path</h2>
          <p>Master the art of tactical defense through our disciplined belt system</p>
        </header>
        
        <div className="dojo-container">
          <div className="belt-rack">
            {beltLevels.map((belt, index) => (
              <div 
                key={belt.id} 
                className={`belt ${index === activeBelt ? 'active' : ''}`}
                onClick={() => setActiveBelt(index)}
                style={{ backgroundColor: belt.color.toLowerCase() }}
              >
                <div className="belt-stripe"></div>
                <span className="belt-rank">{belt.title}</span>
              </div>
            ))}
          </div>
          
          <div className="training-detail">
            <div className="belt-info">
              <div className="belt-symbol" style={{ backgroundColor: beltLevels[activeBelt].color.toLowerCase() }}>
                <div className="belt-knot"></div>
              </div>
              <div className="belt-content">
                <h3>{beltLevels[activeBelt].title}</h3>
                <p className="belt-description">{beltLevels[activeBelt].description}</p>
                
                <div className="skill-list">
                  <h4>Core Skills:</h4>
                  <ul>
                    {beltLevels[activeBelt].skills.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="training-philosophy">
              <div className="philosophy-header">
                <div className="martial-symbol">氣</div>
                <h3>The Warrior's Code</h3>
              </div>
              <div className="philosophy-content">
                <p>Our tactical defense training is guided by the principles of discipline, respect, and continuous growth - similar to traditional martial arts but adapted for modern self-defense.</p>
                
                <div className="principles">
                  <div className="principle">
                    <h4>Awareness</h4>
                    <p>Master the art of observation and environmental scanning</p>
                  </div>
                  <div className="principle">
                    <h4>Control</h4>
                    <p>Develop composure under pressure and emotional discipline</p>
                  </div>
                  <div className="principle">
                    <h4>Decisiveness</h4>
                    <p>Train to make split-second decisions with confidence</p>
                  </div>
                  <div className="principle">
                    <h4>Precision</h4>
                    <p>Execute techniques with accuracy and deliberate intent</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="path-cta">
              <a href="#free-class" className="btn btn-primary">Begin Your Journey</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingPath; 
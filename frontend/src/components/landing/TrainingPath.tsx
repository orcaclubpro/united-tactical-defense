import React from 'react';
import './TrainingPath.scss';
import badgesImage from '../../assets/images/badges.png';
import scheduleImage from '../../assets/images/schedule.jpeg';

const TrainingPath: React.FC = () => {
  return (
    <section id="training-path" className="training-path-section">
      <div className="container">
        <div className="training-path-content">
          <div className="badges-image">
            <img src={badgesImage} alt="Training level badges" />
          </div>
          <div className="training-path-text">
            <h2>From novice to Navy Seal</h2>
            <p>
              Our 8-level firearms training curriculum covers everyone from new shooters to advanced experts. 
              Track your earned skills while you interact with friends and grow within the global UDT community.
            </p>
            <div className="experience-cta">
              <p>Experience our training first hand</p>
              <a href="#schedule" className="schedule-link">View Schedule</a>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default TrainingPath; 
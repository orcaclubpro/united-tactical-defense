
import React from 'react';

const InstructorsSection = () => {
  return (
    <section id="instructors" className="instructors-section">
      <div className="container">
        <header className="section-header">
          <h2>Elite Instructor Team</h2>
          <p>Learn from veterans with real-world tactical experience</p>
        </header>
        <div className="instructor-grid">
          <article className="instructor-card">
            <img src="images/instructor-casey.jpg" alt="Casey Forester, Lead Instructor" className="instructor-img" />
            <div className="instructor-info">
              <h3>Casey Forester</h3>
              <span className="instructor-title">Lead Instructor, Co-Owner</span>
              <p>Former special operations team leader with 20+ years of military experience in tactical operations and defense. Combat-tested expertise in multiple theaters of operation.</p>
            </div>
          </article>
          <article className="instructor-card">
            <img src="images/instructor-ty.jpg" alt="Ty Kern, Chief Instructor" className="instructor-img" />
            <div className="instructor-info">
              <h3>Ty Kern</h3>
              <span className="instructor-title">Chief Instructor, Co-Owner</span>
              <p>40+ years of martial arts experience and certified firearms instructor. Combat veteran with expertise in close-quarters tactics and defensive techniques in high-stress situations.</p>
            </div>
          </article>
          <article className="instructor-card">
            <img src="images/instructor-sarah.jpg" alt="Sarah Martinez, Defensive Tactics Specialist" className="instructor-img" />
            <div className="instructor-info">
              <h3>Sarah Martinez</h3>
              <span className="instructor-title">Defensive Tactics Specialist</span>
              <p>Former law enforcement officer with specialized training in personal protection and women's self-defense. Certified in multiple defensive combat systems and threat assessment.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default InstructorsSection;

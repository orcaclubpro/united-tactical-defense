
import React from 'react';

const ProgramsSection = () => {
  return (
    <section id="programs" className="training-categories">
      <div className="container">
        <header className="section-header">
          <h2>Reality-Based Training Programs</h2>
          <p>You can't do what you haven't been trained to do</p>
        </header>
        <div className="category-grid">
          <article className="category-card">
            <img src="images/training-handgun.jpg" alt="Handgun Training" className="category-img" />
            <div className="category-info">
              <h3>Defensive Handgun</h3>
              <p>Master proper handling, shooting techniques, and safety protocols. From first-time shooters to advanced tactics, our program builds confidence and competence with your firearm.</p>
              <a href="#pricing" className="btn btn-primary">VIEW OPTIONS</a>
            </div>
          </article>
          <article className="category-card">
            <img src="images/training-home-defense.jpg" alt="Home Defense Training" className="category-img" />
            <div className="category-info">
              <h3>Home Defense Mastery</h3>
              <p>Learn proven strategies to protect your home and family. Includes tactical room clearing, defensive positioning, threat assessment, and legal considerations of home defense.</p>
              <a href="#pricing" className="btn btn-primary">VIEW OPTIONS</a>
            </div>
          </article>
          <article className="category-card">
            <img src="images/training-advanced.jpg" alt="Advanced Tactical Training" className="category-img" />
            <div className="category-info">
              <h3>Advanced Tactical</h3>
              <p>For experienced shooters ready for the next level. Includes dynamic movement, multiple threat engagement, and stress-induced training scenarios designed by special forces veterans.</p>
              <a href="#pricing" className="btn btn-primary">VIEW OPTIONS</a>
            </div>
          </article>
          <article className="category-card">
            <img src="images/training-self-defense.jpg" alt="Self-Defense Training" className="category-img" />
            <div className="category-info">
              <h3>Non-Firearm Defense</h3>
              <p>Learn effective hand-to-hand combat techniques, threat de-escalation, and personal protection strategies. Perfect for everyday situations where a firearm isn't present or practical.</p>
              <a href="#pricing" className="btn btn-primary">VIEW OPTIONS</a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;

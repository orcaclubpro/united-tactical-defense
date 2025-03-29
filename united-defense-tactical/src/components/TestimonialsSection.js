
import React from 'react';

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <header className="section-header">
          <h2>What Our Members Say</h2>
          <p>Real experiences from the UDT Anaheim Hills community</p>
        </header>
        <div className="testimonial-grid">
          <article className="testimonial-card">
            <blockquote>
              <p>"United Defense Tactical gave me the confidence to protect myself and my family in any situation. Their reality-based training translates directly to real-world scenarios. The instructors are top-notch professionals."</p>
              <footer>
                <img src="images/testimonial-john.jpg" alt="John D." className="testimonial-img" />
                <div>
                  <cite>John D.</cite>
                  <span>Member since 2023</span>
                </div>
              </footer>
            </blockquote>
          </article>
          <article className="testimonial-card">
            <blockquote>
              <p>"As a woman, I was initially intimidated about firearms training. The team at UDT created such a supportive environment that I quickly felt comfortable. Now I have skills I never thought possible. Worth every penny."</p>
              <footer>
                <img src="images/testimonial-rebecca.jpg" alt="Rebecca M." className="testimonial-img" />
                <div>
                  <cite>Rebecca M.</cite>
                  <span>Member since 2024</span>
                </div>
              </footer>
            </blockquote>
          </article>
          <article className="testimonial-card">
            <blockquote>
              <p>"The simulation training at UDT is unlike anything I've experienced. It truly prepares you for real-world scenarios in a way that traditional range time can't. They bring military and law enforcement experience to every class."</p>
              <footer>
                <img src="images/testimonial-michael.jpg" alt="Michael T." className="testimonial-img" />
                <div>
                  <cite>Michael T.</cite>
                  <span>Member since 2023</span>
                </div>
              </footer>
            </blockquote>
          </article>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

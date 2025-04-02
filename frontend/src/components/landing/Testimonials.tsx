import React, { useState, useEffect, useRef } from 'react';
import { placeholderImages } from '../../utils/placeholderImages';
import './Testimonials.scss';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Michael Rodriguez',
    role: 'Civilian Student',
    image: placeholderImages.testimonial1,
    quote: 'As someone with zero firearms experience, I was intimidated at first. The instructors made me feel comfortable from day one, and I\'ve gained confidence I never thought possible.',
    rating: 5
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Law Enforcement',
    image: placeholderImages.testimonial2,
    quote: 'Even with my background in law enforcement, the training at United Defense Tactical took my skills to another level. Their emphasis on real-world scenarios has improved my performance on duty.',
    rating: 5
  },
  {
    id: 3,
    name: 'David Chen',
    role: 'CCW Holder',
    image: placeholderImages.testimonial3,
    quote: 'The CCW training program provided practical techniques that go beyond just marksmanship. They teach situational awareness and legal considerations that every responsible carrier should know.',
    rating: 5
  },
  {
    id: 4,
    name: 'Jennifer Martinez',
    role: 'Home Defense Student',
    image: placeholderImages.testimonial4,
    quote: 'After a break-in at my neighbor\'s house, I knew I needed to be prepared. Their home defense course was exactly what I needed—practical, thorough, and empowering.',
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonialTrackRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const updateSlidePosition = (index: number) => {
    if (testimonialTrackRef.current) {
      testimonialTrackRef.current.style.transform = `translateX(-${index * 100}%)`;
    }
  };

  const nextSlide = () => {
    setActiveIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % testimonials.length;
      return newIndex;
    });
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => {
      const newIndex = (prevIndex - 1 + testimonials.length) % testimonials.length;
      return newIndex;
    });
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  // Update slide position when active index changes
  useEffect(() => {
    updateSlidePosition(activeIndex);
    
    // Reset autoplay timer
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
    
    autoplayRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [activeIndex]);

  // Generate rating stars
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? 'star active' : 'star'}>★</span>
      );
    }
    return stars;
  };

  return (
    <section className="testimonials-section">
      <div className="container">
        <header className="section-header">
          <h2>What Our Students Say</h2>
          <p>Hear from those who've experienced our training firsthand</p>
        </header>
        
        <div className="testimonials-container">
          <button className="testimonial-nav prev" onClick={prevSlide} aria-label="Previous testimonial">
            <span>‹</span>
          </button>
          
          <div className="testimonials-wrapper">
            <div className="testimonials-track" ref={testimonialTrackRef}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-item">
                  <div className="testimonial-content">
                    <div className="testimonial-quote">"{testimonial.quote}"</div>
                    <div className="testimonial-rating">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <div className="testimonial-author">
                    <div className="author-image">
                      <img src={testimonial.image} alt={testimonial.name} />
                    </div>
                    <div className="author-info">
                      <div className="author-name">{testimonial.name}</div>
                      <div className="author-role">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button className="testimonial-nav next" onClick={nextSlide} aria-label="Next testimonial">
            <span>›</span>
          </button>
        </div>
        
        <div className="testimonial-indicators">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === activeIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 
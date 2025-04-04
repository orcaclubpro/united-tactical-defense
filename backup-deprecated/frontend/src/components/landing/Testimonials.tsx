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
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
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

  // Handle touch events for mobile swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
    setIsDragging(true);
    setStartPosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentPosition = e.touches[0].clientX;
    const diff = currentPosition - startPosition;
    setCurrentTranslate(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const threshold = 100; // minimum distance to swipe
    
    if (currentTranslate > threshold) {
      prevSlide();
    } else if (currentTranslate < -threshold) {
      nextSlide();
    }
    
    setCurrentTranslate(0);
    
    // Restart autoplay
    autoplayRef.current = setInterval(() => {
      nextSlide();
    }, 5000);
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
    return (
      <div className="stars-container">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i}
            className={`star ${i < rating ? 'active' : ''}`}
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="currentColor"
            />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Testimonials</div>
          <h2>What Our Students Say</h2>
          <p>Real results from people who trained with us</p>
        </div>
        
        <div className="testimonials-container">
          <button 
            className="testimonial-nav prev" 
            onClick={prevSlide} 
            aria-label="Previous testimonial"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div 
            className="testimonials-wrapper"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="testimonials-track" 
              ref={testimonialTrackRef}
              style={{
                transform: isDragging 
                  ? `translateX(calc(-${activeIndex * 100}% + ${currentTranslate}px))` 
                  : `translateX(-${activeIndex * 100}%)`
              }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-item">
                  <div className="testimonial-inner">
                    <div className="testimonial-header">
                      <div className="author-image">
                        <img src={testimonial.image} alt={testimonial.name} />
                      </div>
                      <div className="author-info">
                        <div className="author-name">{testimonial.name}</div>
                        <div className="author-role">{testimonial.role}</div>
                      </div>
                    </div>
                    
                    <div className="testimonial-content">
                      <div className="testimonial-rating">
                        {renderStars(testimonial.rating)}
                      </div>
                      <div className="testimonial-quote">
                        <svg className="quote-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 11H6.21C6.48 9.84 7.79 9 9 9H10V6H9C6.24 6 4 8.24 4 11V17H10V11ZM20 11H16.21C16.48 9.84 17.79 9 19 9H20V6H19C16.24 6 14 8.24 14 11V17H20V11Z" fill="currentColor"/>
                        </svg>
                        <p>{testimonial.quote}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="testimonial-nav next" 
            onClick={nextSlide} 
            aria-label="Next testimonial"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
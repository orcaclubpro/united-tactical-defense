import React, { useState, useEffect, useRef } from 'react';
import { placeholderImages } from '../../utils/placeholderImages';
import './Testimonials.scss';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  image: string;
  quote: string;
  rating: number;
  date: string;
  photoInfo?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sherry M.',
    location: 'Orange, CA',
    image: placeholderImages.testimonial1,
    quote: 'There is five of us who joined and wanted to experience this together. We are enjoying our classes and learning so much. The staff is always friendly and helpful. The instructor\'s have all been great and they are educated and very competent. Chris has taught us how to safely and correctly handle a gun. Lamar, has taught us great self defense techniques for women. You always learn something new when you go to a class. We only joined six weeks ago and it has been one of the best things we have done for ourselves.',
    rating: 5,
    date: 'Feb 13, 2025'
  },
  {
    id: 2,
    name: 'Reb T.',
    location: 'Yorba Linda, CA',
    image: placeholderImages.testimonial2,
    quote: 'Chris, Lamar, Katie are amazing. They\'re patient and offer guidance. I feel very comfortable and empowered. Thank you. Great place to go.',
    rating: 5,
    date: 'Mar 25, 2025'
  },
  {
    id: 3,
    name: 'Joanna V.',
    location: 'Placentia, CA',
    image: placeholderImages.testimonial3,
    quote: 'My friend and I have been taking classes here since they opened last summer. We really enjoyed the instructors. Their expertise, professionalism and patience make learning new information about firearms, tactical training, scenarios, hands on and self defense not only helpful, but fun. Learn about firearm laws and safety protocol with other people of similar interests. My friend and I take the classes together, which makes it more fun. We find there are a lot of classes available. The new workshops and other additional classes that have been added, really add to the value of the monthly fee.',
    rating: 5,
    date: 'Mar 19, 2025',
    photoInfo: '1 photo'
  },
  {
    id: 4,
    name: 'George B.',
    location: 'Corona, CA',
    image: placeholderImages.testimonial4,
    quote: 'I absolutely love to train here. The instructors are all amazing and will bring something different for you to learn. Me and my spouse just moved up to the Green Team...LeT\'s Go!!!',
    rating: 5,
    date: 'Mar 22, 2025',
    photoInfo: '1 photo'
  },
  {
    id: 5,
    name: 'Dave W.',
    location: 'Anaheim, CA',
    image: placeholderImages.testimonial5,
    quote: 'My first experience at UDT was extremely eye-opening. The demo helped me realize how much more training I needed. Every staff member is super friendly and welcoming. The place has such a cool vibe and atmosphere. I have learned so much since starting there, and it\'s been an awesome experience. UDT should be a required prerequisite for CCW. I cannot recommend this place enough. 10 stars!',
    rating: 5,
    date: 'Jan 13, 2025'
  },
  {
    id: 6,
    name: 'Melody L.',
    location: 'Ontario, CA',
    image: placeholderImages.testimonial6,
    quote: 'As a survivor of Route 91, a road rage incident that lead to a broken window, and a witness to a shooting I needed a safe environment that I could build my confidence, learn safety skills, not flinch or panic with loud noises or explosions, and be able to react if God forbid I ever experienced another tragic event. UDT Anaheim has been a blessing. My first day (trial) I cried. No joke! But I signed up. I\'ve been attending since Dec 2024 and 2-3 times a week. In 2 short months, I\'ve been able to build my confidence, learned life saving skills, and excited about attending my classes. All the instructors are patient, compassionate, knowledgeable and most importantly supportive. No matter your reason for considering UDT, definitely attend the free trial. I think you\'ll see why I joined and many others have too. :)',
    rating: 5,
    date: 'Mar 19, 2025'
  },
  {
    id: 7,
    name: 'David H.',
    location: 'Chino Hills, CA',
    image: placeholderImages.testimonial7,
    quote: 'My wife and I joined their firearms training membership. It was one of our best decisions/investment we have ever made. Their training programs are extensive. All their instructors have military and/or law enforcement background. They are knowledgeable, patient and personable. We have learn so much since we started the program and can\'t wait to reach the next level.',
    rating: 5,
    date: 'Feb 23, 2025'
  }
];

const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedQuotes, setExpandedQuotes] = useState<Record<number, boolean>>({});
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

  const toggleQuoteExpansion = (id: number) => {
    setExpandedQuotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => nextSlide(), 8000);
  };

  useEffect(() => {
    updateSlidePosition(activeIndex);
    
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? 'star active' : 'star'}>★</span>
      );
    }
    return stars;
  };

  const quoteTruncateLength = 200;

  return (
    <section className="testimonials-section">
      <div className="container">
        <header className="section-header">
          <h2>What Our Students Say</h2>
          <p>Hear from our students about their experience with our training programs</p>
          <div className="slide-counter">
            {activeIndex + 1} / {testimonials.length}
          </div>
        </header>
        
        <div className="testimonials-container">
          <button className="testimonial-nav prev" onClick={prevSlide} aria-label="Previous testimonial">
            <span>‹</span>
          </button>
          
          <div className="testimonials-wrapper">
            <div className="testimonials-track" ref={testimonialTrackRef}>
              {testimonials.map((testimonial) => {
                const isExpanded = expandedQuotes[testimonial.id] || false;
                const showToggleButton = testimonial.quote.length > quoteTruncateLength;

                return (
                  <div key={testimonial.id} className="testimonial-item">
                    <div className="testimonial-content">
                      <div className={`testimonial-quote ${!isExpanded && showToggleButton ? 'truncated' : ''}`}>
                        "{testimonial.quote}"
                      </div>
                      {showToggleButton && (
                        <button 
                          onClick={() => toggleQuoteExpansion(testimonial.id)}
                          className="quote-toggle-btn"
                        >
                          {isExpanded ? 'Read Less' : 'Read More'}
                        </button>
                      )}
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
                        <div className="author-location">{testimonial.location}</div>
                        <div className="author-date">{testimonial.date}</div>
                        {testimonial.photoInfo && <div className="author-photos">{testimonial.photoInfo}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button className="testimonial-nav next" onClick={nextSlide} aria-label="Next testimonial">
            <span>›</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 
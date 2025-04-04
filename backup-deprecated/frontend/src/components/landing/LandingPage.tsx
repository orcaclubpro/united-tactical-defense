import React, { useEffect, useState, useRef } from 'react';
import { 
  Header, 
  Hero, 
  TrustBadges, 
  VideoSection, 
  Testimonials, 
  Programs,
  AssessmentForm, 
  Instructors, 
  TrainingPath,
  Pricing,
  FAQ,
  Location,
  CallToAction
} from './';
import { Chatbot } from '../common';
import { Element, scroller } from 'react-scroll';
import { useInView } from 'react-intersection-observer';
import './LandingPage.scss';

const LandingPage: React.FC = () => {
  const [showFixedCTA, setShowFixedCTA] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [formRef, inViewForm] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Show fixed CTA after scrolling past hero section
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroHeight = heroRef.current.offsetHeight;
        const scrollPosition = window.scrollY;
        setShowFixedCTA(scrollPosition > heroHeight);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle scroll to free class section
  const scrollToFreeClass = () => {
    scroller.scrollTo('free-class', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -100
    });
  };

  return (
    <div className="landing-page">
      <Header />
      
      {/* Hero Section with Prominent CTA */}
      <div ref={heroRef}>
        <Hero />
      </div>
      
      {/* Trust Indicators */}
      <TrustBadges />
      
      {/* Main Value Proposition Video */}
      <VideoSection />
      
      {/* Social Proof - Testimonials */}
      <Testimonials />
      
      {/* Training Programs Overview */}
      <Programs />
      
      {/* Training Assessment Form - Primary Conversion Point */}
      <Element name="free-class">
        <section className="free-class-section" ref={formRef}>
          <div className="container">
            <div className="section-header center">
              <div className="badge">START YOUR JOURNEY</div>
              <h2>Find Your <span className="highlight">Perfect Training Program</span></h2>
              <p className="section-description">
                Answer a few questions to get a personalized training recommendation and claim your free introductory class.
                Our expert instructors will create a custom learning path based on your goals and experience level.
              </p>
            </div>
            <div className="form-wrapper">
              <AssessmentForm />
            </div>
          </div>
        </section>
      </Element>
      
      {/* Training Path Visualization */}
      <TrainingPath />
      
      {/* Meet the Instructors - Building Trust */}
      <Instructors />
      
      {/* Pricing Options with Value Focus */}
      <Pricing />
      
      
      
      {/* Location Information */}
      <Location />
      
      {/* Final Call to Action */}
      <CallToAction />

      {/* FAQ Section - Addressing Objections */}
      <FAQ />
      
      {/* Chatbot for Interactive Support */}
      <Chatbot />
      
      {/* Fixed "Book Free Class" Button - Always Visible After Scrolling */}
      {showFixedCTA && !inViewForm && (
        <div className="fixed-cta">
          <button 
            className="btn btn-primary btn-lg pulse-animation"
            onClick={scrollToFreeClass}
          >
            BOOK FREE CLASS
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingPage; 
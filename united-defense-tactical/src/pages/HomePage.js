
import React, { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import TrustBadges from '../components/TrustBadges';
import FeaturedSection from '../components/FeaturedSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ProgramsSection from '../components/ProgramsSection';
import InstructorsSection from '../components/InstructorsSection';
import TrainingPathSection from '../components/TrainingPathSection';
import PricingSection from '../components/PricingSection';
import FaqSection from '../components/FaqSection';
import FreeClassSection from '../components/FreeClassSection';
import LocationSection from '../components/LocationSection';
import Chatbot from '../components/Chatbot';

const HomePage = () => {
  useEffect(() => {
    // Initialize animations and interactions
    const animatableElements = document.querySelectorAll('.instructor-card, .category-card, .testimonial-card, .step, .pricing-card, .counter-container, .section-header');
    
    animatableElements.forEach(element => {
      element.classList.add('animate-on-scroll');
    });

    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      const windowHeight = window.innerHeight;

      elements.forEach(element => {
        const position = element.getBoundingClientRect();
        const offset = 100;

        if (position.top - windowHeight + offset < 0) {
          element.classList.add('animate-in');

          if (element.classList.contains('counter-container') && !element.classList.contains('counted')) {
            animateCounters();
            element.classList.add('counted');
          }
        }
      });
    };

    const animateCounters = () => {
      const counterElements = document.querySelectorAll('.counter-value');

      counterElements.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += step;
          if (current < target) {
            counter.textContent = Math.ceil(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target.toLocaleString();
          }
        };

        updateCounter();
      });
    };

    window.addEventListener('scroll', animateOnScroll);
    setTimeout(animateOnScroll, 100);

    return () => {
      window.removeEventListener('scroll', animateOnScroll);
    };
  }, []);

  return (
    <main>
      <HeroSection />
      <TrustBadges />
      <FeaturedSection />
      <TestimonialsSection />
      <ProgramsSection />
      <InstructorsSection />
      <TrainingPathSection />
      <PricingSection />
      <FaqSection />
      <FreeClassSection />
      <LocationSection />
      <Chatbot />
    </main>
  );
};

export default HomePage;

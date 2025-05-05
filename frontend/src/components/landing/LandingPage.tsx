import React, { useEffect } from 'react';
import Header from './Header';
import Hero from './Hero';
import TrustBadges from './TrustBadges';
import AssessmentForm from './AssessmentForm';
import VideoSection from './VideoSection';
import OODASection from './OODASection';
import Testimonials from './Testimonials';
import Programs from './Programs';
import Instructors from './Instructors';
import TrainingPath from './TrainingPath';
import Pricing from './Pricing';
import FAQ from './FAQ';
import FreeClass from './FreeClass';
import Location from './Location';
import CallToAction from './CallToAction';
import Footer from '../common/Footer';
import { trackPageVisit } from '../../services/api';
import './LandingPage.scss';
import styled from 'styled-components';

const FloatingButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #b71c1c 0%, #880e0e 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(183, 28, 28, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  letter-spacing: 0.5px;
  text-transform: uppercase;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(183, 28, 28, 0.4);
    background: linear-gradient(135deg, #c71c1c 0%, #980e0e 100%);
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(183, 28, 28, 0.3);
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: white;
    stroke-width: 2;
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    padding: 14px 24px;
    font-size: 1rem;
    gap: 8px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const LandingPage: React.FC = () => {
  // Track page visit when landing page loads
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const pageVisitData = {
          page: window.location.pathname,
          referrer: document.referrer || '',
          timestamp: new Date().toISOString(),
          // Legacy fields mapped to maintain compatibility
          pageUrl: window.location.pathname,
          utmSource: new URLSearchParams(window.location.search).get('utm_source') || undefined,
          utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
          utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
          userAgent: navigator.userAgent,
          ipAddress: undefined,
          is_landing_page: 1,
          visit_time: new Date().toISOString()
        };
        
        await trackPageVisit(pageVisitData);
      } catch (error) {
        console.error('Error tracking page visit:', error);
      }
    };
    
    trackVisit();
  }, []);

  return (
    <div className="landing-page">
      <Header />
      <Hero />
      <TrustBadges />
      <VideoSection />
      <Programs />
      
      {/* Tactical Readiness Assessment */}
      <div id="assessment" className="tactical-readiness-section">
        <AssessmentForm />
      </div>
      
      <Instructors />
      <Testimonials />
      <TrainingPath />
      <OODASection />
      <Pricing />
      <FreeClass />
      <CallToAction />
      <FAQ />
      <Location />
      <Footer />
    </div>
  );
};

export default LandingPage; 
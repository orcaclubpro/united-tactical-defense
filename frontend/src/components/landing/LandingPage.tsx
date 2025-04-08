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
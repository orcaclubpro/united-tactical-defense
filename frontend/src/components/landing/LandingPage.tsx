import React, { useEffect, useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import TrustBadges from './TrustBadges';
import AssessmentForm from './AssessmentForm';
import VideoSection from './VideoSection';
import Testimonials from './Testimonials';
import Programs from './Programs';
import Instructors from './Instructors';
import TrainingPath from './TrainingPath';
import Pricing from './Pricing';
import FAQ from './FAQ';
import Location from './Location';
import CallToAction from './CallToAction';
import Footer from '../common/Footer';
import { FreeLessonFormController } from '../Form';
import { trackPageVisit } from '../../services/api';
import { placeholderImages } from '../../utils/placeholderImages';
import './LandingPage.scss';

const LandingPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
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

  // Extract any URL parameters for form prefilling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openForm') === 'true') {
      setIsFormOpen(true);
    }
  }, []);

  // Function to open the form
  const openForm = () => setIsFormOpen(true);
  
  // Function to close the form
  const closeForm = () => setIsFormOpen(false);

  return (
    <div className="landing-page">
      <Header />
      <Hero />
      <TrustBadges />
      <VideoSection />
      <AssessmentForm />
      <Testimonials />
      <Programs />
      <Instructors />
      <TrainingPath />
      <Pricing />
      <FAQ />
      
      {/* ClassSection that will trigger the FreeLessonFormController */}
      <ClassSection openForm={openForm} />
      
      <CallToAction />
      <Location />
      <Footer />
      
      {/* FreeLessonFormController used as a modal */}
      <FreeLessonFormController
        isOpen={isFormOpen}
        onClose={closeForm}
        formSource="landing_page"
      />
    </div>
  );
};

// New component to replace FreeClass that will trigger the FreeLessonFormController
const ClassSection: React.FC<{ openForm: () => void }> = ({ openForm }) => {
  return (
    <section id="free-class" className="free-class-section">
      <div className="container">
        <div className="free-class-content">
          <div className="content-text">
            <h2>Experience Our Training Firsthand</h2>
            <p className="lead">Claim your complimentary training session to see if our approach is right for you</p>
            
            <div className="benefits">
              <h3>What to Expect in Your Free Class:</h3>
              <ul>
                <li>Personal introduction to our training methodology</li>
                <li>Hands-on experience with proper techniques</li>
                <li>Assessment of your current skill level</li>
                <li>Personalized training recommendations</li>
                <li>Tour of our state-of-the-art facilities</li>
              </ul>
            </div>
            
            <div className="cta-button">
              <button id="open-free-class-modal" className="btn btn-primary btn-lg" onClick={openForm}>
                Schedule Your Free Class
              </button>
            </div>
          </div>
          
          <div className="content-image">
            <img src={placeholderImages.trainingSession} alt="Training session" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage; 
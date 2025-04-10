import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import './TrainingPackages.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faAward, faStar, faFire, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface TrainingPackage {
  id: number;
  name: string;
  perMonth: string;
  perYear: string;
  features: string[];
  popular: boolean;
  icon: any;
}

const trainingPackages: TrainingPackage[] = [
  {
    id: 1,
    name: "BASE+",
    perMonth: "2 trainings per month",
    perYear: "26 per year",
    features: [
      "2 simulator trainings per month",
      "2 self-defense classes per month",
      "2 seminar/workshop per month",
      "4 combat conditioning per month",
      "4 UDT range experiences per year"
    ],
    popular: false,
    icon: faAward
  },
  {
    id: 2,
    name: "CORE",
    perMonth: "4 trainings per month",
    perYear: "52 per year",
    features: [
      "4 simulator trainings per month",
      "Unlimited self-defense per month",
      "Unlimited seminars/workshops per month",
      "Unlimited combat conditioning",
      "6 UDT range experiences per year"
    ],
    popular: true,
    icon: faStar
  },
  {
    id: 3,
    name: "CORE+",
    perMonth: "6 trainings per month",
    perYear: "78 per year",
    features: [
      "6 simulator trainings per month",
      "Unlimited self-defense classes",
      "Unlimited seminars/workshops",
      "Unlimited combat conditioning",
      "10 UDT range experiences per year"
    ],
    popular: false,
    icon: faFire
  }
];

const TrainingPackages: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start with CORE (index 1) as default
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number, y: number } | null>(null);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Minimum swipe distance in pixels to trigger card change
  const minSwipeDistance = 50;

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    // Store both X and Y coordinates
    setTouchStart({ 
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setIsHorizontalSwipe(false);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchStart) return;
    
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    // Calculate movement in both directions
    const xDiff = touchStart.x - currentX;
    const yDiff = touchStart.y - currentY;

    // Update current touch position
    setTouchEnd({ x: currentX, y: currentY });
    
    // If horizontal movement is more significant than vertical, 
    // it's likely a horizontal swipe
    if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 20) {
      setIsHorizontalSwipe(true);
      // Prevent default to avoid scrolling when clearly swiping horizontally
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    // Only process as a card swipe if it was identified as a horizontal swipe
    if (isHorizontalSwipe) {
      const distance = touchStart.x - touchEnd.x;
      const isSwipe = Math.abs(distance) > minSwipeDistance;
      
      if (isSwipe) {
        if (distance > 0) {
          // Swipe left - go to next card
          handleNext();
        } else {
          // Swipe right - go to previous card
          handlePrevious();
        }
      }
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
    setIsHorizontalSwipe(false);
  };

  const openFreeClassModal = () => {
    const openModalButton = document.getElementById('open-free-class-modal');
    if (openModalButton) {
      openModalButton.click();
    } else {
      console.warn('Free class modal button not found');
      // Fallback method - try to locate and trigger the modal through other means if needed
      const modalTriggers = document.querySelectorAll('[data-target="#freeClassModal"]');
      if (modalTriggers.length > 0) {
        (modalTriggers[0] as HTMLElement).click();
      }
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? trainingPackages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === trainingPackages.length - 1 ? 0 : prev + 1));
  };

  const getPackagePosition = (index: number) => {
    if (!isMobile) {
      // On desktop, all cards are visible in a grid
      return 'center';
    }
    
    // Mobile carousel logic
    const diff = index - currentIndex;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === -2) return 'right';
    if (diff === -1 || diff === 2) return 'left';
    return 'hidden';
  };

  const renderPackageCard = (pkg: TrainingPackage, index: number) => {
    const position = getPackagePosition(index);
    const isActive = index === currentIndex;
    const isMiddleCard = index === 1; // CORE is at index 1

    return (
      <div 
        key={pkg.id} 
        className={`package-card ${pkg.popular ? 'popular' : ''} ${isActive ? 'active' : ''} position-${position} ${isMiddleCard ? 'middle-card' : ''}`}
      >
        {pkg.popular && <div className="popular-badge">Most Popular</div>}
        
        <div className="card-header">
          <div className="icon-container">
            <FontAwesomeIcon icon={pkg.icon} className="package-icon" />
          </div>
          <h3 className="package-name">{pkg.name}</h3>
        </div>
        
        <div className="training-quantity">
          <div className="training-quantity-value">{pkg.perMonth}</div>
          <div className="training-quantity-caption">{pkg.perYear}</div>
        </div>
        
        <div className="card-body">
          <ul className="feature-list">
            {pkg.features.map((feature, fIndex) => (
              <li key={fIndex}>
                <FontAwesomeIcon icon={faCheck} className="check-icon" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="card-footer">
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent the event from bubbling up
              openFreeClassModal();
            }} 
            className="btn btn-primary"
          >
            Claim free class
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <section id="training-packages" className="training-packages-section">
      <div id="packages" className="container">
        <header className="section-header">
          <h2>Training Packages</h2>
          <p>Elevate your tactical defense skills with our premium training programs</p>
        </header>
        
        <div 
          className="package-cards-container" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            overflowY: 'visible'
          }}
        >
          <div 
            className="package-cards"
            ref={cardsRef}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            style={{ 
              position: 'relative', 
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              touchAction: 'pan-y' // Enable vertical scrolling
            }}
          >
            {trainingPackages.map((pkg, index) => renderPackageCard(pkg, index))}
          </div>
          
          {isMobile && (
            <div className="swipe-indicator">
              <span>Swipe to view more</span>
              <div className="swipe-animation"></div>
            </div>
          )}
        </div>
        
        <div className="packages-note">
          <p>All plans include access to our state-of-the-art training facilities and certified instructors</p>
          <p>Start with a free assessment and our experts will help you choose the right program for your needs</p>
        </div>
      </div>
    </section>
  );
};

export default TrainingPackages; 
import React, { useState, useEffect, useRef } from 'react';
import './Instructors.scss';
import instructor1 from '../../assets/images/chris.jpg';
import instructor2 from '../../assets/images/lamar.jpg';
import instructor4 from '../../assets/images/mike.jpg';
import instructor5 from '../../assets/images/katie.jpg';

interface Instructor {
  id: number;
  name: string;
  title: string;
  image: string;
  bio: string;
  specialties: string[];
  experience: string;
}

const instructorsData: Instructor[] = [
  {
    id: 1,
    name: "Chris Wiles",
    title: "Chief Instructor",
    image: instructor1,
    bio: "Chris served over 22 years in the US Army as a Lieutenant Colonel. He also served as the S3 Operations Officer for a military police task force, overseeing training and mission planning with a primary focus on detainee operations. His expertise extended to lethal and non-lethal weapons handling, escalation of force training, and tactical operations, providing invaluable instruction in critical decision-making and force application. Since 2020, Chris has also been a NRA-certified small arms instructor, further solidifying his credentials in civilian firearms instruction. His ability to translate military training principles into practical, effective teaching methods makes him a valuable asset to any team.",
    specialties: ["Tactical Firearms"],
    experience: "22 Years Lieutenant Colonel, NRA-Certified Pistol Instructor"
  },
  {
    id: 2,
    name: "Lamar Keeble",
    title: "Instructor",
    image: instructor2,
    bio: "With over 15 years of law enforcement experience, Lamar Keeble is a highly skilled firearms instructor dedicated to training individuals in firearm safety, tactical proficiency, and situational awareness. His expertise extends beyond marksmanship, emphasizing real-world application under high-stress conditions. Throughout his law-enforcement career, Lamar has extensive experience in civil disturbance management, where he has navigated large-scale protests and volatile scenarios with precision and control. His ability to de-escalate tensions and enforce public safety measures makes him a valuable asset in both training and operational roles.",
    specialties: ["Tactical Firearms", "Women's Self-Defense", "Legal Use of Force", "Tactical Medicine", "Brazilian Jiu Jitsu", "CCW Certification", "Krav Maga", "Boxing"],
    experience: "15 Years Law Enforcement, NRA-Certified Pistol Instructor, Active Shooter Response, Counter-Terrorism Response Team"
  },
  {
    id: 3,
    name: "Mike Avery",
    title: "Instructor",
    image: instructor4,
    bio: "Mike brings an incredible wealth of experience to our team. With 25 years as a professional stuntman, he's no stranger to high-adrenaline situations. His background includes serving as an EMT and first responder with the National Ski Patrol in Big Bear, CA, along with 10+ years in Executive Protection for high-profile clientele. Mike is a Certified Protection Specialist and an NRA-Certified Pistol Instructor, making him an exceptional asset for training and safety.",
    specialties: ["Tactical Firearms", "Women's Self-Defense", "Tactical Medicine"],
    experience: "NRA-Certified Pistol Instructor, EMT and First-Responder"
  },
  {
    id: 4,
    name: "Katie Davis",
    title: "Instructor",
    image: instructor5,
    bio: "Katie brings a wealth of experience in law enforcement, emergency medicine, and firearms instruction. She served as a Police Volunteer with Orange PD for over 4 years, specializing in both the K-9 and Gang Unit, gaining valuable hands-on experience in tactical operations. She also worked as a Deputy Sheriff Trainee, focusing on the CCW sector, further enhancing her expertise in concealed carry regulations and training. In addition to her law enforcement background, Katie has an impressive 6-year career as an EMT, providing critical care in high-pressure environments. She also spent 5 years as a Firearms Instructor at Artemis, where she trained civilians and professionals in defensive shooting and firearms safety. As a certified NRA Pistol Instructor, she is passionate about firearm education and skill development.",
    specialties: ["Tactical Firearms", "Women's Self-Defense", "Tactical Medicine", "CCW Education"],
    experience: "Law Enforcement Volunteer work, EMT, NRA-certified pistol instructor"
  }
];

const Instructors: React.FC = () => {
  const [activeInstructor, setActiveInstructor] = useState<number>(0);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  useEffect(() => {
    if (!autoScroll) return;
    
    const interval = setInterval(() => {
      setActiveInstructor((prev) => (prev + 1) % instructorsData.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoScroll]);

  const handleArrowClick = (index: number) => {
    setActiveInstructor(index);
    setAutoScroll(false);
    setTimeout(() => setAutoScroll(true), 15000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setAutoScroll(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const minSwipeDistance = 50;
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        handleArrowClick((activeInstructor - 1 + instructorsData.length) % instructorsData.length);
      } else {
        handleArrowClick((activeInstructor + 1) % instructorsData.length);
      }
    }
    
    setTimeout(() => setAutoScroll(true), 15000);
  };

  const openFreeClassModal = () => {
    const openModalButton = document.getElementById('open-free-class-modal');
    if (openModalButton) {
      openModalButton.click();
    }
  };

  return (
    <section id="instructors" className="instructors-section">
      <div className="container">
        <header className="section-header">
          <div className="badge">EXPERT INSTRUCTION</div>
          <h2>Our <span className="highlight">Instructors</span></h2>
          <p>Learn from experienced professionals with military and law enforcement backgrounds</p>
          <div className="slide-counter">
            {activeInstructor + 1} / {instructorsData.length}
          </div>
        </header>
        
        <div className="instructors-carousel">
          <div 
            className="carousel-container"
            ref={carouselRef}
          >
            <div 
              className="carousel-track" 
              style={{ transform: `translateX(-${activeInstructor * 100}%)` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {instructorsData.map((instructor, index) => (
                <div key={instructor.id} className={`carousel-card ${index === activeInstructor ? 'active' : ''}`}>
                  <div className="carousel-card-image">
                    <img src={instructor.image} alt={instructor.name} loading="lazy" />
                    <div className="instructor-title">{instructor.title}</div>
                  </div>
                  <div className="carousel-card-content">
                    <h3>{instructor.name}</h3>
                    <p className="experience">{instructor.experience}</p>
                    <div className="specialties">
                      <h4>Specialties</h4>
                      <div className="specialty-tags">
                        {instructor.specialties.map((specialty, idx) => (
                          <span key={idx} className="specialty-tag">{specialty}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bio-container expanded">
                      <p className="bio">{instructor.bio}</p>
                    </div>
                    <button onClick={openFreeClassModal} className="btn btn-primary">
                      Train With {instructor.name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="carousel-controls">
            <button 
              className="carousel-control prev"
              onClick={() => handleArrowClick((activeInstructor - 1 + instructorsData.length) % instructorsData.length)}
              aria-label="Previous instructor"
            >
              ‹
            </button>
            <button 
              className="carousel-control next"
              onClick={() => handleArrowClick((activeInstructor + 1) % instructorsData.length)}
              aria-label="Next instructor"
            >
              ›
            </button>
          </div>
          
          <div className="carousel-pagination">
            {instructorsData.map((_, idx) => (
              <button
                key={idx}
                className={`pagination-dot ${idx === activeInstructor ? 'active' : ''}`}
                onClick={() => handleArrowClick(idx)}
                aria-label={`Go to instructor ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Instructors; 
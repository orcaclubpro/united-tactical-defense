import React from 'react';
import { placeholderImages } from '../../utils/placeholderImages';
import './Instructors.scss';

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
    image: placeholderImages.instructor1,
    bio: "Chris served over 22 years in the US Army as a Lieutenant Colonel. He also served as the S3 Operations Officer for a military police task force, overseeing training and mission planning with a primary focus on detainee operations. His expertise extended to lethal and non-lethal weapons handling, escalation of force training, and tactical operations, providing invaluable instruction in critical decision-making and force application. Since 2020, Chris has also been a NRA-certified small arms instructor, further solidifying his credentials in civilian firearms instruction. His ability to translate military training principles into practical, effective teaching methods makes him a valuable asset to any team.",
    specialties: ["Tactical Firearms"],
    experience: "22 Years Lieutenant Colonel, NRA-Certified Pistol Instructor"
  },
  {
    id: 2,
    name: "Lamar Keeble",
    title: "Instructor",
    image: placeholderImages.instructor2,
    bio: "With over 15 years of law enforcement experience, Lamar Keeble is a highly skilled firearms instructor dedicated to training individuals in firearm safety, tactical proficiency, and situational awareness. His expertise extends beyond marksmanship, emphasizing real-world application under high-stress conditions. Throughout his law-enforcement career, Lamar has extensive experience in civil disturbance management, where he has navigated large-scale protests and volatile scenarios with precision and control. His ability to de-escalate tensions and enforce public safety measures makes him a valuable asset in both training and operational roles.",
    specialties: ["Tactical Firearms", "Women's Self-Defense", "Legal Use of Force", "Tactical Medicine", "Brazilian Jiu Jitsu", "CCW Certification", "Krav Maga", "Boxing"],
    experience: "15 Years Law Enforcement, NRA-Certified Pistol Instructor, Active Shooter Response, Counter-Terrorism Response Team"
  },
  {
    id: 3,
    name: "John Idio",
    title: "Instructor",
    image: placeholderImages.instructor3,
    bio: "John is a seasoned professional with extensive experience in criminal justice education, security operations, and firearms instruction. With over a decade in law enforcement training, security management, and public safety, he has developed a comprehensive understanding of security protocols, investigations, and use-of-force applications.",
    specialties: ["Tactical Firearms", "Close Quarters Combat", "Tactical Medicine"],
    experience: "20+ Years of Public Safety, Executive Protection Specialist, Armed Guard, NRA-Certified Pistol Instructor, POST Certified Firearms Instructor"
  },
  {
    id: 4,
    name: "Mike Avery",
    title: "Instructor",
    image: placeholderImages.instructor4,
    bio: "Mike brings an incredible wealth of experience to our team. With 25 years as a professional stuntman, he's no stranger to high-adrenaline situations. His background includes serving as an EMT and first responder with the National Ski Patrol in Big Bear, CA, along with 10+ years in Executive Protection for high-profile clientele. Mike is a Certified Protection Specialist and an NRA-Certified Pistol Instructor, making him an exceptional asset for training and safety.",
    specialties: ["Tactical Firearms", "Women's Self-Defense", "Tactical Medicine"],
    experience: "NRA-Certified Pistol Instructor, EMT and First-Responder"
  },
  {
    id: 5,
    name: "Katie Davis",
    title: "Instructor",
    image: placeholderImages.instructor5,
    bio: "Katie brings a wealth of experience in law enforcement, emergency medicine, and firearms instruction. She served as a Police Volunteer with Orange PD for over 4 years, specializing in both the K-9 and Gang Unit, gaining valuable hands-on experience in tactical operations. She also worked as a Deputy Sheriff Trainee, focusing on the CCW sector, further enhancing her expertise in concealed carry regulations and training. In addition to her law enforcement background, Katie has an impressive 6-year career as an EMT, providing critical care in high-pressure environments. She also spent 5 years as a Firearms Instructor at Artemis, where she trained civilians and professionals in defensive shooting and firearms safety. As a certified NRA Pistol Instructor, she is passionate about firearm education and skill development.",
    specialties: ["Tactical Firearms", "Women's Self-Defense", "Tactical Medicine", "CCW Education"],
    experience: "Law Enforcement Volunteer work, EMT, NRA-certified pistol instructor"
  }
];

const Instructors: React.FC = () => {
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
          <h2>Our Expert Instructors</h2>
          <p>Learn from experienced professionals with military and law enforcement backgrounds</p>
        </header>
        
        <div className="instructors-grid">
          {instructorsData.map(instructor => (
            <div key={instructor.id} className="instructor-card">
              <div className="card-front">
                <div className="instructor-image">
                  <img src={instructor.image} alt={instructor.name} />
                </div>
                <div className="instructor-info">
                  <h3>{instructor.name}</h3>
                  <p className="title">{instructor.title}</p>
                  <div className="specialties">
                    {instructor.specialties.slice(0, 3).map((specialty, index) => (
                      <span key={index} className="specialty-tag">{specialty}</span>
                    ))}
                    {instructor.specialties.length > 3 && (
                      <span className="specialty-tag more">+{instructor.specialties.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="card-back">
                <h3>{instructor.name}</h3>
                <p className="experience">{instructor.experience}</p>
                <p className="bio-excerpt">{instructor.bio}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="instructors-cta">
          <button onClick={openFreeClassModal} className="btn btn-primary">Train With Our Experts</button>
        </div>
      </div>
    </section>
  );
};

export default Instructors; 
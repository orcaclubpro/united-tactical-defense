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
    name: "Jack Reynolds",
    title: "Chief Instructor",
    image: placeholderImages.instructor1,
    bio: "Jack is a former Special Forces operator with 15 years of military experience. He specializes in tactical training and has instructed military, law enforcement, and civilians for over a decade.",
    specialties: ["Close Quarters Combat", "Tactical Firearms", "Team Tactics"],
    experience: "15 years military, 12 years training"
  },
  {
    id: 2,
    name: "Maria Sanchez",
    title: "Lead Firearms Instructor",
    image: placeholderImages.instructor2,
    bio: "Maria served in law enforcement for 10 years before joining our team. She is a certified firearms instructor and specializes in defensive handgun techniques for civilians.",
    specialties: ["Handgun Instruction", "Women's Self-Defense", "CCW Training"],
    experience: "10 years law enforcement, 8 years training"
  },
  {
    id: 3,
    name: "Derek Wilson",
    title: "Tactical Operations Instructor",
    image: placeholderImages.instructor3,
    bio: "Derek's background includes 8 years with SWAT and extensive experience in high-risk operations. He brings real-world expertise to our tactical scenarios and advanced training programs.",
    specialties: ["Urban Tactics", "Vehicle Defense", "Night Operations"],
    experience: "12 years SWAT, 7 years training"
  },
  {
    id: 4,
    name: "Sarah Thompson",
    title: "Civilian Defense Specialist",
    image: placeholderImages.instructor4,
    bio: "Sarah specializes in practical self-defense techniques for everyday civilians. Her approachable teaching style makes her a favorite among beginners and those new to firearms.",
    specialties: ["Basic Firearms Safety", "Home Defense", "Situational Awareness"],
    experience: "9 years training civilians"
  }
];

const Instructors: React.FC = () => {
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
              <div className="instructor-image">
                <img src={instructor.image} alt={instructor.name} />
              </div>
              <div className="instructor-info">
                <h3 className="instructor-name">{instructor.name}</h3>
                <div className="instructor-title">{instructor.title}</div>
                <p className="instructor-bio">{instructor.bio}</p>
                
                <div className="instructor-specialties">
                  <h4>Specialties:</h4>
                  <ul>
                    {instructor.specialties.map((specialty, index) => (
                      <li key={index}>{specialty}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="instructor-experience">
                  <strong>Experience:</strong> {instructor.experience}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="instructors-cta">
          <p>Our instructors bring decades of real-world experience to the classroom and range</p>
          <a href="#free-class" className="btn btn-primary">Train With Our Experts</a>
        </div>
      </div>
    </section>
  );
};

export default Instructors; 
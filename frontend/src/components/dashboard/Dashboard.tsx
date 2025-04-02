import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { placeholderImages } from '../../utils/placeholderImages';
import './Dashboard.scss';

interface DashboardStats {
  totalStudents: number;
  activePrograms: number;
  upcomingTrainings: number;
  completedTrainings: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activePrograms: 0,
    upcomingTrainings: 0,
    completedTrainings: 0
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulating data fetch
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call
        // const response = await api.getDashboardStats();
        // setStats(response.data);
        
        // Simulated data
        setTimeout(() => {
          setStats({
            totalStudents: 287,
            activePrograms: 6,
            upcomingTrainings: 12,
            completedTrainings: 45
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link to="/">
                <img src={placeholderImages.logo} alt="United Tactical Defense" />
              </Link>
            </div>
            <nav className="nav-menu">
              <ul>
                <li><Link to="/dashboard" className="active">Dashboard</Link></li>
                <li><Link to="/dashboard/programs">Programs</Link></li>
                <li><Link to="/dashboard/students">Students</Link></li>
                <li><Link to="/dashboard/schedule">Schedule</Link></li>
                <li><Link to="/dashboard/reports">Reports</Link></li>
              </ul>
            </nav>
            <div className="user-menu">
              <div className="notifications">
                <i className="fas fa-bell"></i>
                <span className="badge">3</span>
              </div>
              <div className="user-profile">
                <img src={placeholderImages.avatar} alt="User" />
                <span>Admin</span>
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="container">
          <section className="dashboard-welcome">
            <h1>Dashboard</h1>
            <p>Welcome back to the United Tactical Defense admin panel.</p>
          </section>
          
          <section className="dashboard-stats">
            {isLoading ? (
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Loading dashboard data...</span>
              </div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Total Students</h3>
                    <p className="stat-value">{stats.totalStudents}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Active Programs</h3>
                    <p className="stat-value">{stats.activePrograms}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Upcoming Trainings</h3>
                    <p className="stat-value">{stats.upcomingTrainings}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <h3>Completed Trainings</h3>
                    <p className="stat-value">{stats.completedTrainings}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
          
          <section className="dashboard-widgets">
            <div className="widget-grid">
              <div className="widget">
                <div className="widget-header">
                  <h3>Recent Enrollments</h3>
                  <Link to="/dashboard/students" className="view-all">View All</Link>
                </div>
                <div className="widget-content">
                  <p className="placeholder-text">Recent enrollment data will be displayed here.</p>
                </div>
              </div>
              
              <div className="widget">
                <div className="widget-header">
                  <h3>Upcoming Sessions</h3>
                  <Link to="/dashboard/schedule" className="view-all">View All</Link>
                </div>
                <div className="widget-content">
                  <p className="placeholder-text">Upcoming session data will be displayed here.</p>
                </div>
              </div>
              
              <div className="widget">
                <div className="widget-header">
                  <h3>Feedback Summary</h3>
                  <Link to="/dashboard/reports" className="view-all">View All</Link>
                </div>
                <div className="widget-content">
                  <p className="placeholder-text">Feedback summary data will be displayed here.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} United Tactical Defense. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard; 
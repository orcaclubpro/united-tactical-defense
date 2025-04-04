import React from 'react';
import { Link } from 'react-router-dom';
import './AdminNavbar.scss';

interface AdminNavbarProps {
  activePage?: string;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ activePage = 'dashboard' }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin' },
    { id: 'ab-testing', label: 'A/B Testing', path: '/admin/ab-testing' },
    { id: 'forms', label: 'Form Management', path: '/admin/forms' },
    { id: 'analytics', label: 'Analytics', path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <nav className="admin-navbar">
      <div className="logo">
        <Link to="/admin">
          UTD Admin
        </Link>
      </div>
      
      <ul className="nav-links">
        {navItems.map(item => (
          <li key={item.id} className={activePage === item.id ? 'active' : ''}>
            <Link to={item.path}>{item.label}</Link>
          </li>
        ))}
      </ul>
      
      <div className="nav-actions">
        <Link to="/" className="back-to-site">
          Back to Site
        </Link>
      </div>
    </nav>
  );
};

export default AdminNavbar; 
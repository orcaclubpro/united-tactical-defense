import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import './AdminLayout.scss';

interface AdminLayoutProps {
  activePage?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ activePage }) => {
  return (
    <div className="admin-layout">
      <AdminNavbar activePage={activePage} />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout; 
import React, { ReactNode } from 'react';
import './DashboardLayout.scss';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions
}) => {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-layout__header">
        <div className="dashboard-layout__title-container">
          {title && <h1 className="dashboard-layout__title">{title}</h1>}
          {subtitle && <p className="dashboard-layout__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="dashboard-layout__actions">{actions}</div>}
      </header>
      <main className="dashboard-layout__content">
        {children}
      </main>
      <footer className="dashboard-layout__footer">
        <div className="dashboard-layout__footer-content">
          <p>&copy; {new Date().getFullYear()} United Tactical Defense</p>
          <p>Analytics Dashboard</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout; 
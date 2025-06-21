import React, { useState } from 'react';
import Sidebar from '../ui/Sidebar';
import Header from '../ui/Header';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

interface MainLayoutProps {
  userRole: string | null;
  onNavigate: (destination: string) => void;
  forceChooseGroup?: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ userRole, onNavigate: _onNavigate, forceChooseGroup = false, theme, setTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar when route changes
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Show overlay and block navigation if forceChooseGroup
  const handleBlocked = () => {
    // Only show toast, no overlay or button blocking
    import('react-hot-toast').then(({ toast }) => toast.error('Please select your team first!'));
  };

  return (
    <div className="min-h-screen w-full relative">
      <div className="sticky top-0 left-0 right-0 z-40">
        <Header
          theme={theme}
          setTheme={setTheme}
          onLogout={forceChooseGroup ? handleBlocked : () => _onNavigate('logout')}
          onMenuClick={forceChooseGroup ? handleBlocked : () => setSidebarOpen(true)}
        />
      </div>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
        onNavigate={forceChooseGroup ? handleBlocked : _onNavigate}
      />

      <main className="min-h-screen w-full bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100 pt-4 pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
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

  // Mappa strängar till riktiga routes


  // Stäng sidomenyn när route ändras
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Visa overlay och blockera navigation om forceChooseGroup
  const handleBlocked = () => {
    // Visa endast toast, ingen overlay eller blockering av knappar
    import('react-hot-toast').then(({ toast }) => toast.error('Välj ditt team först!'));
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

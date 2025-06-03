import React, { useState } from 'react';
import Sidebar from '../ui/Sidebar';
import Header from '../ui/Header';
import { useLocation, useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  userRole: string | null;
  onNavigate: (destination: string) => void;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ userRole, onNavigate: _onNavigate, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Mappa strängar till riktiga routes
  const handleNavigate = (destination: string) => {
    switch (destination) {
      case 'home':
        navigate('/admin'); break;
      case 'profile':
        navigate('/admin/profile'); break;
      case 'courses':
        navigate('/admin/courses'); break;
      case 'coursecreate':
        navigate('/admin/courses/create'); break;
      case 'questioncreate':
        navigate('/admin/questions/create'); break;
      case 'editcourse':
        navigate('/admin/courses/list'); break;
      case 'editquestion':
        navigate('/admin/questions/course'); break;
      case 'phototoquiz':
        navigate('/admin/phototoquiz'); break;
      case 'texttoquiz':
        navigate('/admin/texttoquiz'); break;
      case 'adminsql':
        navigate('/admin/sql'); break;
      case 'logout':
        localStorage.removeItem('token');
        navigate('/login'); break;
      case 'paywall':
        navigate('/paywall'); break;
      default:
        break;
    }
  };

  // Stäng sidomenyn när route ändras
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full">
      <div className="sticky top-0 left-0 right-0 z-40">
        <Header
          theme={"light"}
          setTheme={() => {}}
          onLogout={() => handleNavigate('logout')}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </div>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
        onNavigate={handleNavigate}
      />
      <main className="min-h-screen w-full bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100 pt-4 pb-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

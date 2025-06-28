import React, { useEffect, useState } from "react";
import ProfileForm from "./ProfileForm";
import Login from "./Login";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from 'react-i18next';

interface ProfilePageProps {
  onDone: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onDone }) => {
  const { token, user, loading: userLoading } = useUser();
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  const [aiModel, setAiModel] = React.useState<string>(() => localStorage.getItem('aiModel') || 'openai');

  // --- Version state ---
  const [backendVersion, setBackendVersion] = useState<string>("");
  const [frontendVersion, setFrontendVersion] = useState<string>("");
  useEffect(() => {
    // Dynamic backend URL depending on environment
    const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const backendUrl = isDev ? "http://localhost:8080/api/version" : "/api/version";
    fetch(backendUrl, { credentials: 'omit' })
      .then(res => {
        if (!res.ok) throw new Error('not ok');
        return res.text();
      })
      .then(setBackendVersion)
      .catch(() => setBackendVersion("unknown"));
    fetch("/FRONTEND_VERSION.txt")
      .then(res => res.text())
      .then(setFrontendVersion)
      .catch(() => setFrontendVersion("unknown"));
  }, []);

  React.useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  React.useEffect(() => { localStorage.setItem('aiModel', aiModel); }, [aiModel]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'sv' ? 'en' : 'sv';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  React.useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  if (localStorage.getItem('force_login') === '1') {
    localStorage.removeItem('force_login');
    return <Login />;
  }
  if (!token) return <Login />;
  if (userLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center py-8 w-full min-h-screen">
      <div className="w-full max-w-md mx-auto">
        {/* Membership status */}
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900 dark:text-neutral-100">{t('profile.statusTitle')}</label>
          {(() => {
            // Consistent premium logic
            const isPremium = user?.role === 'PREMIUM' || user?.role === 'ROLE_PREMIUM';
            let statusColor = 'text-blue-600';
            if (user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_EDUCATOR') statusColor = 'text-red-600';
            else if (isPremium) statusColor = 'text-green-600';
            return (
              <div className={`w-full px-3 py-2 border rounded bg-gray-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 text-base font-normal h-[40px] shadow-md hover:shadow-lg flex items-center justify-center text-center appearance-none ${statusColor} mb-4`}>
                {user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' ? t('profile.statusAdmin') : user?.role === 'ROLE_EDUCATOR' ? t('profile.statusEducator') : isPremium ? t('profile.statusPremium') : t('profile.statusFree')}
              </div>
            );
          })()}
        </div>
        {/* Language selector */}
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900 dark:text-neutral-100">{t('settings.language')}</label>
          <input
            type="button"
            value={i18n.language === 'sv' ? 'Svenska' : 'English'}
            onClick={toggleLanguage}
            className="w-full px-3 py-2 border rounded bg-gray-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 text-base font-normal h-[40px] shadow-md hover:shadow-lg appearance-none"
          />
        </div>
        {/* Theme selector */}
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900 dark:text-neutral-100">{t('settings.theme')}</label>
          <input
            type="button"
            value={theme === 'light' ? t('settings.light') : t('settings.dark')}
            onClick={toggleTheme}
            className="w-full px-3 py-2 border rounded bg-gray-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 text-base font-normal h-[40px] shadow-md hover:shadow-lg appearance-none"
          />
        </div>
        {/* AI model selector */}
        {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
          <div className="mb-4">
            <label className="block text-base font-normal text-left text-neutral-900 dark:text-neutral-100">{t('profile.aimodel')}</label>
            <select
              className="w-full px-3 py-2 border rounded bg-gray-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 text-base font-normal h-[40px] shadow-md hover:shadow-lg appearance-none"
              value={aiModel}
              onChange={e => setAiModel(e.target.value)}
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude 3 Haiku</option>
            </select>
          </div>
        )}
        <ProfileForm token={token} onDone={onDone} showOnly="fields" />
        {/* Version info */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center">
          <div>Backend-version: <code>{backendVersion || "unknown"}</code></div>
          <div>Frontend-version: <code>{frontendVersion || "unknown"}</code></div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

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
    // Dynamisk backend-URL beroende på miljö
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
    <div style={{ padding: 24, width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <ProfileForm token={token} onDone={onDone} showOnly="status" />
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900">{t('settings.language')}</label>
          <input
            type="button"
            value={i18n.language === 'sv' ? 'Svenska' : 'English'}
            onClick={toggleLanguage}
            className="w-full px-3 py-2 border rounded bg-gray-200 text-neutral-900 text-base font-normal h-[40px] shadow-md hover:shadow-lg appearance-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-base font-normal text-left text-neutral-900">{t('settings.theme')}</label>
          <input
            type="button"
            value={theme === 'light' ? t('settings.light') : t('settings.dark')}
            onClick={toggleTheme}
            className="w-full px-3 py-2 border rounded bg-gray-200 text-neutral-900 text-base font-normal h-[40px] shadow-md hover:shadow-lg appearance-none"
          />
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
          <div className="mb-4">
            <label className="block text-base font-normal text-left text-neutral-900">{t('profile.aimodel', 'AI-modell')}</label>
            <select
              className="w-full px-3 py-2 border rounded bg-gray-200 text-neutral-900 text-base font-normal focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-md hover:shadow-lg flex items-center h-[40px] appearance-none"
              value={aiModel}
              onChange={e => setAiModel(e.target.value)}
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude 3 Haiku</option>
            </select>
          </div>
        )}
        <ProfileForm token={token} onDone={onDone} showOnly="fields" />
        {/* --- Version info längst ner --- */}
        <div style={{ marginTop: 32, fontSize: 14, color: '#888', textAlign: 'center' }}>
          <div>Backend-version: <code>{backendVersion || "unknown"}</code></div>
          <div>Frontend-version: <code>{frontendVersion || "unknown"}</code></div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

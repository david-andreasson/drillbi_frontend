import React from "react";
import ProfileForm from "./ProfileForm";
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

  if (!token || userLoading) return <div>Loading...</div>;
  return (
      <div style={{ padding: 24, width: '100%', maxWidth: 600, margin: '0 auto' }}>
        <ProfileForm token={token} onDone={onDone} />
        {/* Språk */}
        <div className="mb-6 bg-gray-200 rounded-lg shadow-md px-6 py-5">
          <label className="block mb-2 font-semibold text-lg text-left">{t('settings.language')}</label>
          <button onClick={toggleLanguage} className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-neutral-800 dark:text-neutral-100 mt-1 font-medium">
            {i18n.language === 'sv' ? 'Svenska' : 'English'}
          </button>
        </div>
        {/* Tema */}
        <div className="mb-6 bg-gray-200 rounded-lg shadow-md px-6 py-5">
          <label className="block mb-2 font-semibold text-lg text-left">{t('settings.theme')}</label>
          <button onClick={toggleTheme} className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-neutral-800 dark:text-neutral-100 mt-1 font-medium">
            {theme === 'light' ? t('settings.light') : t('settings.dark')}
          </button>
        </div>
        {/* AI-modell */}
        {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
            <div className="mb-6 bg-gray-200 rounded-lg shadow-md px-6 py-5">
              <label className="block mb-2 font-semibold text-lg text-left">AI-modell</label>
              <select
                  className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-neutral-800 dark:text-neutral-100 mt-1 font-medium"
                  value={aiModel}
                  onChange={e => setAiModel(e.target.value)}
              >
                <option value="openai">OpenAI</option>
                <option value="claude">Claude 3 Haiku</option>
              </select>
            </div>
        )}

      </div>
  );
};

export default ProfilePage;

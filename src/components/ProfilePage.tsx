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
      {/* Medlemsstatus + användaruppgifter överst */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Medlemsstatus</div>
        <div style={{ marginBottom: 16 }}>{(user && 'isPremium' in user && (user as any).isPremium) ? 'Premium' : 'Gratis'}</div>
        <ProfileForm token={token} onDone={onDone} />
      </div>
      {/* Språk */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{t('settings.language')}</div>
        <button onClick={toggleLanguage} style={{ width: '100%', padding: 10, borderRadius: 8, background: '#f6f6f6', fontWeight: 500 }}>
          {i18n.language === 'sv' ? 'Svenska' : 'English'}
        </button>
      </div>
      {/* Tema */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{t('settings.theme')}</div>
        <button onClick={toggleTheme} style={{ width: '100%', padding: 10, borderRadius: 8, background: '#f6f6f6', fontWeight: 500 }}>
          {theme === 'light' ? t('settings.light') : t('settings.dark')}
        </button>
      </div>
      {/* AI-modell */}
      {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>AI-modell</div>
          <select
            style={{ width: '100%', padding: 10, borderRadius: 8, background: '#f6f6f6', fontWeight: 500 }}
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

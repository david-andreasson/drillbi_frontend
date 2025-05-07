import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import PrimaryButton from "./ui/PrimaryButton";
import { useTranslation } from 'react-i18next';

interface SettingsProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme }) => {
    const { i18n, t } = useTranslation();

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

    const { user, loading } = useUser();
    const [aiModel, setAiModel] = useState<string>(() => localStorage.getItem('aiModel') || 'openai');

    useEffect(() => {
        localStorage.setItem('aiModel', aiModel);
    }, [aiModel]);


    if (loading) {
        return <div className="flex items-center justify-center px-4 py-10 w-full">Laddar användare...</div>;
    }
    return (
        <>

            <div>
                <div
                    className="flex items-center justify-center px-4 py-10 w-full bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100"
                >
                    <div className="w-full max-w-xl">
                        <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>

                        <div className="mb-6">
                            <label className="block mb-2 font-semibold">{t('settings.theme')}</label>
                            <PrimaryButton onClick={toggleTheme} className="w-full">
                                {theme === 'light' ? t('settings.light') : t('settings.dark')}
                            </PrimaryButton>
                        </div>

                        <div className="mb-6">
                            <label className="block mb-2 font-semibold">{t('settings.language')}</label>
                            <PrimaryButton onClick={toggleLanguage}>
                                {i18n.language === 'sv' ? 'Svenska' : 'English'}
                            </PrimaryButton>
                        </div>

                        {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
                            <div className="mb-6">
                                <label className="block mb-2 font-semibold">AI-modell</label>
                                <select
                                    className="w-full px-3 py-2 border rounded bg-gray-100 dark:bg-neutral-800 dark:text-neutral-100"
                                    value={aiModel}
                                    onChange={e => setAiModel(e.target.value)}
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="claude">Claude 3 Haiku</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;
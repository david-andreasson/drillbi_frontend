import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaBars } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';

type ThemeType = 'light' | 'dark';

interface HeaderProps {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    onLogout: () => void;
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, onLogout, onMenuClick }) => {
    const { i18n } = useTranslation();

    const changeLanguage = (lang: 'sv' | 'en') => {
        i18n.changeLanguage(lang).catch(() => {});
        localStorage.setItem('language', lang);
    };

    return (
        <header
            className="flex justify-between items-center px-4 py-3 bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100"
        >
            <div className="flex items-center gap-4">
                <button className="text-xl text-gray-900 dark:text-neutral-100" onClick={onMenuClick} aria-label="Open menu">
                    <FaBars />
                </button>
                <span className="font-semibold">Noeeta</span>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => changeLanguage('sv')}
                    className="px-3 py-1 rounded text-sm font-medium bg-gray-200 text-neutral-900 hover:bg-gray-300 transition shadow-md hover:shadow-lg"
                >
                    SE
                </button>
                <button
                    onClick={() => changeLanguage('en')}
                    className="px-3 py-1 rounded text-sm font-medium bg-gray-200 text-neutral-900 hover:bg-gray-300 transition shadow-md hover:shadow-lg"
                >
                    EN
                </button>
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
        </header>
    );
};

export default Header;
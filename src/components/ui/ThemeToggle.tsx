import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="px-3 py-1 rounded text-sm font-medium bg-gray-200 text-neutral-900 hover:bg-gray-300 transition shadow-md hover:shadow-lg flex items-center justify-center"
      aria-label={t('themeToggle.toggleAriaLabel')}
      title={theme === 'light' ? t('themeToggle.enableDark') : t('themeToggle.disableDark')}
    >
      {theme === 'light' ? (
        <FaMoon className="w-5 h-5" />
      ) : (
        <FaSun className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;

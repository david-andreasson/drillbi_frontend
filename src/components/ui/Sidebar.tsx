import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: string | null;
    onNavigate: (destination: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole, onNavigate }) => {
    const { t } = useTranslation();

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [isOpen, onClose]);

    return (
        <div
            className={`fixed top-0 left-0 h-full w-64 shadow-2xl shadow-md z-50 transform transition-transform duration-300 overflow-y-auto scrollbar-hide ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100`}
        >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold">{t('menu.title')}</h2>
                <button
                    onClick={onClose}
                    className="text-2xl font-bold text-gray-900 hover:text-black dark:text-white dark:hover:text-gray-300"
                >
                    &times;
                </button>
            </div>

            <nav className="flex flex-col gap-3 p-4 text-left">
                <button onClick={() => onNavigate('home')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    {t('menu.home')}
                </button>
                <button onClick={() => onNavigate('courses')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    {t('menu.selectCourse')}
                </button>
                <button onClick={() => { console.log('Sidebar: Inställningar klickad'); onNavigate('settings'); }} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    {t('menu.settings')}
                </button>

                {(userRole === 'ROLE_ADMIN' || userRole === 'ROLE_EDUCATOR') && (
                    <button onClick={() => onNavigate('texttoquiz')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                        {t('menu.textToQuiz')}
                    </button>
                )}

                <button onClick={() => onNavigate('profile')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    Profil
                </button>

                <button
                    onClick={() => onNavigate('logout')}
                    className="text-left hover:underline text-neutral-900 dark:text-neutral-100"
                >
                    {t('menu.logout')}
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
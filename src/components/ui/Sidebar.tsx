import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: string | null;
    onNavigate: (destination: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole, onNavigate }) => {
    const [showContentAdmin, setShowContentAdmin] = useState(false);
    const { t } = useTranslation();
    const [hovering, setHovering] = useState(false);

    useEffect(() => {
        if (!isOpen || hovering) return;
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [isOpen, onClose, hovering]);

    return (
        <div
            className={`fixed top-0 left-0 h-full w-11/12 sm:w-64 max-w-full shadow-2xl shadow-md z-50 transform transition-transform duration-300 overflow-y-auto scrollbar-hide ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100`}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
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
                <button onClick={() => onNavigate('home')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    {t('menu.home', 'Hem')}
                </button>
                <button onClick={() => onNavigate('profile')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    {t('menu.profile', 'Profil')}
                </button>
                <button onClick={() => onNavigate('courses')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    {t('menu.selectCourse', 'Välj kurs')}
                </button>
                <div className="my-1"></div>
                <button
                    onClick={() => setShowContentAdmin((prev) => !prev)}
                    className="block w-full text-left font-semibold hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100"
                    aria-expanded={showContentAdmin}
                >
                    {t('menu.manageContent', 'Hantera innehåll')}
                </button>
                {showContentAdmin && (
                    <div className="pl-4 flex flex-col gap-2">
                        <button
    onClick={() => (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_EDUCATOR') ? onNavigate('coursecreate') : onNavigate('paywall')}
    disabled={userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR'}
    title={userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR' ? 'Endast tillgängligt för lärare och administratörer' : undefined}
    className={`block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-blue-600 ${userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR' ? 'opacity-50 cursor-not-allowed' : ''}`}
>
                            {t('menu.courseCreate', 'Skapa kurs')}
                        </button>
                        <button
    onClick={() => (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_EDUCATOR') ? onNavigate('questioncreate') : onNavigate('paywall')}
    disabled={userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR'}
    title={userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR' ? 'Endast tillgängligt för lärare och administratörer' : undefined}
    className={`block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-orange-600 ${userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR' ? 'opacity-50 cursor-not-allowed' : ''}`}
>
                            {t('menu.questionCreate', 'Skapa fråga')}
                        </button>
                        <button
    onClick={() => (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_EDUCATOR') ? onNavigate('editcourse') : onNavigate('paywall')}
    disabled={userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR'}
    title={userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR' ? 'Endast tillgängligt för lärare och administratörer' : undefined}
    className={`block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-blue-600 ${userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR' ? 'opacity-50 cursor-not-allowed' : ''}`}
>
                            {t('menu.editCourse', 'Redigera kurs')}
                        </button>
                        <button
    onClick={() => (userRole === 'ROLE_ADMIN' || userRole === 'ROLE_EDUCATOR') ? onNavigate('editquestion') : onNavigate('paywall')}
    disabled={userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR'}
    title={userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR' ? 'Endast tillgängligt för lärare och administratörer' : undefined}
    className={`block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-orange-600 ${userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_EDUCATOR' ? 'opacity-50 cursor-not-allowed' : ''}`}
>
                            {t('menu.editQuestion', 'Redigera fråga')}
                        </button>
                    </div>
                )}
                <button onClick={() => onNavigate('phototoquiz')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    {t('menu.photoToQuiz', 'Foto till Quiz')}
                </button>
                <button onClick={() => onNavigate('texttoquiz')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    {t('menu.textToQuiz', 'Text till Quiz')}
                </button>
                <div className="my-1"></div>
                {userRole === 'ROLE_ADMIN' && (
                    <>
                        <button onClick={() => onNavigate('adminsql')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-red-400">
                            {t('menu.adminSQL', 'Admin SQL')}
                        </button>
                        <button
                            onClick={() => onNavigate('logout')}
                            className="block w-full text-left hover:underline text-neutral-900 dark:text-neutral-100"
                        >
                            {t('menu.logout', 'Logga ut')}
                        </button>
                    </>
                )}
                {userRole !== 'ROLE_ADMIN' && (
                    <button
                        onClick={() => onNavigate('logout')}
                        className="block w-full text-left hover:underline text-neutral-900 dark:text-neutral-100"
                    >
                        {t('menu.logout', 'Logga ut')}
                    </button>
                )}
            </nav>
        </div>
    );
};

export default Sidebar;
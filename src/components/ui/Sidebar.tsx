import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userRole: string | null;
    onNavigate: (destination: string) => void;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string | null;
  onNavigate: (destination: string) => void;
  forceChooseGroup?: boolean;
}

import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole, onNavigate, forceChooseGroup = false }) => {
    const navigate = useNavigate();
    const [contentMenuOpen, setContentMenuOpen] = useState(false);
    // Hjälpfunktion för premiumkontroll
    const isPremiumAllowed = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_EDUCATOR';
    const handlePremiumClick = (destination: string) => {
        if (!isPremiumAllowed) {
            navigate('/paywall');
            return;
        }
        onNavigate(destination);
    }
    const { t } = useTranslation();
    const handleBlocked = () => {
        import('react-hot-toast').then(({ toast }) => toast.error('Välj ditt team först!'));
    };

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [isOpen, onClose]);

    // Ref till menyn
    const menuRef = React.useRef<HTMLDivElement>(null);
    // Interval-id för autostängning
    const intervalRef = React.useRef<number | null>(null);
    // Senaste musrörelse-tid
    const lastMoveRef = React.useRef<number>(Date.now());

    React.useEffect(() => {
        const menu = menuRef.current;
        if (!menu || !isOpen) return;

        // Nollställ timer vid ALL interaktion
        const resetTimer = () => {
            lastMoveRef.current = Date.now();
        };
        menu.addEventListener('mousemove', resetTimer);
        menu.addEventListener('mousedown', resetTimer);
        menu.addEventListener('keydown', resetTimer);
        menu.addEventListener('wheel', resetTimer);
        menu.addEventListener('touchstart', resetTimer);

        // Starta intervallet som kollar varje sekund
        intervalRef.current = window.setInterval(() => {
            if (Date.now() - lastMoveRef.current >= 5000) {
                onClose();
            }
        }, 1000);

        return () => {
            menu.removeEventListener('mousemove', resetTimer);
            menu.removeEventListener('mousedown', resetTimer);
            menu.removeEventListener('keydown', resetTimer);
            menu.removeEventListener('wheel', resetTimer);
            menu.removeEventListener('touchstart', resetTimer);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isOpen, onClose]);

    return (
        <div
            ref={menuRef}
            className={`fixed top-0 left-0 h-full w-11/12 sm:w-64 max-w-full shadow-2xl shadow-md z-50 transform transition-transform duration-300 overflow-y-auto scrollbar-hide ${
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
                <button onClick={forceChooseGroup ? handleBlocked : () => onNavigate('home')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    Hem
                </button>
                <button onClick={forceChooseGroup ? handleBlocked : () => onNavigate('courses')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    Välj kurs
                </button>
                <button onClick={forceChooseGroup ? handleBlocked : () => onNavigate('profile')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    Profil
                </button>
                <button
                  onClick={() => setContentMenuOpen(open => !open)}
                  className="flex items-center justify-between w-full text-left font-semibold hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100 mt-2 mb-1"
                  aria-expanded={contentMenuOpen}
                >
                  Hantera innehåll
                </button>
                {contentMenuOpen && (
                  <div className="pl-4 pb-2">
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('phototoquiz')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                        Foto till Quiz
                    </button>
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('texttoquiz')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                        Text till Quiz
                    </button>
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('questioncreate')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-orange-600">
                        Skapa fråga
                    </button>
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('coursecreate')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-blue-600">
                        Skapa kurs
                    </button>
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('editquestion')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-orange-600">
                        Redigera fråga
                    </button>
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('editcourse')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-blue-600">
                        Redigera kurs
                    </button>
                  </div>
                )}
                {userRole === 'ROLE_ADMIN' && (
                    <button onClick={forceChooseGroup ? handleBlocked : () => onNavigate('adminsql')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-red-400 mt-2">
                        Admin SQL
                    </button>
                )}
                <button
                    onClick={forceChooseGroup ? handleBlocked : () => onNavigate('logout')}
                    className="text-left hover:underline text-neutral-900 dark:text-neutral-100 mt-2"
                >
                    Logga ut
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
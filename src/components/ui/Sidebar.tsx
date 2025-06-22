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
    // Helper function for premium check
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
        import('react-hot-toast').then(({ toast }) => toast.error(t('sidebar.selectTeamFirst')));
    };

    // Refs to track interactions
    const menuRef = React.useRef<HTMLDivElement>(null);
    const lastInteractionTime = React.useRef<number>(Date.now());
    const closeTimer = React.useRef<number | null>(null);
    const interactionCheckInterval = React.useRef<number | null>(null);

    // Reset the time for the last interaction
    const handleInteraction = React.useCallback(() => {
        lastInteractionTime.current = Date.now();
    }, []);

    // Start or reset the auto-close timer
    const startCloseTimer = React.useCallback(() => {
        // Clear any existing timer
        if (closeTimer.current) {
            window.clearTimeout(closeTimer.current);
        }
        
        // Set a new timer for auto-close
        closeTimer.current = window.setTimeout(() => {
            onClose();
        }, 5000); // 5 seconds of inactivity
    }, [onClose]);

    // Handle mouse enter into menu
    const handleMouseEnter = React.useCallback(() => {
        // Clear timer when mouse is in menu
        if (closeTimer.current) {
            window.clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    }, []);

    // Handle mouse leave from menu
    const handleMouseLeave = React.useCallback(() => {
        // Start timer when mouse leaves menu
        startCloseTimer();
    }, [startCloseTimer]);

    // Effect to handle menu open/close state
    React.useEffect(() => {
        if (!isOpen) {
            // Clear all timers when menu closes
            if (closeTimer.current) {
                window.clearTimeout(closeTimer.current);
                closeTimer.current = null;
            }
            if (interactionCheckInterval.current) {
                window.clearInterval(interactionCheckInterval.current);
                interactionCheckInterval.current = null;
            }
            return;
        }

        // Start initial timer when menu opens
        startCloseTimer();

        // Set up event listeners for interactions
        const menu = menuRef.current;
        if (menu) {
            menu.addEventListener('mousemove', handleInteraction);
            menu.addEventListener('mousedown', handleInteraction);
            menu.addEventListener('keydown', handleInteraction);
            menu.addEventListener('wheel', handleInteraction);
            menu.addEventListener('touchstart', handleInteraction);
            menu.addEventListener('mouseenter', handleMouseEnter);
            menu.addEventListener('mouseleave', handleMouseLeave);
        }

        // Cleanup on unmount
        return () => {
            if (menu) {
                menu.removeEventListener('mousemove', handleInteraction);
                menu.removeEventListener('mousedown', handleInteraction);
                menu.removeEventListener('keydown', handleInteraction);
                menu.removeEventListener('wheel', handleInteraction);
                menu.removeEventListener('touchstart', handleInteraction);
                menu.removeEventListener('mouseenter', handleMouseEnter);
                menu.removeEventListener('mouseleave', handleMouseLeave);
            }
            if (closeTimer.current) {
                window.clearTimeout(closeTimer.current);
            }
            if (interactionCheckInterval.current) {
                window.clearInterval(interactionCheckInterval.current);
            }
        };
    }, [isOpen, handleInteraction, handleMouseEnter, handleMouseLeave, startCloseTimer]);

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
                    {t('sidebar.home')}
                </button>
                <button onClick={forceChooseGroup ? handleBlocked : () => onNavigate('courses')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    {t('sidebar.selectCourse')}
                </button>
                <button onClick={forceChooseGroup ? handleBlocked : () => onNavigate('profile')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                    {t('sidebar.profile')}
                </button>
                <button
                  onClick={() => setContentMenuOpen(open => !open)}
                  className="flex items-center justify-between w-full text-left font-semibold hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100 mt-2 mb-1"
                  aria-expanded={contentMenuOpen}
                >
                  {t('sidebar.manageContent')}
                </button>
                {contentMenuOpen && (
                  <div className="pl-4 pb-2">
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('phototoquiz')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                        {t('sidebar.photoToQuiz')}
                    </button>
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('texttoquiz')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-neutral-100">
                        {t('sidebar.textToQuiz')}
                    </button>
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('questioncreate')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-orange-600">
                        {t('sidebar.createQuestion')}
                    </button>
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('coursecreate')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-blue-600">
                        {t('sidebar.createCourse')}
                    </button>
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('editquestion')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-orange-600">
                        {t('sidebar.editQuestion')}
                    </button>
                    <button onClick={forceChooseGroup ? handleBlocked : () => handlePremiumClick('editcourse')} className="block w-full text-left hover:underline bg-transparent dark:bg-transparent dark:text-blue-600">
                        {t('sidebar.editCourse')}
                    </button>
                  </div>
                )}
                {userRole === 'ROLE_ADMIN' && (
                    <button onClick={forceChooseGroup ? handleBlocked : () => onNavigate('adminsql')} className="text-left hover:underline bg-transparent dark:bg-transparent dark:text-red-400 mt-2">
                        {t('sidebar.adminSQL')}
                    </button>
                )}
                <button
                    onClick={forceChooseGroup ? handleBlocked : () => onNavigate('logout')}
                    className="text-left hover:underline text-neutral-900 dark:text-neutral-100 mt-2"
                >
                    {t('sidebar.logout')}
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
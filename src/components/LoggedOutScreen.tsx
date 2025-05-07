import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoggedOutScreenProps {
    onLoginAgain: () => void;
}

const LoggedOutScreen: React.FC<LoggedOutScreenProps> = ({ onLoginAgain }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100">
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-6">{t('loggedOut')}</h1>
                <button
                    className="w-full px-6 py-3 rounded-md shadow transition bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-neutral-600 dark:text-neutral-100 dark:hover:bg-neutral-500"
                    onClick={onLoginAgain}
                >
                    {t('logInAgain')}
                </button>
            </div>
        </div>
    );
};

export default LoggedOutScreen;
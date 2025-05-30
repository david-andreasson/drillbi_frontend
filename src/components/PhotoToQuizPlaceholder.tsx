import React from 'react';
import { useTranslation } from 'react-i18next';

const PhotoToQuizPlaceholder: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 py-4 sm:px-4 sm:py-10 w-full bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="w-full max-w-full sm:max-w-xl bg-gray-100 dark:bg-neutral-800 rounded-lg shadow-lg p-4 sm:p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {t('menu.photoToQuiz', 'Foto till Quiz')}
        </h1>
        <p className="text-center text-gray-700 dark:text-gray-200">
          {t('photoToQuiz.placeholder', 'Här kommer en framtida funktion för att skapa quiz från foto. (Endast tillgänglig för premium-medlemmar).')}
        </p>
      </div>
    </div>
  );
};

export default PhotoToQuizPlaceholder;

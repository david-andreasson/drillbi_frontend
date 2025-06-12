import React from 'react';
import PrimaryButton from '../ui/PrimaryButton';
import { useTranslation } from 'react-i18next';

interface Props {
  onDone: () => void;
  courseDisplayName: string;
}

const TextToQuizConfirmation: React.FC<Props> = ({ onDone, courseDisplayName }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 bg-green-100 border border-green-300 rounded-lg shadow-lg mt-8 mb-8">
      <h2 className="text-2xl font-bold text-green-900 mb-2">
        {t('textToQuiz.saveSuccess', 'Frågorna sparades!')}
      </h2>
      <p className="text-green-900 mb-4 text-center">
        {t('textToQuiz.confirmation', 'Dina frågor har sparats till kursen')}: <span className="font-semibold">{courseDisplayName}</span>
      </p>
      <PrimaryButton className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded" onClick={onDone}>
        {t('textToQuiz.done', 'Klar')}
      </PrimaryButton>
    </div>
  );
};

export default TextToQuizConfirmation;

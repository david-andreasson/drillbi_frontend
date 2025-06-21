import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSelectorProps {
  language: 'sv' | 'en';
  setLanguage: (lang: 'sv' | 'en') => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage }) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center mb-2">
      <label className="mr-2 font-medium">{t('textToQuiz.language')}</label>
      <select
        className="border rounded px-2 py-1"
        value={language}
        onChange={e => setLanguage(e.target.value as 'sv' | 'en')}
        data-testid="language-select"
      >
        <option value="sv">{t('textToQuiz.swedish')}</option>
        <option value="en">{t('textToQuiz.english')}</option>
      </select>
    </div>
  );
};

export default LanguageSelector;

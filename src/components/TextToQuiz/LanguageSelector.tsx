import React from 'react';

interface LanguageSelectorProps {
  language: 'sv' | 'en';
  setLanguage: (lang: 'sv' | 'en') => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, setLanguage }) => (
  <div className="flex justify-center mb-2">
    <label className="mr-2 font-medium">Språk:</label>
    <select
      className="border rounded px-2 py-1"
      value={language}
      onChange={e => setLanguage(e.target.value as 'sv' | 'en')}
      data-testid="language-select"
    >
      <option value="sv">Svenska</option>
      <option value="en">English</option>
    </select>
  </div>
);

export default LanguageSelector;

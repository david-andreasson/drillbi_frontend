import React from 'react';
import { useTranslation } from 'react-i18next';

const EducatorContact: React.FC = () => {
  const { t, i18n } = useTranslation();
  

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-2 py-4 sm:px-4 sm:py-10 w-full bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="w-full max-w-full sm:max-w-lg bg-gray-100 dark:bg-neutral-800 rounded-lg shadow-lg p-4 sm:p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {t('educatorContact.title')}
        </h1>
        <p className="mb-4 text-center">
          {t('educatorContact.intro')}
        </p>
        <div className="mb-6">
          <div className="font-semibold mb-2">{t('educatorContact.examplePricing')}</div>
          <ul className="list-disc list-inside text-left text-sm">
            <li>{t('educatorContact.price5to10')}</li>
            <li>{t('educatorContact.price11to20')}</li>
            <li>{t('educatorContact.price21to50')}</li>
            <li>{t('educatorContact.largerGroups')}</li>
          </ul>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2">{t('educatorContact.contactInfo')}</div>
          <ul className="text-left text-sm">
            <li>Email: <a href="mailto:team@dittforetag.se" className="underline text-blue-700">team@dittforetag.se</a></li>
            <li>{t('educatorContact.phone')}</li>
          </ul>
        </div>
        <div className="text-center text-gray-600 text-xs">
          {t('educatorContact.responseTime')}
        </div>
      </div>
    </div>
  );
};

export default EducatorContact;

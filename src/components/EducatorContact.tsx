import React from 'react';
import { useTranslation } from 'react-i18next';

const EducatorContact: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isSwedish = i18n.language === 'sv';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-2 py-4 sm:px-4 sm:py-10 w-full bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="w-full max-w-full sm:max-w-lg bg-gray-100 dark:bg-neutral-800 rounded-lg shadow-lg p-4 sm:p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isSwedish ? 'Kontakta oss för Educator-avtal' : 'Contact us for Educator agreement'}
        </h1>
        <p className="mb-4 text-center">
          {isSwedish
            ? 'Vill du registrera flera elever eller en hel skola? Fyll i formuläret eller kontakta oss direkt så hjälper vi dig med ett anpassat erbjudande!'
            : 'Want to register multiple students or an entire school? Fill out the form or contact us directly and we will help you with a custom offer!'}
        </p>
        <div className="mb-6">
          <div className="font-semibold mb-2">{isSwedish ? 'Prisexempel:' : 'Example pricing:'}</div>
          <ul className="list-disc list-inside text-left text-sm">
            <li>{isSwedish ? '5-10 användare: 49 kr/användare/mån' : '5-10 users: $5/user/month'}</li>
            <li>{isSwedish ? '11-20 användare: 39 kr/användare/mån' : '11-20 users: $4/user/month'}</li>
            <li>{isSwedish ? '21-50 användare: 29 kr/användare/mån' : '21-50 users: $3/user/month'}</li>
            <li>{isSwedish ? 'Större grupper? Kontakta oss för offert!' : 'Larger groups? Contact us for a quote!'}</li>
          </ul>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2">{isSwedish ? 'Kontaktinformation:' : 'Contact information:'}</div>
          <ul className="text-left text-sm">
            <li>Email: <a href="mailto:team@dittforetag.se" className="underline text-blue-700">team@dittforetag.se</a></li>
            <li>{isSwedish ? 'Telefon: 070-123 45 67' : 'Phone: +46 70 123 45 67'}</li>
          </ul>
        </div>
        <div className="text-center text-gray-600 text-xs">
          {isSwedish ? 'Vi återkommer inom 24 timmar!' : 'We will get back to you within 24 hours!'}
        </div>
      </div>
    </div>
  );
};

export default EducatorContact;

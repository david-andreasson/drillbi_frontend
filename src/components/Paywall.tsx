import React from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './ui/PrimaryButton';
import { toast } from 'react-hot-toast';

const educatorTiers = [
  { min: 5, max: 10, priceSEK: 49, priceUSD: 5 },
  { min: 11, max: 20, priceSEK: 39, priceUSD: 4 },
  { min: 21, max: 50, priceSEK: 29, priceUSD: 3 },
];

const Paywall: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isSwedish = i18n.language === 'sv';
  const currency = isSwedish ? 'kr' : 'USD';

  return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10 w-full bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100">
        <div className="w-full max-w-xl bg-gray-100 dark:bg-neutral-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-4 text-center">
            {isSwedish ? 'Bli medlem och lås upp fler funktioner!' : 'Become a member and unlock more features!'}
          </h1>
          <p className="mb-6 text-center">
            {isSwedish
                ? 'Som betalande medlem får du tillgång till alla quizfunktioner, AI-förklaringar, obegränsat antal frågor och mycket mer. Är du lärare/utbildare? Välj Educator för att registrera flera elever till specialpris!'
                : 'As a paying member, you get access to all quiz features, AI explanations, unlimited questions and much more. Are you a teacher/educator? Choose Educator to register multiple students at a special price!'}
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {/* Paying member */}
            <div className="flex-1 bg-white dark:bg-neutral-900 rounded shadow p-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">{isSwedish ? 'Betalande medlem' : 'Paying member'}</h2>
              <div className="text-3xl font-bold mb-2 text-green-600">{isSwedish ? '99 kr/mån' : '$9/month'}</div>
              <ul className="mb-4 text-left list-disc list-inside text-sm">
                <li>{isSwedish ? 'Obegränsat antal quizfrågor' : 'Unlimited quiz questions'}</li>
                <li>{isSwedish ? 'AI-förklaringar & smart feedback' : 'AI explanations & smart feedback'}</li>
                <li>{isSwedish ? 'Spara och exportera quiz' : 'Save and export quizzes'}</li>
                <li>{isSwedish ? 'Prioriterad support' : 'Priority support'}</li>
              </ul>
              <PrimaryButton
                  className="w-full mt-auto"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/v2/stripe/create-checkout-session', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                      });
                      const data = await res.json();
                      if (data && data.url) {
                        window.location.href = data.url;
                      } else {
                        toast.error(isSwedish ? 'Kunde inte starta betalning.' : 'Could not start payment.');
                      }
                    } catch (err) {
                      toast.error(isSwedish ? 'Kunde inte starta betalning.' : 'Could not start payment.');
                    }
                  }}
              >
                {isSwedish ? 'Bli betalande medlem' : 'Become a paying member'}
              </PrimaryButton>
            </div>
            {/* Educator */}
            <div className="flex-1 bg-white dark:bg-neutral-900 rounded shadow p-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">{isSwedish ? 'Educator' : 'Educator'}</h2>
              <div className="mb-2 font-bold text-blue-700">{isSwedish ? 'För skolor & utbildare' : 'For schools & educators'}</div>
              <ul className="mb-4 text-left list-disc list-inside text-sm">
                {educatorTiers.map((tier, idx) => (
                    <li key={idx}>
                      {isSwedish
                          ? `${tier.min}-${tier.max} användare: ${tier.priceSEK} kr/användare/mån`
                          : `${tier.min}-${tier.max} users: $${tier.priceUSD}/user/month`}
                    </li>
                ))}
                <li>{isSwedish ? 'Anpassade lösningar för större grupper' : 'Custom solutions for larger groups'}</li>
                <li>{isSwedish ? 'Faktura eller kortbetalning' : 'Invoice or card payment'}</li>
              </ul>
              <PrimaryButton className="w-full mt-auto" onClick={() => window.location.href = '/educator-contact'}>
                {isSwedish ? 'Kontakta oss' : 'Contact us'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Paywall;

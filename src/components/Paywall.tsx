import React from 'react';
import { useTranslation } from 'react-i18next';
import PrimaryButton from './ui/PrimaryButton';
import { toast } from 'react-hot-toast';

const educatorTiers = [
  { min: 5, max: 10, priceSEK: 49, priceUSD: 5 },
  { min: 11, max: 20, priceSEK: 39, priceUSD: 4 },
  { min: 21, max: 50, priceSEK: 29, priceUSD: 3 },
];

interface PaywallProps {
  onBack?: () => void;
}

import { useNavigate } from 'react-router-dom';

const Paywall: React.FC<PaywallProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-2 py-4 sm:px-4 sm:py-10 w-full bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100">
        <div className="w-full max-w-full sm:max-w-xl bg-gray-100 dark:bg-neutral-800 rounded-lg shadow-lg p-4 sm:p-8">
          <h1 className="text-2xl font-bold mb-4 text-center">
            {t('paywall.title')}
          </h1>
          <p className="mb-6 text-center">
            {t('paywall.intro')}
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            {/* Payment button only for free users */}
            <div className="flex-1 bg-white dark:bg-neutral-900 rounded shadow p-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">{t('paywall.payingMember')}</h2>
              <div className="text-3xl font-bold mb-2 text-green-600">{t('paywall.price')}</div>
              <ul className="mb-4 text-left list-disc list-inside text-sm">
                <li>{t('paywall.unlimitedQuestions')}</li>
                <li>{t('paywall.aiExplanations')}</li>
                <li>{t('paywall.saveExport')}</li>
                <li>{t('paywall.prioritySupport')}</li>
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
                        toast.error(t('paywall.paymentError'));
                      }
                    } catch {
                      toast.error(t('paywall.paymentError'));
                    }
                  }}
              >
                {t('paywall.becomePayingMember')}
              </PrimaryButton>
            </div>
            {/* Educator */}
            <div className="flex-1 bg-white dark:bg-neutral-900 rounded shadow p-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">{t('paywall.educator')}</h2>
              <div className="mb-2 font-bold text-blue-700">{t('paywall.forSchools')}</div>
              <ul className="mb-4 text-left list-disc list-inside text-sm">
                {educatorTiers.map((tier, idx) => (
                    <li key={idx}>
                      {t('paywall.educatorTier', { min: tier.min, max: tier.max, priceSEK: tier.priceSEK, priceUSD: tier.priceUSD })}
                    </li>
                ))}
                <li>{t('paywall.customSolutions')}</li>
                <li>{t('paywall.invoiceOrCard')}</li>
              </ul>
              <PrimaryButton className="w-full mt-auto" onClick={() => window.location.href = '/educator-contact'}>
                {t('paywall.contactUs')}
              </PrimaryButton>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <PrimaryButton className="w-full max-w-xs" onClick={() => {
              if (onBack) onBack();
              else navigate('/');
            }}>
              {t('paywall.back')}
            </PrimaryButton>
          </div>
        </div>
      </div>
  );
};

export default Paywall;

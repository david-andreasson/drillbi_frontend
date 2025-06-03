import React from 'react';
import PrimaryButton from './ui/PrimaryButton';
import { toast } from 'react-hot-toast';

const GROUPS = [
  { name: 'JIN24', action: 'courses' },
  { name: 'Transdev', action: 'forbidden' },
  { name: 'Protrain', action: 'forbidden' },
  { name: 'Green Cargo', action: 'forbidden' },
  { name: 'Dackeskolan', action: 'forbidden' },
  { name: 'Blacksta Körskola', action: 'forbidden' },
];

import { useTranslation } from 'react-i18next';

const GroupSelection: React.FC<{ onSelectGroup: (group: string) => void }> = ({ onSelectGroup }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 bg-white dark:bg-neutral-900 w-full">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4 text-center text-gray-900 dark:text-neutral-100">
          {t('groupSelection.title')}
        </h1>
        <p className="mb-10 text-gray-600 dark:text-neutral-100">
          {t('groupSelection.instruction')}
        </p>
        <div className="grid gap-4">
          {GROUPS.map(group => (
            <PrimaryButton
              key={group.name}
              className="w-full"
              onClick={() => {
                if (group.action === 'courses') {
                  onSelectGroup(group.name);
                } else {
                  toast.error('Du har inte behörighet att visa denna sida');
                }
              }}
            >
              {group.name}
            </PrimaryButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupSelection;

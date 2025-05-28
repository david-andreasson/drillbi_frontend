import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  submitted: boolean;
  isCorrect: boolean | null;
  aiState: 'idle' | 'preparing' | 'display';
  aiExplanation: string;
  onExplain: () => void;
  disabled?: boolean;
  label: string;
  loadingLabel: string;
}

const AiExplanation: React.FC<Props> = ({
  submitted,
  isCorrect,
  aiState,
  aiExplanation,
  onExplain,
  disabled,
  label,
  loadingLabel
}) => {
  console.log('AiExplanation PROPS', { submitted, isCorrect, aiState, aiExplanation, disabled, label, loadingLabel });
  const { t } = useTranslation();
  if (!submitted || isCorrect) return null;

  return (
      <div className="flex flex-col items-center space-y-4 mt-4">
        <button
            className="px-6 py-2 bg-gray-200 text-neutral-900 hover:bg-gray-300 font-medium rounded flex items-center gap-2 shadow-md hover:shadow-lg"
            onClick={e => {
              alert('KLICK!');
              console.log('AiExplanation BUTTON CLICK', { disabled, aiState, submitted, isCorrect });
              if (!(disabled || aiState === 'preparing')) onExplain();
            }}
            disabled={disabled || aiState === 'preparing'}
            title={
              !submitted || isCorrect ? 'Du måste svara fel först' :
              disabled ? 'Endast för premium' :
              aiState === 'preparing' ? 'Vänta på AI...' : ''
            }
        >
          {aiState === 'preparing' ? (
              <>
                {loadingLabel}
                <span className="flex gap-1 ml-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </span>
              </>
          ) : (
              label
          )}
        </button>

        {aiState === 'display' && aiExplanation && (
            <div className="mt-4 p-4 bg-gray-200 rounded-lg border border-gray-200 shadow-md hover:shadow-lg text-gray-900">
                <p className="whitespace-pre-wrap text-left">{aiExplanation}</p>
            </div>
        )}
      </div>
  );
};

export default AiExplanation;
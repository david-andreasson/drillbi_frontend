import React from 'react';
import { QuestionDTO } from '../../types/QuestionDTO';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../ui/PrimaryButton';

interface Props {
    question: QuestionDTO;
    index: number;
    onRegenerateQuestion: (index: number) => void;
    onRegenerateOptions: (index: number, aiModel?: string) => void;
    onToggleSave: (index: number) => void;
    isSaved: boolean;
    isRegeneratingQuestion: boolean;
    isRegeneratingOptions: boolean;
    disableAll: boolean;
    aiModel?: string;
}

const QuestionPreview: React.FC<Props> = ({
                                              question,
                                              index,
                                              onRegenerateQuestion,
                                              onRegenerateOptions,
                                              onToggleSave,
                                              isSaved,
                                              isRegeneratingQuestion,
                                              isRegeneratingOptions,
                                              disableAll,
                                              aiModel,
                                          }) => {
    const { t } = useTranslation();

    return (
        <div className="border p-4 mb-4 bg-white rounded-md shadow-md text-gray-900 border-gray-200 dark:bg-neutral-900 dark:text-neutral-100 dark:border-neutral-700">
            <p className="font-semibold mb-2">
                {index + 1}. {question.questionText}
            </p>

            <div className="mb-4">
                {question.options.map((opt, i) => (
                    <div key={i}>
                        <strong>{opt.optionLabel}:</strong> {opt.optionText}
                        <span className="ml-2 text-xs text-gray-500">
                            ({opt.isCorrect ? t('textToQuiz.true') : t('textToQuiz.false')})
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <PrimaryButton
                        onClick={() => onRegenerateQuestion(index)}
                        disabled={disableAll}
                        className="mr-2"
                    >
                        {isRegeneratingQuestion ? (
                            <span className="inline-flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 mr-1 text-blue-500" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                {t('textToQuiz.regenerating')}
                            </span>
                        ) : t('textToQuiz.regenerateQuestion')}
                    </PrimaryButton>
                    <PrimaryButton
                        type="button"
                        onClick={() => onRegenerateOptions(index, aiModel)}
                        disabled={isRegeneratingOptions || disableAll}
                    >
                        {isRegeneratingOptions ? (
                            <span className="inline-flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 mr-1 text-blue-500" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                {t('textToQuiz.regeneratingOptions')}
                            </span>
                        ) : t('textToQuiz.regenerateOptions')}
                    </PrimaryButton>
                </div>
                <label className="inline-flex items-center ml-2">
                    <input
                        type="checkbox"
                        checked={isSaved}
                        onChange={() => onToggleSave(index)}
                        className="mr-2"
                        disabled={disableAll}
                    />
                    {t('textToQuiz.save')}
                </label>
            </div>
        </div>
    );
};

export default QuestionPreview;
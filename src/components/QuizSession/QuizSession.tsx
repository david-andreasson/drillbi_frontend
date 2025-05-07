import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuizSession } from './useQuizSession';
import QuestionBlock from './QuestionBlock';
import AiExplanation from './AiExplanation';
import PrimaryButton from '../ui/PrimaryButton';
import { useCourses } from '../CourseSelection/useCourses';

interface QuizSessionProps {
    courseName: string;
    orderType: 'ORDER' | 'RANDOM' | 'REVERSE';
    startQuestion: number;
    sessionId?: string;
    onOrderChange: () => void;
}


function getOrderTranslationKey(orderType: 'ORDER' | 'RANDOM' | 'REVERSE'): string {
    if (orderType === 'ORDER') return 'orderSequential';
    if (orderType === 'RANDOM') return 'orderRandom';
    if (orderType === 'REVERSE') return 'orderReverse';
    return 'orderSequential';
}

const QuizSession: React.FC<QuizSessionProps> = ({
                                                     courseName,
                                                     orderType,
                                                     startQuestion,
                                                     sessionId: parentSessionId,
                                                     onOrderChange
                                                 }) => {
    const { t, i18n } = useTranslation();

    const {
        sessionId,
        question,
        selectedOption,
        submitted,
        isCorrect,
        aiState,
        aiExplanation,
        stats,
        loggedInUser,
        detailedFeedback,
        setSelectedOption,
        getNextQuestion,
        submitAnswer,
        handleAiExplanation
    } = useQuizSession({
        courseName,
        orderType,
        startQuestion,
        parentSessionId
    });

    const { courses } = useCourses();
    const selectedCourse = courses.find(c => c.name === courseName);

    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-6 text-neutral-900 dark:text-neutral-100">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold">
                    {t('selectedCourse')}: {selectedCourse?.displayName || courseName}
                </h2>
                <p className="text-base flex justify-center items-center gap-2 mt-4">
                    {t('order')}: {t(getOrderTranslationKey(orderType))}
                    <button
                        className="text-xs underline hover:text-gray-600"
                        onClick={onOrderChange}
                        title="Change order"
                    >
                        🔄
                    </button>
                </p>
            </div>

            {question && (
                <QuestionBlock
                    question={question}
                    selectedOption={selectedOption}
                    submitted={submitted}
                    isCorrect={isCorrect}
                    onSelect={(label) => {
                        setSelectedOption(label);
                        if (sessionId) {
                            submitAnswer(sessionId, label);
                        }
                    }}
                />
            )}

            <div className="mt-6 space-y-4 text-center">
                {submitted && sessionId && question && (
                    <div>
                        <PrimaryButton onClick={() => getNextQuestion(sessionId)}>

    {t('nextQuestion')}
</PrimaryButton>
                    </div>
                )}

                <AiExplanation
                    submitted={submitted}
                    isCorrect={isCorrect}
                    aiState={aiState}
                    aiExplanation={aiExplanation}
                    onExplain={() => question && sessionId && handleAiExplanation(
                        sessionId,
                        question.questionText,
                        question.options.find((o: any) => o.isCorrect)?.optionText || '',
                        courseName,
                        i18n.language as 'sv' | 'en'
                    )}
                    label={t('explainWithAI')}
                    loadingLabel={t('aiThinking')}
                />

                {stats && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-neutral-100">
                        {t('stats', {
                            score: stats.score,
                            total: stats.total,
                            errorRate: stats.errorRate.toFixed(2)
                        })}
                    </p>
                )}
            </div>
        </div>
    );
};

export default QuizSession;
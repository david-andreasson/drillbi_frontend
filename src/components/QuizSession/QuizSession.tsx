import React from 'react';
import { AppContext } from '../../App'; // Justera sökvägen om det behövs
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
    onDone?: () => void;
    onSessionId?: (id: string) => void;
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
    onOrderChange,
    onDone,
    onSessionId
}) => {
    const [error, setError] = React.useState<string | null>(null);
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
        // If loggedInUser is missing the correct type, we can cast it here:
        // const userWithPremium = loggedInUser as typeof loggedInUser & { isPremium?: boolean };

        detailedFeedback,
        setSelectedOption,
        getNextQuestion,
        submitAnswer,
        handleAiExplanation,
        error: sessionError
    } = useQuizSession({
        courseName,
        orderType,
        startQuestion,
        parentSessionId,
        setError,
    });

    // Spara sessionId i localStorage när det ändras och är nytt
    React.useEffect(() => {
        if (sessionId && onSessionId) {
            onSessionId(sessionId);
        }
    }, [sessionId, onSessionId]);

    const { courses } = useCourses();
    const selectedCourse = courses.find(c => c.name === courseName);

    // Anropa onDone när quizet är klart
    const handleQuizFinish = () => {
        if (onDone) onDone();
    };


    if (error || sessionError) {
        return (
            <div className="w-full max-w-3xl mx-auto px-4 py-6 text-red-600 dark:text-red-400">
                <h2 className="text-2xl font-semibold mb-4">Ett fel uppstod</h2>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error || sessionError}</pre>
                <button className="mt-6 px-4 py-2 bg-gray-200 rounded" onClick={() => window.location.reload()}>Ladda om sidan</button>
            </div>
        );
    }

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

                {/* Endast premium-medlemmar får använda AI-förklaringen */}
                {/* Knappen synlig för alla, men olika onExplain beroende på medlemskap */}
                <AppContext.Consumer>
                  {({ triggerPaywall }) => (
                    <AiExplanation
                      submitted={submitted}
                      isCorrect={isCorrect}
                      aiState={aiState}
                      aiExplanation={aiExplanation}
                      onExplain={() => {
                        // Cast loggedInUser if needed
                        const userWithPremium = loggedInUser as typeof loggedInUser & { isPremium?: boolean };
                        if (userWithPremium?.isPremium) {
                          question && sessionId && handleAiExplanation(
                            sessionId,
                            question.questionText,
                            question.options.find((o: any) => o.isCorrect)?.optionText || '',
                            courseName,
                            i18n.language as 'sv' | 'en'
                          );
                        } else {
                          triggerPaywall();
                        }
                      }}
                      label={t('explainWithAI')}
                      loadingLabel={t('aiThinking')}
                    />
                  )}
                </AppContext.Consumer>

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
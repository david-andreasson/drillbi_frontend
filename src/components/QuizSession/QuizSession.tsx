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
        setSelectedOption,
        getNextQuestion,
        submitAnswer,
        handleAiExplanation,
        detailedFeedback,
        error: sessionError,
    } = useQuizSession({
        courseName,
        orderType,
        startQuestion,
        parentSessionId,
        setError,
    });

    // Premiumstatus (robust mot olika property-namn)
    const premiumRaw = (loggedInUser && (
        (loggedInUser as any).IS_PREMIUM ??
        (loggedInUser as any).isPremium ??
        (loggedInUser as any).is_premium
    )) ?? false;
    const isPremium = Boolean(premiumRaw);
    console.log('PREMIUM DEBUG', { loggedInUser, premiumRaw, isPremium });

    // Helper: check if user is admin
    function isAdmin(user: any): boolean {
        if (!user) return false;
        // Accepts 'ADMIN' or 'ROLE_ADMIN' (case-insensitive)
        return (
            user.role?.toUpperCase() === 'ADMIN' ||
            user.role?.toUpperCase() === 'ROLE_ADMIN' ||
            (Array.isArray(user.roles) && user.roles.some((r: string) => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'ROLE_ADMIN'))
        );
    }


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

    console.log('QuizSession DEBUG', {
        isPremium,
        loggedInUser,
        sessionId,
        question,
        aiState,
        aiExplanation,
        submitted
    });
    return (
        <div className="w-full max-w-3xl mx-auto px-4 py-6 text-neutral-900 dark:text-neutral-100">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold">
                    {selectedCourse?.displayName || courseName}
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
                        console.log('AI Explain Click:', { isPremium, sessionId });
                        if (isPremium) {
                          if (question && sessionId) {
                            handleAiExplanation(
                              sessionId,
                              question.questionText,
                              question.options.find((o: any) => o.isCorrect)?.optionText || '',
                              courseName,
                              i18n.language as 'sv' | 'en'
                            );
                          }
                        } else {
                          triggerPaywall();
                        }
                      }}
                      label={t('explainWithAI')}
                      loadingLabel={t('aiThinking')}
                      disabled={!isPremium || aiState === 'preparing'}
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
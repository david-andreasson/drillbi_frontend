import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useTranslation } from 'react-i18next';
import { useQuizSession } from './useQuizSession';
import QuestionBlock from './QuestionBlock';
import AiExplanation from './AiExplanation';
import PrimaryButton from '../ui/PrimaryButton';
import { useCourses } from '../CourseSelection/useCourses';
import { useNavigate } from 'react-router-dom';

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
    const { triggerPaywall } = useAppContext(); // Hämta triggerPaywall från context
    const navigate = useNavigate();
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
        <div className="flex flex-col items-center w-full">
            <style>{`
              @media (max-width: 640px) {
                .quiz-mobile-gap {
                  margin-bottom: 12px !important;
                }
                .quiz-mobile-gap-area {
                  margin-bottom: 12px;
                }
                @media (max-width: 640px) {
                  .quiz-mobile-gap-area {
                    margin-bottom: 6px !important;
                  }
                }
              }
            `}</style>
            {/* Kursnamn och ordning centrerat och på separata rader */}
            <div className="w-full max-w-2xl mb-3 md:mb-6">
                <div className="flex flex-col items-center gap-1 mb-2 quiz-mobile-gap">
                    <h2 className="text-2xl font-bold text-center">{selectedCourse?.displayName || courseName}</h2>
                    <span className="text-lg font-medium text-gray-600 dark:text-gray-300 text-center">
                        {t('order')}: {t(getOrderTranslationKey(orderType))}
                        <button
                            className="text-xs underline hover:text-gray-600 ml-2"
                            onClick={onOrderChange}
                            title="Change order"
                        >
                            🔄
                        </button>
                    </span>
                </div>
            </div>
             {/* Mellanrum mellan kursnamn och ordning */}
            <div className="quiz-mobile-gap-area" />
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
            <div className="mt-4 md:mt-6 space-y-4 text-center">
                {submitted && sessionId && question && (
                    <div>
                        <PrimaryButton onClick={() => getNextQuestion(sessionId)}>
                            {t('nextQuestion')}
                        </PrimaryButton>
                    </div>
                )}

                {/* Endast visa AI-förklaring om svaret är felaktigt och inskickat */}
                {submitted && isCorrect === false && (
                    <AiExplanation
                        submitted={submitted}
                        isCorrect={isCorrect}
                        aiState={aiState}
                        aiExplanation={aiExplanation}
                        onExplain={() => {
                          console.log('AI Explain Click:', { isPremium, sessionId, loggedInUser });
                          const userRole = Array.isArray(loggedInUser?.role)
                            ? (loggedInUser?.role.find((r: string) => r === 'ROLE_ADMIN' || r === 'ADMIN') ?? loggedInUser?.role[0])
                            : loggedInUser?.role;
                          const userIsPremium = loggedInUser?.isPremium ?? isPremium;
                          if (userRole !== 'ROLE_ADMIN' && userRole !== 'ADMIN' && !userIsPremium) {
                            triggerPaywall();
                            navigate('/paywall');
                            return;
                          }
                          if (question && sessionId) {
                            handleAiExplanation(
                              sessionId,
                              question.questionText,
                              question.options.find((o: any) => o.isCorrect)?.optionText || '',
                              courseName,
                              i18n.language as 'sv' | 'en'
                            );
                          }
                        }}
                        label={t('explainWithAI')}
                        loadingLabel={t('aiThinking')}
                        disabled={aiState === 'preparing'}
                    />
                )}

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
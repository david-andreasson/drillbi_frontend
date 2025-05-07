import { useEffect, useState } from 'react';
import { parseJwt, fetchWithAuth } from '../../utils/auth';

interface SessionStatsDTO {
    score: number;
    total: number;
    errorRate: number;
}

interface AnswerResponseDTO {
    correct: boolean;
    feedbackKey: string;
    option: string;
    correctAnswer?: string;
    stats?: SessionStatsDTO;
}

export interface UseQuizSessionParams {
    courseName: string;
    orderType: 'ORDER' | 'RANDOM' | 'REVERSE';
    startQuestion: number;
    parentSessionId?: string;
}

type AiState = 'idle' | 'preparing' | 'display';

const API_BASE = `/api/v2/quiz`;

export function useQuizSession({
                                   courseName,
                                   orderType,
                                   startQuestion,
                                   parentSessionId
                               }: UseQuizSessionParams) {
    // Session identifier
    const [sessionId, setSessionId] = useState<string | undefined>(parentSessionId);

    // State for the current question
    const [question, setQuestion] = useState<any>(null);
    const [selectedOption, setSelectedOption] = useState<string>('');
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [detailedFeedback, setDetailedFeedback] = useState<string | undefined>(undefined);
    const [stats, setStats] = useState<SessionStatsDTO | undefined>(undefined);
    const [loggedInUser, setLoggedInUser] = useState<{ username: string } | null>(null);

    // State for AI explanation
    const [aiState, setAiState] = useState<AiState>('idle');
    const [aiExplanation, setAiExplanation] = useState<string>('');

    // Fetch logged-in user info from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = parseJwt(token);
            if (decoded && decoded.sub) {
                setLoggedInUser({ username: decoded.sub });
            }
        }
    }, []);

    // Initialize or resume quiz session
    useEffect(() => {
        if (sessionId) {
            getNextQuestion(sessionId);
        } else {
            startQuiz(courseName, orderType, startQuestion);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseName, orderType, startQuestion, parentSessionId]);

    // Start a new quiz session
    const startQuiz = async (
        course: string,
        order: 'ORDER' | 'RANDOM' | 'REVERSE',
        startIdx: number
    ) => {
        setQuestion(null);
        setSelectedOption('');
        setSubmitted(false);
        setIsCorrect(null);
        setDetailedFeedback(undefined);
        setStats(undefined);

        const url = `${API_BASE}/start?courseName=${encodeURIComponent(
            course
        )}&orderType=${order}&startQuestion=${startIdx - 1}`;
        const res = await fetchWithAuth(url, { method: 'POST' });
        if (!res.ok) {
            throw new Error(`Failed to start quiz: ${res.status}`);
        }
        const session = await res.json();
        setSessionId(session.sessionId);
        await getNextQuestion(session.sessionId);
    };

    // Get the next question in the session
    const getNextQuestion = async (sessId: string) => {
        const url = `${API_BASE}/next?sessionId=${encodeURIComponent(sessId)}`;
        const res = await fetchWithAuth(url);
        if (!res.ok) {
            throw new Error(`Failed to get next question: ${res.status}`);
        }
        const data = await res.json();
        console.log('Question data:', data);
        setQuestion(data);
        setSelectedOption('');
        setSubmitted(false);
        setIsCorrect(null);
        setDetailedFeedback(undefined);
        setAiExplanation('');
        setAiState('idle');
    };

    // Submit the user's answer
    const submitAnswer = async (sessId: string, answer: string) => {
        if (!question) return;
        setSubmitted(true);

        const url = `${API_BASE}/submit?sessionId=${encodeURIComponent(
            sessId
        )}&answer=${encodeURIComponent(answer)}`;
        const res = await fetchWithAuth(url, { method: 'POST' });
        if (!res.ok) {
            throw new Error(`Failed to submit answer: ${res.status}`);
        }
        const feedback: AnswerResponseDTO = await res.json();
        console.log('Submit answer feedback:', feedback);
        setIsCorrect(feedback.correct);
        setDetailedFeedback(feedback.feedbackKey);
        setStats(feedback.stats);
    };

    // Fetch AI explanation when the answer is incorrect
    const handleAiExplanation = async (
        sessId: string,
        questionText: string,
        correctAnswer: string,
        course: string,
        lang: 'sv' | 'en' = 'sv'
    ) => {
        setAiState('preparing');
        const url = `/api/v2/explain`;
        const res = await fetchWithAuth(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question,            // the entire question object
                selectedOption,      // label, e.g. "A"
                language: lang,
                aiModel: localStorage.getItem('aiModel') || 'openai',
            }),
        });
        if (!res.ok) {
            setAiState('idle');
            // Fel visas för användaren på annat sätt, ingen logg behövs här.
            return;
        }
        const text = await res.text();
        setAiExplanation(text);
        setAiState('display');
    };

    return {
        sessionId,
        question,
        selectedOption,
        submitted,
        isCorrect,
        detailedFeedback,
        stats,
        loggedInUser,
        aiState,
        aiExplanation,

        setSelectedOption,
        startQuiz,
        getNextQuestion,
        submitAnswer,
        handleAiExplanation,
    };
}
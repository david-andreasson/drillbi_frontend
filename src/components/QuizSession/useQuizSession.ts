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
    setError?: (err: string) => void;
}

type AiState = 'idle' | 'preparing' | 'display';

const API_BASE = `/api/v2/quiz`;

export function useQuizSession(args: UseQuizSessionParams) {
    const { courseName, orderType, startQuestion, parentSessionId, setError } = args;
    // Session identifier
    const [sessionId, setSessionId] = useState<string | undefined>(parentSessionId);

    // Error state
    const [error, setLocalError] = useState<string | null>(null);

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

    // Rensa sessionId när kurs, ordning eller startfråga ändras
    useEffect(() => {
        setSessionId(undefined);
    }, [courseName, orderType, startQuestion]);

    // Initialize or resume quiz session
    useEffect(() => {
        if (sessionId) {
            getNextQuestion(sessionId);
        } else {
            startQuiz(courseName, orderType, startQuestion);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, courseName, orderType, startQuestion, parentSessionId]);

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
        try {
            const url = `${API_BASE}/start?courseName=${encodeURIComponent(
                course
            )}&orderType=${order}&startQuestion=${startIdx - 1}`;
            const res = await fetchWithAuth(url, { method: 'POST' });
            if (!res.ok) {
                const msg = `Failed to start quiz: ${res.status}`;
                if (typeof setError === 'function') setError(msg);
                setLocalError(msg);
                console.error(msg);
                return;
            }
            const session = await res.json();
            setSessionId(session.sessionId);
            await getNextQuestion(session.sessionId);
        } catch (e: any) {
            const msg = `Quiz start error: ${e?.message || e}`;
            if (typeof setError === 'function') setError(msg);
            setLocalError(msg);
            console.error(msg);
        }
    };

    // Get the next question in the session
    const getNextQuestion = async (sessId: string) => {
        try {
            const url = `${API_BASE}/next?sessionId=${encodeURIComponent(sessId)}`;
            const res = await fetchWithAuth(url);
            if (!res.ok) {
                const msg = `Failed to get next question: ${res.status}`;
                if (typeof setError === 'function') setError(msg);
                setLocalError(msg);
                console.error(msg);
                return;
            }
            // Försök tolka som JSON, annars som text
            let data;
            const text = await res.text();
            try {
                data = JSON.parse(text);
            } catch (err) {
                // Om det inte är JSON, visa ett användarvänligt felmeddelande
                const msg = text && text.includes('Quiz finished')
                    ? 'Quizet är slut!'
                    : `Kunde inte läsa nästa fråga: ${text}`;
                if (typeof setError === 'function') setError(msg);
                setLocalError(msg);
                setQuestion(null);
                return;
            }
            console.log('Question data:', data);
            setQuestion(data);
            setSelectedOption('');
            setSubmitted(false);
            setIsCorrect(null);
            setDetailedFeedback(undefined);
            setAiExplanation('');
            setAiState('idle');
        } catch (e: any) {
            const msg = `Get next question error: ${e?.message || e}`;
            if (typeof setError === 'function') setError(msg);
            setLocalError(msg);
            console.error(msg);
        }
    };

    // Submit the user's answer
    const submitAnswer = async (sessId: string, answer: string) => {
        if (!question) return;
        // Direkt feedback på klienten
        const selected = question.options.find((o: any) => o.optionLabel === answer);
        if (selected) {
            setIsCorrect(!!selected.isCorrect);
        }
        setSubmitted(true);
        try {
            const url = `${API_BASE}/submit?sessionId=${encodeURIComponent(
                sessId
            )}&answer=${encodeURIComponent(answer)}`;
            const res = await fetchWithAuth(url, { method: 'POST' });
            if (!res.ok) {
                const msg = `Failed to submit answer: ${res.status}`;
                if (typeof setError === 'function') setError(msg);
                setLocalError(msg);
                console.error(msg);
                return;
            }
            const feedback: AnswerResponseDTO = await res.json();
            console.log('Submit answer feedback:', feedback);
            setIsCorrect(feedback.correct);
            setDetailedFeedback(feedback.feedbackKey);
            setStats(feedback.stats);
        } catch (e: any) {
            const msg = `Submit answer error: ${e?.message || e}`;
            if (typeof setError === 'function') setError(msg);
            setLocalError(msg);
            console.error(msg);
        }
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
        try {
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
                const msg = `Failed to fetch AI explanation: ${res.status}`;
                if (typeof setError === 'function') setError(msg);
                setLocalError(msg);
                console.error(msg);
                return;
            }
            const text = await res.text();
            setAiExplanation(text);
            setAiState('display');
        } catch (e: any) {
            setAiState('idle');
            const msg = `AI explanation error: ${e?.message || e}`;
            if (typeof setError === 'function') setError(msg);
            setLocalError(msg);
            console.error(msg);
        }
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
        error,

        setSelectedOption,
        startQuiz,
        getNextQuestion,
        submitAnswer,
        handleAiExplanation,
    };

}
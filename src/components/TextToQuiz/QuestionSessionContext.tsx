import React, { createContext, useContext, useState } from 'react';
import { QuestionDTO } from '../../types/QuestionDTO';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { QuestionOptionDTO } from '../../types/QuestionDTO';

interface QuestionSessionContextProps {
    questions: QuestionDTO[] | null;
    savedFlags: boolean[];
    setQuestions: (questions: QuestionDTO[] | null, sourceText?: string) => void;
    onToggleSave: (index: number) => void;
    onRegenerateQuestion: (index: number) => Promise<void>;
    onRegenerateOptions: (index: number, aiModel?: string) => Promise<void>;
}

const QuestionSessionContext = createContext<QuestionSessionContextProps | undefined>(undefined);

export const QuestionSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sourceText, setSourceText] = useState<string>('');
    const [questions, setQuestionList] = useState<QuestionDTO[] | null>(null);
    const [savedFlags, setSavedFlags] = useState<boolean[]>([]);
    const { i18n } = useTranslation();

    const setQuestions = (newQuestions: QuestionDTO[] | null, newSourceText?: string) => {
        setQuestionList(
            newQuestions
                ? newQuestions.map(q => ({
                    ...q,
                    language: q.language || (typeof i18n !== 'undefined' ? i18n.language : 'sv'),
                }))
                : null
        );
        setSavedFlags(newQuestions ? newQuestions.map(() => false) : []);
        if (typeof newSourceText === 'string') setSourceText(newSourceText);
    }

    const onToggleSave = (index: number, newFlags?: boolean[]) => {
        if (newFlags) {
            setSavedFlags(newFlags);
        } else {
            setSavedFlags((prev) =>
                prev.map((flag, i) => (i === index ? !flag : flag))
            );
        }
    };

    const onRegenerateQuestion = async (index: number, aiModel?: string): Promise<void> => {
        if (!questions) return;
        const original = questions[index];
        const token = localStorage.getItem('token');
        try {
            // Include sourceText in the backend request
            const response = await axios.post<QuestionDTO[]>(
                `${import.meta.env.VITE_API_BASE_URL}/api/v2/generate-questions`,
                {
                    text: sourceText,
                    courseName: original.courseName,
                    language: original.language || 'sv',
                    originalQuestion: original.questionText,
                    aiModel: aiModel || localStorage.getItem('aiModel') || 'openai',
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            let newQuestion = response.data[0];
            setQuestionList((prev) =>
                prev?.map((q, i) => (i === index ? newQuestion : q)) ?? null
            );
        } catch (err) {
            console.error('Failed to regenerate question:', err);
        }
    };


    const onRegenerateOptions = async (index: number, aiModel?: string): Promise<void> => {
        if (!questions) return;
        const q = questions[index];
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post<QuestionOptionDTO[]>(
                `${import.meta.env.VITE_API_BASE_URL}/api/v2/questions/regenerate-options`,
                {
                    questionText: q.questionText,
                    language: q.language || 'sv',
                    courseName: q.courseName,
                    sourceText,
                    aiModel: aiModel || localStorage.getItem('aiModel') || 'openai',
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const newOptions = response.data;
            setQuestionList(prev => {
    if (!prev) return null;
    return prev.map((q, i) =>
        i === index ? { ...q, options: newOptions } : q
    );
});
        } catch (err) {
            // Fel visas redan för användaren med toast.error
        }
    };



    return (
        <QuestionSessionContext.Provider
            value={{
                questions,
                savedFlags,
                setQuestions,
                onToggleSave,
                onRegenerateQuestion,
                onRegenerateOptions,
            }}
        >
            {children}
        </QuestionSessionContext.Provider>
    );
};

export const useQuestionSession = () => {
    const context = useContext(QuestionSessionContext);
    if (!context) {
        throw new Error('useQuestionSession must be used within a QuestionSessionProvider');
    }
    return context;
};

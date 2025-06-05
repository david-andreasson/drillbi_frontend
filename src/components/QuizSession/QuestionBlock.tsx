import React from 'react';

interface Option {
    optionLabel: string;
    optionText: string;
    isCorrect: boolean;
}

interface Question {
    questionNumber: number;
    questionText: string;
    options: Option[];
    imageUrl?: string;
}

interface Props {
    question: Question;
    selectedOption: string;
    submitted: boolean;
    isCorrect: boolean | null;
    onSelect: (label: string) => void;
}

import { useState } from 'react';

import { useEffect } from 'react';

const QuestionBlock: React.FC<Props> = ({
                                            question,
                                            selectedOption,
                                            submitted,
                                            isCorrect,
                                            onSelect
                                        }) => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!showModal) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowModal(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showModal]);
    return (
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-md hover:shadow-lg text-gray-900 md:min-w-[600px] md:max-w-2xl w-full">

            {question.imageUrl && (
                <>
                    <img
                        src={
                            question.imageUrl.startsWith('http')
                                ? question.imageUrl
                                : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${question.imageUrl}`
                        }
                        alt="Frågebild"
                        className="mb-4 object-contain rounded shadow cursor-pointer"
                        title="Klicka för att zooma bilden"
                        style={{
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            display: 'block',
                            maxWidth: 320,
                            maxHeight: 320
                        }}
                        onClick={() => setShowModal(true)}
                    />
                    {showModal && (
                        <div
                            onClick={() => setShowModal(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                background: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 9999
                            }}
                        >
                            <button
                                aria-label="Stäng"
                                onClick={e => { e.stopPropagation(); setShowModal(false); }}
                                style={{
                                    position: 'absolute',
                                    top: 32,
                                    right: 32,
                                    fontSize: 32,
                                    color: '#fff',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    zIndex: 10000
                                }}
                            >&#10005;</button>
                            <img
                                src={
                                    question.imageUrl.startsWith('http')
                                        ? question.imageUrl
                                        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${question.imageUrl}`
                                }
                                alt="Frågebild"
                                style={{ maxWidth: 640, maxHeight: 640, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
                                onClick={e => { e.stopPropagation(); setShowModal(false); }}
                            />
                        </div>
                    )}
                </>
            )}
            <p className="mb-6 text-lg font-medium text-gray-900">{question.questionText}</p>
            <ul className="space-y-2">
                {question.options.map((option) => {
                    let buttonClass =
                        'block w-full text-left p-3 rounded-xl border transition shadow-md hover:shadow-lg ';
                    let icon = '';

                    if (submitted) {
                        if (option.optionLabel === selectedOption && isCorrect === true) {
                            buttonClass += 'border-green-500 bg-green-100';
                            icon = '✅';
                        } else if (option.optionLabel === selectedOption && isCorrect === false) {
                            buttonClass += 'border-red-500 bg-red-100';
                            icon = '❌';
                        } else if (option.isCorrect && isCorrect === false) {
                            buttonClass += 'border-green-300 border-2';
                        } else {
                            buttonClass += 'border-gray-300';
                        }
                    } else {
                        buttonClass += 'border-gray-300 hover:bg-gray-300';
                    }

                    return (
                        <li key={option.optionLabel}>
                            <button
                                disabled={submitted}
                                className={[
                                    buttonClass,
                                    [
                                        // Only show red feedback if isCorrect is explicitly false. Never show red for correct answers or while isCorrect is null.
selectedOption === option.optionLabel && submitted && isCorrect === true
    ? 'bg-green-200 text-green-900 font-bold'
    : selectedOption === option.optionLabel && submitted && isCorrect === false
    ? 'bg-red-200 text-red-900 font-bold'
    : selectedOption === option.optionLabel
    ? 'bg-blue-100 text-blue-900'
    : 'bg-gray-100 text-gray-900',
                                    ].filter(Boolean).join(' ')
                                ].filter(Boolean).join(' ')}
                                onClick={() => onSelect(option.optionLabel)}
                            >
                                <span className="font-bold mr-2">{option.optionLabel}.</span>
                                {option.optionText}
                                {icon && <span className="float-right">{icon}</span>}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default QuestionBlock;

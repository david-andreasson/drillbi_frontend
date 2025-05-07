import React, { useState, useEffect } from 'react';
import { QuestionDTO } from '../../types/QuestionDTO';
import QuestionPreview from './QuestionPreview';
import { useTranslation } from 'react-i18next';

interface Props {
    questions: QuestionDTO[];
    savedFlags: boolean[];
    onToggleSave: (index: number, newFlags?: boolean[]) => void;
    onRegenerateQuestion: (index: number) => Promise<void>;
    onRegenerateOptions: (index: number, aiModel?: string) => Promise<void>;
    regeneratingQuestionIndex: number | null;
    regeneratingOptionsIndex: number | null;
    disableAll: boolean;
    aiModel: string;
}

const QuestionPreviewList: React.FC<Props> = ({
    questions,
    savedFlags,
    onToggleSave,
    onRegenerateQuestion,
    onRegenerateOptions,
    regeneratingQuestionIndex,
    regeneratingOptionsIndex,
    disableAll,
    aiModel,
}) => {
    const { t } = useTranslation();
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        setSelectAll(questions.every((_, i) => savedFlags[i]));
    }, [questions, savedFlags]);

    const handleSelectAll = () => {
        const newFlags = questions.map(() => !selectAll);
        onToggleSave(-1, newFlags);
        setSelectAll(!selectAll);
    };

    return (
        <>
            <div className="flex justify-center mt-6 mb-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="mr-2"
                    />
                    {t('textToQuiz.selectAll')}
                </label>
            </div>
            {questions.map((q, i) => (
                <QuestionPreview
                    key={i}
                    question={q}
                    index={i}
                    onRegenerateQuestion={onRegenerateQuestion}
                    onRegenerateOptions={(index: number) => onRegenerateOptions(index, aiModel)}
                    onToggleSave={(index: number) => {
                        const newFlags = [...savedFlags];
                        newFlags[index] = !newFlags[index];
                        onToggleSave(index, newFlags);
                    }}
                    isSaved={savedFlags[i]}
                    isRegeneratingQuestion={regeneratingQuestionIndex === i}
                    isRegeneratingOptions={regeneratingOptionsIndex === i}
                    disableAll={disableAll}
                    aiModel={aiModel}
                />
            ))}
        </>
    );
};

export default QuestionPreviewList;

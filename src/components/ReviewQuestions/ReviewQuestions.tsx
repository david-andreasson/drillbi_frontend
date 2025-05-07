import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { QuestionDTO } from '../../types/QuestionDTO';
import { fetchWithAuth } from '../../utils/auth';
import PrimaryButton from '../ui/PrimaryButton';
import { useCourses } from '../CourseSelection/useCourses';

interface ReviewQuestionsProps {
    courseName: string;
}

const ReviewQuestions: React.FC<ReviewQuestionsProps> = ({ courseName }) => {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState<QuestionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { courses } = useCourses();
    // Find the correct course
    const selectedCourse = courses.find((c) => c.name === courseName);

    useEffect(() => {
        if (!courseName) {
            setError('Missing course name.');
            setLoading(false);
            return;
        }

        fetchWithAuth(`/api/v2/questions?courseName=${encodeURIComponent(courseName)}&orderType=LATEST`)
            .then(res => res.json())
            .then((data: QuestionDTO[]) => {
                setQuestions(data);
                setLoading(false);
            })
            .catch(() => {
                setError(t('textToQuiz.errorFetching'));
                setLoading(false);
            });
    }, [courseName, t]);

    const handleAddMore = () => {
        navigate('/');
        setTimeout(() => {
            navigate('/texttoquiz');
        }, 0);
    };

    const handleDone = () => {
        navigate('/');
    };

    if (loading) return <p className="text-center mt-8">{t('textToQuiz.loading')}</p>;
    if (error) return <p className="text-center text-red-600 mt-8">{error}</p>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 text-[#4A4A48]">
            <h2 className="text-2xl font-bold text-center mb-6">
                {t('textToQuiz.reviewTitle')} – {selectedCourse ? selectedCourse.displayName : courseName}
            </h2>

            <ul className="space-y-6">
                {questions.map((q, qi) => (
                    <li key={qi}>
                        <strong className="block mb-2">{q.questionText}</strong>
                        <ul className="list-disc list-inside space-y-1">
                            {q.options.map((opt, i) => (
                                <li
                                    key={i}
                                    className={opt.isCorrect ? 'text-green-600 font-semibold' : ''}
                                >
                                    {opt.optionLabel}: {opt.optionText}
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <PrimaryButton onClick={handleAddMore}>
                    {t('textToQuiz.addMore')}
                </PrimaryButton>
                <PrimaryButton onClick={handleDone}>
                    {t('textToQuiz.done')}
                </PrimaryButton>
            </div>
        </div>
    );
};

export default ReviewQuestions;
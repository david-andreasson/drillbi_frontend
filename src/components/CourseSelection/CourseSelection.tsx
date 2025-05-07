import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCourses } from './useCourses';
import { fetchWithAuth } from '../../utils/auth';
import PrimaryButton from "../ui/PrimaryButton";

interface CourseSelectionProps {
    onSelectCourse: (course: string) => void;
}

const CourseSelection: React.FC<CourseSelectionProps> = ({ onSelectCourse }) => {
    const { t } = useTranslation();
    const { courses, loading, error } = useCourses();
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        courses.forEach((course) => {
            fetchWithAuth(`/api/v2/questions/count?courseName=${encodeURIComponent(course.name)}`)
                .then((res) => {
                    if (!res.ok) throw new Error(`Failed to fetch count for ${course.name}`);
                    return res.text();
                })
                .then((countStr) => {
                    const num = parseInt(countStr, 10);
                    setCounts((prev) => ({
                        ...prev,
                        [course.name]: isNaN(num) ? 0 : num
                    }));
                })
                .catch((err) => {
                    console.error('Error fetching count for', course.name, err);
                    setCounts((prev) => ({ ...prev, [course.name]: 0 }));
                });
        });
    }, [courses]);

    return (
        <div className="flex flex-col items-center justify-center px-4 py-10 bg-white dark:bg-neutral-900 w-full">
            <div className="w-full max-w-xl text-center">
                <h1 className="text-4xl font-bold mb-4 text-center text-gray-900 dark:text-neutral-100">
                    {t('courseSelection.title')}
                </h1>
                <p className="mb-10 text-gray-600 dark:text-neutral-100">{t('courseSelection.choose')}</p>

                {loading && <p>{t('loading')}</p>}
                {error && <p className="text-red-500">{error}</p>}

                <div className="grid gap-4">
                    {courses.map((course) => (
                        <PrimaryButton
                            key={course.name}
                            className={`w-full`}
                            onClick={() => onSelectCourse(course.name)}
                        >
                            {(course.displayName || course.name)} – {t('courseSelection.question', { count: counts[course.name] ?? 0 })}
                        </PrimaryButton>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseSelection;
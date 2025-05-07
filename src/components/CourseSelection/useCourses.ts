import {useEffect, useState} from "react";
import {fetchWithAuth} from "../../utils/auth";

export interface Course {
    name: string;
    displayName: string;
    description?: string;
}

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetchWithAuth('/api/v2/courses');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: Course[] = await response.json();
                setCourses(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return { courses, loading, error };
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, ListItemButton, ListItemText, Paper, Typography, CircularProgress } from "@mui/material";
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Course {
  id: number;
  name: string;
  displayName: string;
  description: string;
}

export default function QuestionCourseSelectPage() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/v2/courses`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(t('courseList.fetchError'))))
      .then(setCourses)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error" className="dark:text-red-400">{error}</Typography>;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 bg-white dark:bg-neutral-900 w-full">
      <main>
        <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }} className="dark:bg-neutral-800 dark:text-neutral-100">
          <Typography variant="h5" mb={2}>{t('courseList.editTitle')}</Typography>
          <List>
            {courses.map((course) => (
              <ListItemButton
                key={course.id}
                onClick={() => navigate(`/questions/course/${course.id}`)}
              >
                <ListItemText primary={course.displayName || course.name} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </main>
    </div>
  );
}

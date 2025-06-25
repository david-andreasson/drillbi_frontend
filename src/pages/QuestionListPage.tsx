import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { List, ListItem, ListItemText, ListItemButton, Paper, Typography, CircularProgress, Button } from "@mui/material";
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Question {
  id: number;
  questionText: string;
  questionNumber: number;
}

export default function QuestionListPage() {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/v2/courses/${courseId}/questions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(t('editQuestion.fetchError'))))
      .then(setQuestions)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error" className="dark:text-red-400">{error}</Typography>;

  return (
    <div style={{ minHeight: '100vh' }} className="bg-white dark:bg-neutral-900 dark:text-neutral-100">
      <main>
        <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }} className="dark:bg-neutral-800 dark:text-neutral-100">
          <Typography variant="h5" mb={2}>{t('editQuestion.selectTitle')}</Typography>
          <List>
            {questions.map((question) => (
              <ListItem key={question.id} disablePadding>
                <ListItemButton onClick={() => {
                  try {
                    if (!question.id) throw new Error(t('editQuestion.missingId'));
                    navigate(`/questions/${question.id}/edit`);
                  } catch (err) {
                    setError(t('editQuestion.navigationError') + (err instanceof Error ? err.message : String(err)) );
                    console.error('Navigation error:', err, question);
                  }
                }}>
                  <ListItemText
                    primary={question.questionText}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate(-1)}>{t('editQuestion.back')}</Button>
        </Paper>
      </main>
    </div>
  );
}

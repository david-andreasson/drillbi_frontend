import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { List, ListItem, ListItemText, ListItemButton, Paper, Typography, CircularProgress, Button } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Question {
  id: number;
  questionText: string;
  questionNumber: number;
}

export default function QuestionListPage() {
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
      .then((res) => (res.ok ? res.json() : Promise.reject("Kunde inte hämta frågor")))
      .then(setQuestions)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>Välj fråga att redigera</Typography>
      <List>
        {questions.map((q) => (
          <ListItem key={q.id} disablePadding>
            <ListItemButton onClick={() => navigate(`/admin/questions/${q.id}/edit`)}>
              <ListItemText
                primary={`Fråga ${q.questionNumber}: ${q.questionText}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate(-1)}>Tillbaka</Button>
    </Paper>
  );
}

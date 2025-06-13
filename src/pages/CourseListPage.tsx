import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, ListItem, ListItemText, ListItemButton, Paper, Typography, CircularProgress } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Course {
  id: number;
  name: string;
  displayName: string;
  description: string;
}

export default function CourseListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/v2/courses`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Kunde inte hämta kurser")))
      .then(setCourses)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>Välj kurs att redigera</Typography>
      <List>
        {courses.map((course) => (
          <ListItem key={course.id} disablePadding>
            <ListItemButton onClick={() => navigate(`/courses/${course.id}/edit`)}>
              <ListItemText
                primary={course.displayName || course.name}
                secondary={course.description}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

import React, { useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type Course = {
  name: string;
  displayName: string;
  description: string;
};

export default function EditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course>({ name: "", displayName: "", description: "" });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/v2/courses/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : Promise.reject("Kunde inte hämta kurs"))
      .then(setCourse)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/v2/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(course)
      });
      if (!res.ok) throw new Error("Kunde inte spara kurs");
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message || "Något gick fel");
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSuccess(false);
  };

  if (loading) return <Typography>Laddar...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={3}>Redigera kurs</Typography>

      {success && (
        <Box sx={{
          width: '100%',
          mb: 3,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <Alert
            severity="success"
            onClose={handleSnackbarClose}
            sx={{
              width: '100%',
              maxWidth: 600,
              fontSize: 22,
              fontWeight: 'bold',
              backgroundColor: '#43a047',
              color: 'white',
              p: 3,
              borderRadius: 2,
              boxShadow: 3,
              textAlign: 'center',
            }}
          >
            Kursen har sparats!
          </Alert>
        </Box>
      )}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField fullWidth label="Namn" name="name" value={course.name} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label="Visningsnamn" name="displayName" value={course.displayName} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label="Beskrivning" name="description" value={course.description} onChange={handleChange} margin="normal" multiline rows={3} />
        <Box mt={2} display="flex" gap={2}>
          <Button type="submit" variant="contained">Spara</Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>Avbryt</Button>
        </Box>
      </Box>
    </Paper>
  );
}

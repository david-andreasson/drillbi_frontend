import React, { useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type Course = {
  name: string;
  displayName: string;
  description: string;
};

export default function EditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [course, setCourse] = useState<Course>({ name: "", displayName: "", description: "" });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/v2/courses/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : Promise.reject(t('editCourse.fetchError')))
      .then(setCourse)
      .catch((err) => setError(typeof err === 'string' ? err : t('editCourse.fetchError')))
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
      if (!res.ok) throw new Error(t('editCourse.saveError'));
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message || t('editCourse.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSuccess(false);
  };

  if (loading) return <Typography>{t('editCourse.loading')}</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h4" mb={3}>{t('editCourse.title')}</Typography>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {t('editCourse.saved')}
        </Alert>
      </Snackbar>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField fullWidth label={t('editCourse.name')} name="name" value={course.name} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label={t('editCourse.displayName')} name="displayName" value={course.displayName} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label={t('editCourse.description')} name="description" value={course.description} onChange={handleChange} margin="normal" multiline rows={3} />
        <Box mt={2} display="flex" gap={2}>
          <Button type="submit" variant="contained">{t('editCourse.save')}</Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>{t('editCourse.cancel')}</Button>
        </Box>
      </Box>
    </Paper>
  );
}

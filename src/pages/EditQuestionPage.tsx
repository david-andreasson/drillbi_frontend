import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper, IconButton, InputAdornment, Snackbar, Alert } from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

type QuestionOption = {
  optionText: string;
  optionLabel: string;
  correct: boolean;
};

type Question = {
  questionText: string;
  options: QuestionOption[];
  imageUrl: string;
};

export default function EditQuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [question, setQuestion] = useState<Question>({ questionText: "", options: [], imageUrl: "" });
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/v2/questions/${id}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
      .then(res => res.ok ? res.json() : Promise.reject(t('editQuestion.fetchError')))
      .then(data => {
        setQuestion({
          questionText: data.questionText,
          options: data.options ?? [],
          imageUrl: data.imageUrl ?? ""
        });
        setCorrectIndex(Array.isArray(data.options) ? data.options.findIndex((opt: QuestionOption) => opt.correct) : 0);
      })
      .catch((err: any) => setError(typeof err === 'string' ? err : t('editQuestion.fetchError')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOptionChange = (idx: number, field: keyof QuestionOption, value: string | boolean) => {
    setQuestion(q => ({
      ...q,
      options: q.options.map((opt, i) => i === idx ? { ...opt, [field]: value } : opt)
    }));
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("questionText", question.questionText);
      formData.append("options", JSON.stringify(question.options));
      formData.append("correctIndex", correctIndex.toString());
      if (imageFile) formData.append("image", imageFile);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/v2/questions/${id}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      if (!res.ok) throw new Error(t('editQuestion.saveError'));
      setSuccess(true);
      // Show green toast as well
      import('react-hot-toast').then(({ toast }) => toast.success(t('editQuestion.saved'), { duration: 3500, position: 'top-center' }));
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>{t('editQuestion.loading')}</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 bg-white dark:bg-neutral-900 w-full">
      <Snackbar open={success} autoHideDuration={1500} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {t('editQuestion.saved')}
        </Alert>
      </Snackbar>
      <main>
        <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4, backgroundColor: 'background.paper', boxShadow: 3 }} className="dark:bg-neutral-800 dark:text-neutral-100">
          <Typography variant="h5" mb={2}>{t('editQuestion.title')}</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField InputLabelProps={{ style: { color: 'inherit' } }} InputProps={{ style: { color: 'inherit', backgroundColor: 'inherit' } }} className="dark:bg-neutral-800 dark:text-neutral-100"
              label={t('editQuestion.questionText')}
              value={question.questionText}
              onChange={e => setQuestion({ ...question, questionText: e.target.value })}
              fullWidth
              margin="normal"
              required
            />
            {question.options.map((option, idx) => (
              <Box key={idx} display="flex" alignItems="center" mb={1}>
                <TextField InputLabelProps={{ style: { color: 'inherit' } }} InputProps={{ style: { color: 'inherit', backgroundColor: 'inherit' } }} className="dark:bg-neutral-800 dark:text-neutral-100"
                  label={t('editQuestion.optionLabel', { num: idx + 1 })}
                  value={option.optionText}
                  onChange={e => handleOptionChange(idx, "optionText", e.target.value)}
                  fullWidth
                  required
                />
                <Button className="dark:text-neutral-100"
                  variant={correctIndex === idx ? "contained" : "outlined"}
                  color={correctIndex === idx ? "success" : "primary"}
                  onClick={() => setCorrectIndex(idx)}
                  sx={{ ml: 1 }}
                >
                  {t('editQuestion.correctAnswer')}
                </Button>
              </Box>
            ))}
            <Box mt={2} mb={2}>
              <Button className="dark:text-neutral-100" variant="outlined" onClick={() => setQuestion(q => ({ ...q, options: [...q.options, { optionText: "", optionLabel: String.fromCharCode(65 + q.options.length), correct: false }] }))}>{t('editQuestion.addOption')}</Button>
            </Box>
            <Box mt={2} mb={2}>
              <Button className="dark:text-neutral-100"
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
              >
                {t('editQuestion.uploadImage')}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </Button>
              {(imagePreview || question.imageUrl) && (
                <img
                  src={imagePreview || question.imageUrl}
                  alt={t('editQuestion.preview')}
                  style={{ maxHeight: 80, borderRadius: 6, marginLeft: 12 }}
                />
              )}
            </Box>
            <Box mt={2} display="flex" gap={2}>
              <Button className="dark:text-neutral-100" type="submit" variant="contained">{t('editQuestion.save')}</Button>
              <Button className="dark:text-neutral-100" variant="outlined" onClick={() => navigate(-1)}>{t('editQuestion.cancel')}</Button>
            </Box>
          </Box>
        </Paper>
      </main>
    </div>
  );
}

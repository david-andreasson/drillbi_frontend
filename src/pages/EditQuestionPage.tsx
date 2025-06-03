import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper, IconButton, InputAdornment } from "@mui/material";
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

import { Snackbar, Alert } from "@mui/material";

export default function EditQuestionPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarClose = () => setSidebarOpen(false);
  const handleMenuClick = () => setSidebarOpen(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question>({ questionText: "", options: [], imageUrl: "" });
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/v2/questions/${id}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
      .then(res => res.ok ? res.json() : Promise.reject("Kunde inte hämta fråga"))
      .then(data => {
        setQuestion({
          questionText: data.questionText,
          options: data.options ?? [],
          imageUrl: data.imageUrl ?? ""
        });
        setCorrectIndex(Array.isArray(data.options) ? data.options.findIndex((opt: QuestionOption) => opt.correct) : 0);
      })
      .catch((err: any) => setError(typeof err === 'string' ? err : String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOptionChange = (idx: number, field: keyof QuestionOption, value: string | boolean) => {
    setQuestion(q => ({
      ...q,
      options: q.options.map((opt, i) => i === idx ? { ...opt, [field]: value } : opt)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Se till att det alltid är exakt 4 alternativ
      let options = question.options.slice(0, 4);
      while (options.length < 4) {
        options.push({ optionText: "", optionLabel: String.fromCharCode(65 + options.length), correct: false });
      }
      const formData = new FormData();
      formData.append("questionText", question.questionText);
      formData.append("options", JSON.stringify(options));
      formData.append("correctIndex", correctIndex.toString());
      if (imageFile) formData.append("image", imageFile);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/v2/questions/${id}`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      if (!res.ok) throw new Error("Kunde inte spara fråga");
      const data = await res.json();
      setSuccess(true);
      setTimeout(() => {
        navigate(`/admin/questions/course/${data.courseId || ''}`);
      }, 1200);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Laddar...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        userRole={"ROLE_ADMIN"}
        onNavigate={(destination) => {
          setSidebarOpen(false);
          switch (destination) {
            case 'home':
              navigate('/admin');
              break;
            case 'courses':
              navigate('/admin/questions/course');
              break;
            case 'texttoquiz':
              navigate('/admin/text-to-quiz');
              break;
            case 'phototoquiz':
              navigate('/admin/photo-to-quiz');
              break;
            case 'profile':
              navigate('/admin/profile');
              break;
            case 'coursecreate':
              navigate('/admin/courses/create');
              break;
            case 'editcourse':
              navigate('/admin/courses/edit');
              break;
            case 'questioncreate':
              navigate('/admin/questions/create');
              break;
            case 'editquestion':
              navigate('/admin/questions/course');
              break;
            case 'adminsql':
              navigate('/admin/sql');
              break;
            case 'logout':
              navigate('/logout');
              break;
            default:
              break;
          }
        }}
      />
      <Header theme={"light"} setTheme={() => {}} onLogout={() => {}} onMenuClick={handleMenuClick} />
      <Snackbar open={success} autoHideDuration={1500} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Frågan sparades!
        </Alert>
      </Snackbar>
      <main style={{ marginLeft: 240, paddingTop: 64 }}>
        <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
          <Typography variant="h5" mb={2}>Redigera fråga</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Frågetext" name="questionText" value={question.questionText} onChange={e => setQuestion(q => ({ ...q, questionText: e.target.value }))} margin="normal" required />
            {[0,1,2,3].map(idx => (
              <Box key={idx} display="flex" alignItems="center" gap={1}>
                <TextField
                  fullWidth
                  label={`Alternativ ${idx + 1}`}
                  value={question.options[idx]?.optionText || ""}
                  onChange={e => handleOptionChange(idx, "optionText", e.target.value)}
                  margin="normal"
                />
                <input
                  type="radio"
                  checked={correctIndex === idx}
                  onChange={() => setCorrectIndex(idx)}
                  style={{ marginLeft: 8 }}
                  id={`radio-correct-${idx}`}
                  name="correctOption"
                />
                <label htmlFor={`radio-correct-${idx}`} style={{ fontSize: 13, marginRight: 8 }}>Rätt svar</label>
              </Box>
            ))}
            <Box mt={2} mb={2}>
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
              >
                Ladda upp bild
                <input type="file" accept="image/*" hidden onChange={handleImageChange} ref={fileInputRef} />
              </Button>
              {question.imageUrl && (
                <Box mt={2}>
                  <img src={API_BASE + question.imageUrl} alt="Frågebild" style={{ maxWidth: 200, maxHeight: 200, display: "block" }} />
                </Box>
              )}
          </Box>
        <Box mt={2} display="flex" gap={2}>
          <Button type="submit" variant="contained">Spara</Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>Avbryt</Button>
        </Box>
      </Box>
    </Paper>
    </main>
    </div>
  );
}

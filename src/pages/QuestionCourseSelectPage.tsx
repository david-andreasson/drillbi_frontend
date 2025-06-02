import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { List, ListItem, ListItemText, ListItemButton, Paper, Typography, CircularProgress } from "@mui/material";
import Sidebar from "../components/ui/Sidebar";
import Header from "../components/ui/Header";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Course {
  id: number;
  name: string;
  displayName: string;
  description: string;
}

export default function QuestionCourseSelectPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleSidebarClose = () => setSidebarOpen(false);
  const handleMenuClick = () => setSidebarOpen(true);
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
    <div style={{ minHeight: '100vh', background: '#fff' }}>
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
      <main style={{ marginLeft: 240, paddingTop: 64 }}>
        <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
          <Typography variant="h5" mb={2}>Välj kurs</Typography>
          <List>
            {courses.map((course) => (
              <ListItem key={course.id} disablePadding>
                <ListItemButton onClick={() => navigate(`/admin/questions/course/${course.id}`)}>
                  <ListItemText
                    primary={course.displayName || course.name}
                    secondary={course.description}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </main>
    </div>
  );
}

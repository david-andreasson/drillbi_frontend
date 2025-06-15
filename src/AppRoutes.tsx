import React, { useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import ProfilePage from './components/ProfilePage';
import Login from './components/Login';
import CourseSelection from './components/CourseSelection/CourseSelection';

import { toast } from 'react-hot-toast';
import QuizSession from './components/QuizSession/QuizSession';
import WelcomeScreen from './components/WelcomeScreen';
import AdminSqlPage from './pages/AdminSqlPage';
import CourseCreatePage from './components/CourseCreatePage';
import QuestionCreatePage from './components/QuestionCreatePage';
import EditCoursePage from './pages/EditCoursePage';
import EditQuestionPage from './pages/EditQuestionPage';
import EditCoursePlaceholder from './pages/EditCoursePlaceholder';
import EditQuestionPlaceholder from './pages/EditQuestionPlaceholder';
import CourseListPage from './pages/CourseListPage';
import QuestionCourseSelectPage from './pages/QuestionCourseSelectPage';
import QuestionListPage from './pages/QuestionListPage';
import LoggedOutScreen from './components/LoggedOutScreen';
import TextToQuiz from './components/TextToQuiz/TextToQuiz';
import MainLayout from './components/layout/AdminLayout';
import ReviewQuestions from './components/ReviewQuestions/ReviewQuestions';
import Paywall from './components/Paywall';
import EducatorContact from './components/EducatorContact';
import PhotoToQuizPlaceholder from './components/PhotoToQuizPlaceholder';
import PhotoToQuizPage from './pages/PhotoToQuizPage';


interface AppRoutesProps {
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark';
  handleLogout: () => void;
  course: any;
  setCourse: (course: any) => void;
  isLoggingOut: boolean;
  user?: any;

  setContinueQuiz?: (continueQuiz: boolean) => void;
  setShowQuestionCreate?: (show: boolean) => void;
  triggerPaywall?: () => void;
}

const AppRoutes = ({
  toggleTheme,
  currentTheme,
  handleLogout,
  course,
  setCourse,
  isLoggingOut,
  user,
  setContinueQuiz = () => {},
  setShowQuestionCreate = () => {},
  triggerPaywall = () => {}
}: AppRoutesProps) => {
  const navigate = useNavigate();
  
  // Inget behov av gruppkontroll längre

  const handleNavigate = useCallback((destination: string) => {
    if (isLoggingOut) return; // Förhindra navigering under utloggning
    
    switch (destination) {
      case 'logout':
        handleLogout();
        break;
      case 'home':
        navigate('/');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'courses':
        navigate('/courses');
        break;
      case 'coursecreate':
        navigate('/courses/create');
        break;
      case 'editcourse':
        navigate('/courses/list');
        break;
      case 'questioncreate':
        navigate('/questions/create');
        break;
      case 'editquestion':
        navigate('/questions/course');
        break;
      case 'phototoquiz':
        navigate('/phototoquiz');
        break;
      case 'texttoquiz':
        navigate('/texttoquiz');
        break;
      case 'adminsql':
        navigate('/sql');
        break;
      case 'paywall':
        navigate('/paywall');
        break;
      default:
        break;
    }
  }, [navigate, handleLogout, isLoggingOut]);

  return (
    <Routes>
      <Route path="/" element={
        <MainLayout 
          userRole={user?.role || null}
          onNavigate={handleNavigate}
          theme={currentTheme}
          setTheme={(theme: 'light' | 'dark') => {
            if (theme !== currentTheme) toggleTheme();
          }}
        />
      }>
        {/* Index: Hem/WelcomeScreen */}
        <Route index element={<WelcomeScreen firstName={user?.firstName || ''}
          onStartNew={() => navigate('/courses')}
          onCreateQuestions={() => {
            if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_EDUCATOR') {
              navigate('/questions/create');
            } else {
              navigate('/paywall');
            }
          }}
          onBecomeMember={() => navigate('/paywall')}
        />} />
        {/* Profile */}
        <Route path="profile" element={<ProfilePage onDone={() => {}} />} />
        {/* Välj kurs (CourseSelection) */}
        <Route path="courses" element={<CourseSelection onSelectCourse={(courseName: string) => navigate(`/quiz/${courseName}`)} />} />
        {/* Skapa kurs */}
        <Route path="courses/create" element={<CourseCreatePage />} />
        {/* Redigera kurs (lista) */}
        <Route path="courses/list" element={<CourseListPage />} />
        {/* Redigera kurs (edit) */}
        <Route path="courses/:id/edit" element={<EditCoursePage />} />
        {/* Text till quiz */}
        <Route path="texttoquiz" element={<TextToQuiz onReview={() => {}} />} />
        {/* Foto till quiz */}
        <Route path="phototoquiz" element={<PhotoToQuizPage />} />
        {/* Admin SQL */}
        <Route path="sql" element={<AdminSqlPage />} />
        {/* Skapa fråga */}
        <Route 
          path="questions/create" 
          element={
            <QuestionCreatePage 
              preselectedCourse={new URLSearchParams(window.location.search).get('course') || undefined} 
            />
          } 
        />
        {/* Välj kurs för fråga */}
        <Route path="questions/course" element={<QuestionCourseSelectPage />} />
        {/* Frågelista */}
        <Route path="questions/course/:courseId" element={<QuestionListPage />} />
        {/* QuizSession */}
        <Route path="quiz/:courseName" element={<QuizSessionRouteWrapper />} />
        {/* Redigera fråga */}
        <Route path="questions/:id/edit" element={<EditQuestionPage />} />

        <Route path="paywall" element={<Paywall />} />
      </Route>
      {/* Testrutt för kurser */}
      <Route path="/test-courses" element={
        <div className="p-4">
          <h1>Testrutt för kurser</h1>
          <p>Denna sida visar att navigering fungerar korrekt.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Tillbaka till startsidan
          </button>
        </div>
      } />
      
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={null} /> {/* Hantering av direkt URL för utloggning */}
      <Route path="/login/oauth2" element={<OAuth2RedirectHandler />} />
      <Route path="/educator-contact" element={<EducatorContact />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Wrapper-komponent för att ge QuizSession rätt props från route
import { useParams } from 'react-router-dom';
import { useState } from 'react';

const QuizSessionRouteWrapper = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState<'ORDER' | 'RANDOM' | 'REVERSE'>('ORDER');

  const handleOrderChange = () => {
    // Rotera mellan olika ordningstyper
    const orderTypes: Array<'ORDER' | 'RANDOM' | 'REVERSE'> = ['ORDER', 'RANDOM', 'REVERSE'];
    const currentIndex = orderTypes.indexOf(orderType);
    const nextIndex = (currentIndex + 1) % orderTypes.length;
    setOrderType(orderTypes[nextIndex]);
  };

  const handleDone = () => {
    navigate('/');
  };

  const handleSessionId = (id: string) => {
    // Spara sessionId i localStorage för att kunna återuppta senare om så önskas
    localStorage.setItem('quizSessionId', id);
  };

  return (
    <QuizSession
      courseName={courseName || ''}
      orderType={orderType}
      startQuestion={0}
      onOrderChange={handleOrderChange}
      onDone={handleDone}
      onSessionId={handleSessionId}
    />
  );
};

export default AppRoutes;

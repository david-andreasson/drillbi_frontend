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
  isLoggingOut,
  user,
  setContinueQuiz = () => {},
  setShowQuestionCreate = () => {},
  triggerPaywall = () => {}
}: AppRoutesProps) => {
  const navigate = useNavigate();
  
  // No need for group control anymore

  const handleNavigate = useCallback((destination: string) => {
    if (isLoggingOut) return; // Prevent navigation during logout
    
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
        {/* Index: Home/WelcomeScreen */}
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
        {/* Select course (CourseSelection) */}
        <Route path="courses" element={<CourseSelection onSelectCourse={(courseName: string) => navigate(`/quiz/${courseName}`)} />} />
        {/* Create course */}
        <Route path="courses/create" element={<CourseCreatePage />} />
        {/* Edit course (list) */}
        <Route path="courses/list" element={<CourseListPage />} />
        {/* Edit course (edit) */}
        <Route path="courses/:id/edit" element={<EditCoursePage />} />
        {/* Create question */}
        <Route path="questions/create" element={<QuestionCreatePage preselectedCourse={new URLSearchParams(window.location.search).get('course') || undefined} />} />
        {/* Select course for question */}
        <Route path="questions/course" element={<QuestionCourseSelectPage />} />
        {/* Question list */}
        <Route path="questions/course/:courseId" element={<QuestionListPage />} />
        {/* Edit question */}
        <Route path="questions/:id/edit" element={<EditQuestionPage />} />
        {/* Text to quiz */}
        <Route path="texttoquiz" element={<TextToQuiz onReview={() => {}} />} />
        {/* Photo to quiz */}
        <Route path="phototoquiz" element={<PhotoToQuizPage />} />
        {/* Admin SQL */}
        <Route path="sql" element={<AdminSqlPage />} />
        {/* QuizSession */}
        <Route path="quiz/:courseName" element={<QuizSessionRouteWrapper />} />
        {/* Edit question */}
        <Route path="questions/:id/edit" element={<EditQuestionPage />} />

        <Route path="paywall" element={<Paywall />} />
      </Route>
      {/* Test route for courses */}
      <Route path="/test-courses" element={
        <div className="p-4">
          <h1>Test route for courses</h1>
          <p>This page shows that navigation works correctly.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to home
          </button>
        </div>
      } />
      
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={null} /> {/* Handling direct URL for logout */}
      <Route path="/login/oauth2" element={<OAuth2RedirectHandler />} />
      <Route path="/educator-contact" element={<EducatorContact />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Wrapper component to provide QuizSession with correct props from route
import { useParams } from 'react-router-dom';
import { useState } from 'react';

const QuizSessionRouteWrapper = () => {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState<'ORDER' | 'RANDOM' | 'REVERSE'>('ORDER');

  const handleOrderChange = () => {
    // Rotate between different order types
    const orderTypes: Array<'ORDER' | 'RANDOM' | 'REVERSE'> = ['ORDER', 'RANDOM', 'REVERSE'];
    const currentIndex = orderTypes.indexOf(orderType);
    const nextIndex = (currentIndex + 1) % orderTypes.length;
    setOrderType(orderTypes[nextIndex]);
  };

  const handleDone = () => {
    navigate('/');
  };

  const handleSessionId = (id: string) => {
    // Save sessionId in localStorage to be able to resume later if desired
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

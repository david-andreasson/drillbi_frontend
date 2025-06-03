import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
import ProfilePage from './components/ProfilePage';
import Login from './components/Login';
import CourseSelection from './components/CourseSelection/CourseSelection';
import GroupSelection from './components/GroupSelection';
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

function handleNavigateFactory(navigate: any) {
  return (destination: string) => {
    switch (destination) {
      case 'home':
        navigate('/'); break; // WelcomeScreen
      case 'profile':
        navigate('/profile'); break;
      case 'courses':
        navigate('/courses'); break; // CourseSelection
      case 'coursecreate':
        navigate('/courses/create'); break; // CourseCreatePage
      case 'editcourse':
        navigate('/courses/list'); break; // CourseListPage
      case 'questioncreate':
        navigate('/questions/create'); break;
      case 'editquestion':
        navigate('/questions/course'); break;
      case 'phototoquiz':
        navigate('/phototoquiz'); break;
      case 'texttoquiz':
        navigate('/texttoquiz'); break; // TextToQuiz
      case 'adminsql':
        navigate('/sql'); break;
      case 'logout':
        localStorage.removeItem('token');
        navigate('/login'); break;
      case 'paywall':
        navigate('/paywall'); break;
      default:
        break;
    }
  };
}

const AppRoutes = ({
  user,
  setGroup,
  group,
  setContinueQuiz,
  setShowQuestionCreate,
  triggerPaywall
}: any) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!group && window.location.pathname !== '/choose-group') {
      navigate('/choose-group', { replace: true });
    }
  }, [group, navigate]);

  const handleNavigate = handleNavigateFactory(navigate);

  const forceChooseGroup = !group && window.location.pathname === '/choose-group';

  return (
    <Routes>
      <Route path="/" element={<MainLayout userRole={user?.role || null} onNavigate={handleNavigate} forceChooseGroup={forceChooseGroup} />}>
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
        <Route path="phototoquiz" element={<PhotoToQuizPlaceholder />} />
        {/* Admin SQL */}
        <Route path="sql" element={<AdminSqlPage />} />
        {/* Skapa fråga */}
        <Route path="questions/create" element={<QuestionCreatePage />} />
        {/* Välj kurs för fråga */}
        <Route path="questions/course" element={<QuestionCourseSelectPage />} />
        {/* Frågelista */}
        <Route path="questions/course/:courseId" element={<QuestionListPage />} />
        {/* QuizSession */}
        <Route path="quiz/:courseName" element={<QuizSessionRouteWrapper />} />
        {/* Redigera fråga */}
        <Route path="questions/:id/edit" element={<EditQuestionPage />} />
        {/* Gruppval */}
        <Route path="choose-group" element={<GroupSelection onSelectGroup={(name: string) => {
          if (name === 'JIN24') {
            setGroup('JIN24');
            navigate('/');
          } else {
            toast.error('Du har inte behörighet att visa denna sida');
          }
        }} />} />
        <Route path="paywall" element={<Paywall />} />
      </Route>
      <Route path="/login/oauth2" element={<OAuth2RedirectHandler />} />
      <Route path="/educator-contact" element={<EducatorContact />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Wrapper-komponent för att ge QuizSession rätt props från route
import { useParams } from 'react-router-dom';

const QuizSessionRouteWrapper = () => {
  const { courseName } = useParams();
  return (
    <QuizSession
      courseName={courseName || ''}
      orderType={'ORDER'}
      startQuestion={0}
      onOrderChange={() => {}}
      onDone={() => {}}
      onSessionId={() => {}}
    />
  );
};

export default AppRoutes;

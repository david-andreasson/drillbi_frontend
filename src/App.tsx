import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Login from './components/Login';
import CourseSelection from './components/CourseSelection/CourseSelection';
import QuizSession from './components/QuizSession/QuizSession';
import WelcomeScreen from './components/WelcomeScreen';
import LoggedOutScreen from './components/LoggedOutScreen';
import TextToQuiz from './components/TextToQuiz/TextToQuiz';
import Header from './components/ui/Header';
import Sidebar from './components/ui/Sidebar';
import Settings from './components/Settings';
import { useUser } from './contexts/UserContext';
import { Toaster } from 'react-hot-toast';
import ReviewQuestions from './components/ReviewQuestions/ReviewQuestions';

type ThemeType = 'light' | 'dark';
type OrderType = 'ORDER' | 'REVERSE' | 'RANDOM';

const App: React.FC = () => {
    const { i18n } = useTranslation();
    const { user, loading: userLoading } = useUser();
    const location = useLocation();

    const [theme, setTheme] = useState<ThemeType>('light');
    const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);
    const [course, setCourse] = useState<string | null>(null);
    const [orderType, setOrderType] = useState<OrderType>('ORDER');
    const [startQuestion, setStartQuestion] = useState<number>(1);
    const [welcomeDone, setWelcomeDone] = useState<boolean>(false);
    const [continueQuiz, setContinueQuiz] = useState<boolean>(false);
    const [showTextToQuiz, setShowTextToQuiz] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    const showReviewPage = location.pathname === '/review';
    const reviewCourseName = new URLSearchParams(location.search).get('courseName');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) setTheme(storedTheme as ThemeType);

        const storedLang = localStorage.getItem('language');
        if (storedLang) i18n.changeLanguage(storedLang);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (window.location.pathname === '/logged-out') {
            setIsLoggedOut(true);
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedOut(true);
        setCourse(null);
        window.history.replaceState({}, document.title, '/logged-out');
    };

    const resetAllViews = () => {
        setShowTextToQuiz(false);
        setShowSettings(false);
        setCourse(null);
        setWelcomeDone(false);
        setContinueQuiz(false);
    };

    const handleNavigate = (destination: string) => {
        console.log('[App] Navigerar till:', destination);
        setSidebarOpen(false);
        resetAllViews();

        switch (destination) {
            case 'logout':
                handleLogout();
                break;
            case 'texttoquiz':
                setShowTextToQuiz(true);
                break;
            case 'settings':
                setShowSettings(true);
                break;
            case 'home':
                setWelcomeDone(false);
                break;
            case 'courses':
                setWelcomeDone(true);
                setContinueQuiz(false);
                setCourse(null);
                break;
            default:
                break;
        }
    };

    const handleOrderChange = () => {
        setOrderType(prev =>
            prev === 'ORDER' ? 'REVERSE' : prev === 'REVERSE' ? 'RANDOM' : 'ORDER'
        );
    };

    if (userLoading) return null;
    if (!user && !isLoggedOut) return <Login />;
    if (isLoggedOut) return <LoggedOutScreen onLoginAgain={() => window.location.href = '/login'} />;

    const firstName = user?.firstName || '';
    const role = user?.role || 'ROLE_USER';

    let content = null;
    if (showReviewPage && reviewCourseName) {
        content = <ReviewQuestions courseName={reviewCourseName} />;
    } else if (showTextToQuiz) {
        content = <TextToQuiz />;
    } else if (showSettings) {
        content = <Settings theme={theme} setTheme={setTheme} />;
    } else if (!welcomeDone) {
        content = (
            <WelcomeScreen
                firstName={firstName}
                onStartNew={() => {
                    localStorage.removeItem('sessionId');
                    setWelcomeDone(true);
                    setContinueQuiz(false);
                }}
                onContinue={() => {
                    setWelcomeDone(true);
                    setContinueQuiz(true);
                }}
            />
        );
    } else if (continueQuiz && localStorage.getItem('sessionId')) {
        content = (
            <QuizSession
                sessionId={localStorage.getItem('sessionId')!}
                courseName=""
                orderType={orderType}
                startQuestion={startQuestion}
                onOrderChange={handleOrderChange}
            />
        );
    } else if (!course) {
        content = <CourseSelection onSelectCourse={setCourse} />;
    } else {
        content = (
            <QuizSession
                key={`${course}-${orderType}-${startQuestion}`}
                sessionId={localStorage.getItem('sessionId')!}
                courseName={course}
                orderType={orderType}
                startQuestion={startQuestion}
                onOrderChange={handleOrderChange}
            />
        );
    }

    console.log('[App] Vad renderas?', { showSettings, showTextToQuiz, showReviewPage, welcomeDone, continueQuiz, course });
    return (
        <div
            className="min-h-screen overflow-auto scrollbar-hide bg-white text-gray-900 dark:bg-neutral-900 dark:text-neutral-100"
        >
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={role} onNavigate={handleNavigate} />
            <Header theme={theme} setTheme={setTheme} onLogout={handleLogout} onMenuClick={() => setSidebarOpen(true)} />
            {content}
        </div>
    );
};

export default App;

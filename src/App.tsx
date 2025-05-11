import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ProfilePage from './components/ProfilePage';
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
    // ...

    const { i18n } = useTranslation();
    const { user, loading: userLoading } = useUser();

    // If no token or user is not loaded, always show Login
    const hasToken = !!localStorage.getItem('token');
    if (!hasToken || (!userLoading && !user)) {
        return <Login />;
    }


    const [theme, setTheme] = useState<ThemeType>('light');
    const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);
    const [course, setCourse] = useState<string | null>(null);
    const [orderType, setOrderType] = useState<OrderType>('ORDER');
    const [startQuestion, setStartQuestion] = useState<number>(1);
    const [welcomeDone, setWelcomeDone] = useState<boolean>(false);
    const [continueQuiz, setContinueQuiz] = useState<boolean>(false);
    const [reviewCourseName, setReviewCourseName] = useState<string | null>(null);

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [showProfile, setShowProfile] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showTextToQuiz, setShowTextToQuiz] = useState<boolean>(false);



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
        // Instead of redirect, just reload so App will show <Login />
        window.location.reload();
    }



    const resetAllViews = () => {
        setShowProfile(false);
        setShowSettings(false);
        setShowTextToQuiz(false);
        setCourse(null);
        setWelcomeDone(false);
        setContinueQuiz(false);
    };

    const handleNavigate = (destination: string) => {
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
            case 'profile':
                setShowProfile(true);
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
    if (isLoggedOut) return <LoggedOutScreen onLoginAgain={() => { setIsLoggedOut(false); }} />;

    const firstName = user?.firstName || '';
    const role = user?.role || 'ROLE_USER';

    let content = null;
    if (showProfile) {
        content = <ProfilePage onDone={() => {
            setShowProfile(false);
            setWelcomeDone(false);
        }} />;
    } else if (showSettings) {
        content = <Settings theme={theme} setTheme={setTheme} />;
    } else if (showTextToQuiz) {
        content = <TextToQuiz onReview={courseName => {
            setShowTextToQuiz(false);
            setReviewCourseName(courseName);
        }} />;
    } else if (reviewCourseName) {
        content = <ReviewQuestions courseName={reviewCourseName} onDone={() => {
            setReviewCourseName(null);
            setWelcomeDone(false);
        }} onAddMore={() => {
            setReviewCourseName(null);
            setShowTextToQuiz(true);
        }} />;
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
    } else if (continueQuiz && course) {
        // sessionId sätts av QuizSession när backend svarat
        const sessionId = localStorage.getItem('sessionId');
        content = (
            <QuizSession
                sessionId={sessionId || undefined}
                courseName={course || ''}
                orderType={orderType}
                startQuestion={startQuestion}
                onOrderChange={handleOrderChange}
                onDone={() => {
                    // Rensa sessionId när quizet är klart
                    localStorage.removeItem('sessionId');
                    setContinueQuiz(false);
                    setWelcomeDone(false);
                }}
                onSessionId={(id: string) => localStorage.setItem('sessionId', id)}
            />
        );
    } else if (!course) {
        content = <CourseSelection onSelectCourse={name => {
            setCourse(name);
            setContinueQuiz(true);
            setWelcomeDone(true);
        }} />;
    }

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

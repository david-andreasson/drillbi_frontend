import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate, Location } from 'react-router-dom';
import { ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { UserProvider, useUser } from './contexts/UserContext';
import { AppProvider } from './contexts/AppContext';
import AppRoutes from './AppRoutes';
import Login from './components/Login';
import { Course } from './components/CourseSelection/useCourses';
import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';
// import { getSupportedLanguage, LanguageProvider, setLanguageInStorage } from './contexts/LanguageContext'; // Kommenteras ut tills vidare
// import { CourseProvider } from "./contexts/CourseContext"; // Kommenteras ut tills vidare

export type ThemeType = 'light' | 'dark';

const THEME_KEY = 'app_theme';
// const LANGUAGE_KEY = 'app_language'; // Kommenteras ut tills vidare

const getInitialTheme = (): ThemeType => {
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeType | null;
    return savedTheme || 'light';
};

/* // Kommenteras ut tills vidare
const getInitialLanguage = (): string => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    return savedLanguage || getSupportedLanguage(navigator.language);
};
*/

interface AppContentProps {
    navigate: (to: string, options?: { replace?: boolean }) => void;
    location: Location;
}

function AppContent({ navigate, location }: AppContentProps) {
    const { user, loading: userLoading, token: contextToken, setToken: setContextToken, logout: contextLogout } = useUser();

    const [themeMode, setThemeMode] = useState<ThemeType>(getInitialTheme);
    // const [language, setLanguage] = useState<string>(getInitialLanguage); // Kommenteras ut tills vidare
    const [course, setCourse] = useState<Course | null>(null); // Behålls om AppRoutes behöver det
    const [isLoggingOut, setIsLoggingOut] = useState(false); // För att spåra om utloggning pågår

    const isAuthenticated = !!contextToken && !!user;
    const isPotentiallyAuthenticated = !!contextToken;

    useEffect(() => {
        localStorage.setItem(THEME_KEY, themeMode);
    }, [themeMode]);

    /* // Kommenteras ut tills vidare
    useEffect(() => {
        setLanguageInStorage(language);
    }, [language]);
    */

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl && setContextToken) {
            setContextToken(tokenFromUrl);
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate, setContextToken]);

    useEffect(() => {
        if (!userLoading) {
            if (!isAuthenticated) {
                // Tillåt endast inloggning och OAuth-återanrop
                const allowedPaths = ['/login', '/login/oauth2'];
                
                if (!allowedPaths.some(path => 
                    location.pathname === path || location.pathname.startsWith(path)
                )) {
                    navigate('/login', { replace: true });
                }
            } else if (location.pathname === '/login' || location.pathname === '/') {
                // Efter inloggning, skicka till kursväljaren
                navigate('/courses', { replace: true });
            }
        }
    }, [isAuthenticated, userLoading, location, navigate]);

    const muiTheme = createTheme({
        palette: {
            mode: themeMode,
            ...(themeMode === 'light'
                ? { primary: { main: '#1976d2' }, background: { default: '#f5f5f5', paper: '#ffffff' } }
                : { primary: { main: '#90caf9' }, background: { default: '#121212', paper: '#1e1e1e' } }),
        },
    });

    const toggleTheme = () => {
        setThemeMode((prevTheme: ThemeType) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleLogout = useCallback(async () => {
        try {
            setIsLoggingOut(true);
            if (contextLogout) {
                await contextLogout();
            }
            setCourse(null); // Rensa kursdata vid utloggning
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Fel vid utloggning:', error);
            // Visa eventuellt ett felmeddelande för användaren här
        } finally {
            setIsLoggingOut(false);
        }
    }, [contextLogout, navigate]);

    if (userLoading && isPotentiallyAuthenticated && location.pathname !== '/login' && !location.pathname.startsWith('/login/oauth2')) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (location.pathname.startsWith('/login/oauth2')) {
        return <OAuth2RedirectHandler />;
    }

    // LanguageProvider och CourseProvider är utkommenterade i JSX nedan också
    if (!isAuthenticated && location.pathname === '/login') {
        return (
            <ThemeProvider theme={muiTheme}>
                {/* <LanguageProvider language={language} setLanguage={setLanguage}> */}
                    <Toaster position="bottom-right" />
                    <Login />
                {/* </LanguageProvider> */}
            </ThemeProvider>
        );
    }

    if (isAuthenticated) {
        return (
            <ThemeProvider theme={muiTheme}>
                {/* <LanguageProvider language={language} setLanguage={setLanguage}> */}
                    {/* <CourseProvider course={course} setCourse={setCourse}> */}
                        <Toaster position="bottom-right" />
                        <AppRoutes 
                            toggleTheme={toggleTheme} 
                            currentTheme={themeMode} 
                            handleLogout={handleLogout} 
                            course={course} 
                            setCourse={setCourse}
                            isLoggingOut={isLoggingOut}
                            user={user}
                        />
                    {/* </CourseProvider> */}
                {/* </LanguageProvider> */}
            </ThemeProvider>
        );
    }
    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
}

// Hjälpkomponent för att använda useNavigate och useLocation inuti Router
const AppContentWithRouter: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    return <AppContent navigate={navigate} location={location} />;
};

function App() {
    return (
        <Router>
            <AppContentWithRouter />
        </Router>
    );
}

export default App;

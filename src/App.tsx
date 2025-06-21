import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate, Location } from 'react-router-dom';
import { ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { UserProvider, useUser } from './contexts/UserContext';
import { AppProvider } from './contexts/AppContext';
import AppRoutes from './AppRoutes';
import Login from './components/Login';

import OAuth2RedirectHandler from './components/OAuth2RedirectHandler';


export type ThemeType = 'light' | 'dark';

const THEME_KEY = 'app_theme';


const getInitialTheme = (): ThemeType => {
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeType | null;
    return savedTheme || 'light';
};



interface AppContentProps {
    navigate: (to: string, options?: { replace?: boolean }) => void;
    location: Location;
}

function AppContent({ navigate, location }: AppContentProps) {
    const { user, loading: userLoading, token: contextToken, setToken: setContextToken, logout: contextLogout } = useUser();

    const [themeMode, setThemeMode] = useState<ThemeType>(getInitialTheme);
    const [isLoggingOut, setIsLoggingOut] = useState(false); // To track if logout is in progress

    const isAuthenticated = !!contextToken && !!user;
    const isPotentiallyAuthenticated = !!contextToken;

    useEffect(() => {
        localStorage.setItem(THEME_KEY, themeMode);
    }, [themeMode]);



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
                // Only allow login and OAuth callback
                const allowedPaths = ['/login', '/login/oauth2'];
                
                if (!allowedPaths.some(path => 
                    location.pathname === path || location.pathname.startsWith(path)
                )) {
                    navigate('/login', { replace: true });
                }
            } else if (location.pathname === '/login' || location.pathname === '/') {
                // After login, redirect to course selector
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

            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            // Optionally show an error message to the user here
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
                        <Toaster position="bottom-right" />
                        <AppRoutes 
                            toggleTheme={toggleTheme} 
                            currentTheme={themeMode} 
                            handleLogout={handleLogout} 
                            isLoggingOut={isLoggingOut}
                            user={user}
                        />
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

// Helper component to use useNavigate and useLocation inside Router
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

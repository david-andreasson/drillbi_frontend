import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { UserProvider } from './contexts/UserContext';
import { AppProvider } from './contexts/AppContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <UserProvider>
            <AppProvider>
                <App />
            </AppProvider>
        </UserProvider>
    </React.StrictMode>
);

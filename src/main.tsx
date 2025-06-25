import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { UserProvider } from './contexts/UserContext';
import { AppProvider } from './contexts/AppContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <I18nextProvider i18n={i18n}>
            <UserProvider>
                <AppProvider>
                    <App />
                </AppProvider>
            </UserProvider>
        </I18nextProvider>
    </React.StrictMode>
);

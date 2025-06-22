import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const OAuth2RedirectHandler: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Parse token from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            // Remove token from URL and navigate to home
            navigate('/', { replace: true });
        } else {
            // If no token, show error or redirect to login
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const { t } = useTranslation();
    return (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2>{t('oauth2Redirect.processing')}</h2>
        </div>
    );
};

export default OAuth2RedirectHandler;

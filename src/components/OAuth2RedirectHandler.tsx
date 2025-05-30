import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2RedirectHandler: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Läs ut token från URL:en
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            // Ta bort token ur URL:en och navigera till startsidan
            navigate('/', { replace: true });
        } else {
            // Om ingen token, visa felmeddelande eller skicka till login
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2>Bearbetar inloggning...</h2>
        </div>
    );
};

export default OAuth2RedirectHandler;

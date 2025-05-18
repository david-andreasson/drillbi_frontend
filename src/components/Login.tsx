import React, { useState } from "react";
import PrimaryButton from "./ui/PrimaryButton";
import { useTranslation } from 'react-i18next';
import { FaGoogle } from 'react-icons/fa';
import api from '../api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login: React.FC = () => {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/api/v2/auth/login', { username, password });
            console.log('LOGIN SUCCESS RESPONSE:', response);
            const { token } = response.data;
            localStorage.setItem('token', token);
            // After storing token, reload to fetch user context
            window.location.reload();
        } catch (err: any) {
            console.error('LOGIN ERROR:', err);
            // Try to extract backend error message
            let msg = 'Login failed';
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    msg = err.response.data;
                } else if (err.response.data.error) {
                    msg = err.response.data.error;
                }
            }
            setError(
                msg === 'Felaktigt användarnamn eller lösenord' || msg === 'Bad credentials'
                  ? t('invalidCredentials')
                  : msg || t('loginFailed')
            );
            setPassword(''); // Clear password field for security
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-20 bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
        >
            <div className="max-w-md w-full text-center">
                <h1 className="text-3xl font-semibold mb-6">{t('welcome')}</h1>
                <p className="mb-4 text-[#59656F]">{t('loginPrompt')}</p>

                {/* Username/password login form */}
                <form onSubmit={handleSubmit} className="mb-6">
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                        className="w-full px-4 py-2 border rounded mb-4"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full px-4 py-2 border rounded mb-4"
                    />
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <PrimaryButton type="submit" className="w-full">
                        {t("login")}
                    </PrimaryButton>
                </form>

                {/* Google OAuth login */}
                <PrimaryButton type="button" className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300" onClick={handleGoogleLogin}>
                    <FaGoogle className="w-5 h-5" />
                    {t("loginWithGoogle")}
                </PrimaryButton>
            </div>
        </div>
    );
};

export default Login;
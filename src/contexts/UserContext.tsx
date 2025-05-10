import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/index';

interface User {
    username: string;
    role: string;
    firstName?: string;
    lastName?: string;
    userGroup?: string;
}

interface UserContextValue {
    user: User | null;
    loading: boolean;
    token: string | null;
}

const UserContext = createContext<UserContextValue>({ user: null, loading: true, token: null });

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
        if (!storedToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const res = await api.get<User>('/api/v2/users/me');
                setUser(res.data);
            } catch (e) {
                console.error('Failed to fetch user:', e);
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, token }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
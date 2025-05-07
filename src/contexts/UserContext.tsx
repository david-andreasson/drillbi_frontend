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
}

const UserContext = createContext<UserContextValue>({ user: null, loading: true });

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // no token → not logged in
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
        <UserContext.Provider value={{ user, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
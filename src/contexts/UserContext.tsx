import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/index';

export interface User {
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
    setToken: (newToken: string | null) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextValue>({
    user: null,
    loading: true,
    token: null,
    setToken: () => console.warn('setToken function not yet initialized'),
    logout: () => console.warn('logout function not yet initialized'),
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // Initialize token from localStorage, but allow it to be updated by setTokenInContext
    const [tokenState, setTokenInState] = useState<string | null>(localStorage.getItem('token'));

    const setTokenInContext = (newToken: string | null) => {
        if (newToken) {
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
        }
        setTokenInState(newToken);
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        setTokenInState(null);
        setUser(null);
        setLoading(false); // Explicitly set loading to false on logout
    };

    useEffect(() => {
        // This effect now primarily reacts to changes in tokenState (the internal token)
        if (!tokenState) {
            setUser(null);
            setLoading(false);
            return;
        }

        setLoading(true); // Set loading to true when fetching user
        (async () => {
            try {
                const res = await api.get<User>('/api/v2/users/me', {
                    headers: { Authorization: `Bearer ${tokenState}` } // Ensure API calls use the current token
                });
                setUser(res.data);
            } catch (e) {
                console.error('Failed to fetch user:', e);
                setUser(null);
                // Potentially clear token if it's invalid, e.g., after a 401 error
                // logoutUser(); // Or setTokenInContext(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [tokenState]); // Depend on tokenState

    return (
        <UserContext.Provider value={{ user, loading, token: tokenState, setToken: setTokenInContext, logout: logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
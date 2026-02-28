/**
 * Auth Context - 로그인 상태 관리
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 사용자 타입 정의
export interface User {
    id: string;
    name: string;
    email: string;
}

// Auth Context 타입
interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (partial: Partial<User>) => void;
}

// 기본값
const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    updateUser: () => { },
});

// Provider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const login = (userData: User, accessToken: string) => {
        setUser(userData);
        setToken(accessToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    const updateUser = (partial: Partial<User>) => {
        setUser(prev => prev ? { ...prev, ...partial } : prev);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: user !== null,
                user,
                token,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Hook
export function useAuth() {
    return useContext(AuthContext);
}

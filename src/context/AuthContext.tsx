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
}

// 기본값
const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
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

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: user !== null,
                user,
                token,
                login,
                logout,
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

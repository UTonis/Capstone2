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
    alertConfig: {
        visible: boolean;
        title: string;
        message: string;
        buttons: any[];
    };
    showAlert: (title: string, message: string, buttons?: any[]) => void;
    hideAlert: () => void;
}

// 기본값
const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    updateUser: () => { },
    alertConfig: { visible: false, title: '', message: '', buttons: [] },
    showAlert: () => { },
    hideAlert: () => { },
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

    // 알림 관련 상태
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        buttons: any[];
    }>({
        visible: false,
        title: '',
        message: '',
        buttons: [],
    });

    const showAlert = (title: string, message: string, buttons: any[] = []) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            buttons,
        });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
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
                alertConfig,
                showAlert,
                hideAlert,
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

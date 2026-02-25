import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { loginUser, fetchCurrentUser } from '../../services/api';

interface LoginScreenProps {
    onBack: () => void;
    onNavigateToRegister?: () => void;
    onLoginSuccess?: () => void;
}

const LoginScreen = ({ onBack, onNavigateToRegister, onLoginSuccess }: LoginScreenProps) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // 유효성 검사
        if (!email.trim()) {
            Alert.alert('입력 오류', '이메일을 입력해주세요.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('입력 오류', '올바른 이메일 형식을 입력해주세요.');
            return;
        }
        if (!password.trim()) {
            Alert.alert('입력 오류', '비밀번호를 입력해주세요.');
            return;
        }

        try {
            setLoading(true);
            // 1. 로그인 → JWT 토큰 받기
            const tokenData = await loginUser(email, password);

            // 2. 토큰으로 내 정보 조회
            const userData = await fetchCurrentUser(tokenData.access_token);

            // 3. AuthContext에 저장
            login(
                {
                    id: String(userData.id),
                    name: userData.nickname || userData.email,
                    email: userData.email,
                },
                tokenData.access_token,
            );

            if (onLoginSuccess) {
                onLoginSuccess();
            } else {
                onBack();
            }
        } catch (err: any) {
            Alert.alert('로그인 실패', err.message || '로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>로그인</Text>
                <View style={styles.placeholder} />
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* 안내 문구 */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>다시 오셨군요! ✈️</Text>
                        <Text style={styles.welcomeSubtitle}>
                            로그인하고 나만의 여행을 계속하세요
                        </Text>
                    </View>

                    {/* 입력 폼 */}
                    <View style={styles.formSection}>
                        {/* 이메일 */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>이메일</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="example@email.com"
                                placeholderTextColor="#BBBBBB"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* 비밀번호 */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>비밀번호</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="비밀번호를 입력하세요"
                                placeholderTextColor="#BBBBBB"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    {/* 로그인 버튼 */}
                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            (!email.trim() || !password.trim() || loading)
                                ? styles.loginButtonDisabled
                                : null,
                        ]}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>로그인</Text>
                        )}
                    </TouchableOpacity>

                    {/* 회원가입 안내 */}
                    <View style={styles.registerPrompt}>
                        <Text style={styles.registerPromptText}>계정이 없으신가요? </Text>
                        <TouchableOpacity onPress={onNavigateToRegister}>
                            <Text style={styles.registerLink}>회원가입</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 24,
        color: '#2B2B2B',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    placeholder: {
        width: 40,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    // 안내 문구
    welcomeSection: {
        marginBottom: 32,
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 15,
        color: '#888888',
        lineHeight: 22,
    },
    // 입력 폼
    formSection: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#2B2B2B',
    },
    // 로그인 버튼
    loginButton: {
        backgroundColor: '#5B67CA',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButtonDisabled: {
        backgroundColor: '#B0B5E0',
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    // 회원가입 안내
    registerPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerPromptText: {
        fontSize: 14,
        color: '#888888',
    },
    registerLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5B67CA',
    },
});

export default LoginScreen;

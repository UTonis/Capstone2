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
import { registerUser } from '../../services/api';

interface RegisterScreenProps {
    onBack: () => void;
    onRegisterSuccess?: () => void;
    onNavigateToLogin?: () => void;
}

const RegisterScreen = ({ onBack, onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        // 유효성 검사
        if (!name.trim()) {
            Alert.alert('입력 오류', '이름을 입력해주세요.');
            return;
        }
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
        if (password.length < 4) {
            Alert.alert('입력 오류', '비밀번호는 최소 4자 이상이어야 합니다.');
            return;
        }
        if (password !== passwordConfirm) {
            Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            setLoading(true);
            await registerUser({ email, password, nickname: name });

            Alert.alert(
                '회원가입 완료',
                '회원가입이 완료되었습니다. 로그인해주세요.',
                [
                    {
                        text: '확인',
                        onPress: () => {
                            if (onRegisterSuccess) {
                                onRegisterSuccess();
                            } else {
                                onBack();
                            }
                        },
                    },
                ],
            );
        } catch (err: any) {
            Alert.alert('회원가입 실패', err.message || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>회원가입</Text>
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
                        <Text style={styles.welcomeTitle}>반갑습니다! 👋</Text>
                        <Text style={styles.welcomeSubtitle}>
                            아래 정보를 입력하고 여행을 시작하세요
                        </Text>
                    </View>

                    {/* 입력 폼 */}
                    <View style={styles.formSection}>
                        {/* 이름 */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>이름</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="이름을 입력하세요"
                                placeholderTextColor="#BBBBBB"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

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
                                placeholder="비밀번호를 입력하세요 (4자 이상)"
                                placeholderTextColor="#BBBBBB"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        {/* 비밀번호 확인 */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>비밀번호 확인</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    passwordConfirm.length > 0 && password !== passwordConfirm
                                        ? styles.inputError
                                        : null,
                                ]}
                                placeholder="비밀번호를 다시 입력하세요"
                                placeholderTextColor="#BBBBBB"
                                value={passwordConfirm}
                                onChangeText={setPasswordConfirm}
                                secureTextEntry
                            />
                            {passwordConfirm.length > 0 && password !== passwordConfirm && (
                                <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
                            )}
                        </View>


                    </View>

                    {/* 회원가입 버튼 */}
                    <TouchableOpacity
                        style={[
                            styles.registerButton,
                            (!name.trim() || !email.trim() || !password.trim() || loading)
                                ? styles.registerButtonDisabled
                                : null,
                        ]}
                        onPress={handleRegister}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.registerButtonText}>회원가입</Text>
                        )}
                    </TouchableOpacity>

                    {/* 로그인 안내 */}
                    <View style={styles.loginPrompt}>
                        <Text style={styles.loginPromptText}>이미 계정이 있으신가요? </Text>
                        <TouchableOpacity onPress={onNavigateToLogin}>
                            <Text style={styles.loginLink}>로그인</Text>
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
    inputError: {
        borderColor: '#E74C3C',
    },
    errorText: {
        fontSize: 12,
        color: '#E74C3C',
        marginTop: 6,
        marginLeft: 4,
    },
    // 회원가입 버튼
    registerButton: {
        backgroundColor: '#5B67CA',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    registerButtonDisabled: {
        backgroundColor: '#B0B5E0',
    },
    registerButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    // 로그인 안내
    loginPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginPromptText: {
        fontSize: 14,
        color: '#888888',
    },
    loginLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5B67CA',
    },
});

export default RegisterScreen;

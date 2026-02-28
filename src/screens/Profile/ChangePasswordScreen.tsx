/**
 * ChangePasswordScreen - 비밀번호 변경 화면
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/api';

interface ChangePasswordScreenProps {
    onBack: () => void;
}

const ChangePasswordScreen = ({ onBack }: ChangePasswordScreenProps) => {
    const { token } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const isValid =
        currentPassword.trim().length > 0 &&
        newPassword.trim().length >= 4 &&
        newPassword === confirmPassword;

    const handleSave = async () => {
        if (!currentPassword.trim()) {
            Alert.alert('입력 오류', '현재 비밀번호를 입력해주세요.');
            return;
        }
        if (newPassword.trim().length < 4) {
            Alert.alert('입력 오류', '새 비밀번호는 4자 이상이어야 합니다.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('입력 오류', '새 비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!token) {
            Alert.alert('오류', '로그인이 필요합니다.');
            return;
        }

        try {
            setSaving(true);
            await changePassword(token, currentPassword, newPassword);
            Alert.alert('완료', '비밀번호가 변경되었습니다.', [
                { text: '확인', onPress: onBack },
            ]);
        } catch (err: any) {
            const msg = err.message || '';
            if (msg.includes('Current password') || msg.includes('incorrect')) {
                Alert.alert('오류', '현재 비밀번호가 올바르지 않습니다.');
            } else {
                Alert.alert('오류', msg || '비밀번호 변경에 실패했습니다.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>비밀번호 변경</Text>
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
                    {/* 안내 */}
                    <View style={styles.infoSection}>
                        <Text style={styles.infoText}>
                            보안을 위해 현재 비밀번호를 먼저 확인합니다.
                        </Text>
                    </View>

                    {/* 현재 비밀번호 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>현재 비밀번호</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="현재 비밀번호를 입력하세요"
                            placeholderTextColor="#BBBBBB"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                        />
                    </View>

                    {/* 새 비밀번호 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>새 비밀번호</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="새 비밀번호를 입력하세요 (4자 이상)"
                            placeholderTextColor="#BBBBBB"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />
                        {newPassword.length > 0 && newPassword.length < 4 && (
                            <Text style={styles.errorText}>4자 이상 입력해주세요</Text>
                        )}
                    </View>

                    {/* 새 비밀번호 확인 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>새 비밀번호 확인</Text>
                        <TextInput
                            style={[
                                styles.input,
                                confirmPassword.length > 0 && confirmPassword !== newPassword
                                    ? styles.inputError
                                    : null,
                            ]}
                            placeholder="새 비밀번호를 다시 입력하세요"
                            placeholderTextColor="#BBBBBB"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                        {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                            <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
                        )}
                    </View>

                    {/* 저장 버튼 */}
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            (!isValid || saving) && styles.saveButtonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={!isValid || saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>비밀번호 변경</Text>
                        )}
                    </TouchableOpacity>
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
        fontSize: 28,
        color: '#2B2B2B',
        fontWeight: '300',
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
    infoSection: {
        backgroundColor: '#EEF0FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoText: {
        fontSize: 14,
        color: '#5B67CA',
        lineHeight: 20,
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
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#5B67CA',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    saveButtonDisabled: {
        backgroundColor: '#B0B5E0',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default ChangePasswordScreen;

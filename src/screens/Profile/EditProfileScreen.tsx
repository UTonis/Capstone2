/**
 * EditProfileScreen - 회원 수정 화면 (프로필 수정 + 비밀번호 변경 + 회원 탈퇴)
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
import { updateProfile, deleteAccount } from '../../services/api';

interface EditProfileScreenProps {
    onBack: () => void;
    onNavigateToChangePassword?: () => void;
}

const EditProfileScreen = ({ onBack, onNavigateToChangePassword }: EditProfileScreenProps) => {
    const { user, token, updateUser, logout } = useAuth();
    const [nickname, setNickname] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const trimmed = nickname.trim();
        if (!trimmed) {
            Alert.alert('입력 오류', '닉네임을 입력해주세요.');
            return;
        }
        if (!token) {
            Alert.alert('오류', '로그인이 필요합니다.');
            return;
        }

        try {
            setSaving(true);
            await updateProfile(token, trimmed);
            updateUser({ name: trimmed });
            Alert.alert('완료', '프로필이 수정되었습니다.', [
                { text: '확인', onPress: onBack },
            ]);
        } catch (err: any) {
            Alert.alert('오류', err.message || '프로필 수정에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            '회원 탈퇴',
            '정말 탈퇴하시겠습니까?\n탈퇴 후에는 복구할 수 없습니다.',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '탈퇴',
                    style: 'destructive',
                    onPress: async () => {
                        if (!token) return;
                        try {
                            await deleteAccount(token);
                            logout();
                            onBack();
                            Alert.alert('완료', '회원 탈퇴가 완료되었습니다.');
                        } catch (err: any) {
                            Alert.alert('오류', err.message || '탈퇴에 실패했습니다.');
                        }
                    },
                },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>회원 수정</Text>
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
                    {/* 아바타 */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {nickname.charAt(0) || '?'}
                            </Text>
                        </View>
                    </View>

                    {/* 닉네임 입력 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>닉네임</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="닉네임을 입력하세요"
                            placeholderTextColor="#BBBBBB"
                            value={nickname}
                            onChangeText={setNickname}
                            autoFocus
                            maxLength={20}
                        />
                        <Text style={styles.charCount}>{nickname.length}/20</Text>
                    </View>

                    {/* 이메일 (읽기 전용) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>이메일</Text>
                        <View style={styles.readOnlyInput}>
                            <Text style={styles.readOnlyText}>{user?.email || ''}</Text>
                        </View>
                        <Text style={styles.helperText}>이메일은 변경할 수 없습니다</Text>
                    </View>

                    {/* 저장 버튼 */}
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            (!nickname.trim() || saving) && styles.saveButtonDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={!nickname.trim() || saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>저장</Text>
                        )}
                    </TouchableOpacity>

                    {/* 계정 관리 섹션 */}
                    <View style={styles.accountSection}>
                        <Text style={styles.accountSectionTitle}>계정 관리</Text>

                        <TouchableOpacity style={styles.accountMenuItem} onPress={onNavigateToChangePassword}>
                            <Text style={styles.accountMenuLabel}>비밀번호 변경</Text>
                            <Text style={styles.accountMenuArrow}>›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.accountMenuItem} onPress={handleDeleteAccount}>
                            <Text style={[styles.accountMenuLabel, styles.dangerText]}>회원 탈퇴</Text>
                            <Text style={styles.accountMenuArrow}>›</Text>
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
        paddingHorizontal: 20,
        paddingVertical: 16,
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
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 28,
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
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 12,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 24,
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
    charCount: {
        fontSize: 12,
        color: '#AAAAAA',
        textAlign: 'right',
        marginTop: 4,
    },
    readOnlyInput: {
        backgroundColor: '#F0F0F0',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    readOnlyText: {
        fontSize: 15,
        color: '#999999',
    },
    helperText: {
        fontSize: 12,
        color: '#AAAAAA',
        marginTop: 4,
    },
    saveButton: {
        backgroundColor: '#5B67CA',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#B0B5E0',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    accountSection: {
        marginTop: 32,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 20,
    },
    accountSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999999',
        marginBottom: 8,
    },
    accountMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    accountMenuLabel: {
        flex: 1,
        fontSize: 16,
        color: '#2B2B2B',
    },
    accountMenuArrow: {
        fontSize: 24,
        color: '#CCCCCC',
    },
    dangerText: {
        color: '#E74C3C',
    },
});

export default EditProfileScreen;

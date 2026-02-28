/**
 * EditProfileScreen - 프로필(닉네임) 수정 화면
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
import { updateProfile } from '../../services/api';

interface EditProfileScreenProps {
    onBack: () => void;
}

const EditProfileScreen = ({ onBack }: EditProfileScreenProps) => {
    const { user, token, updateUser } = useAuth();
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>프로필 수정</Text>
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
});

export default EditProfileScreen;

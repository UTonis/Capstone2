import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { deleteAccount, fetchMyPosts, BoardPostSummary } from '../../services/api';

const AirplaneIcon = require('../../assets/icons/airplane.png');
const HeartIcon = require('../../assets/icons/Heart.webp');
const NoteIcon = require('../../assets/icons/Note.png');

interface MyProfileScreenProps {
    onBack: () => void;
    onNavigateToRegister?: () => void;
    onNavigateToLogin?: () => void;
    onNavigateToPreference?: () => void;
    onNavigateToEditProfile?: () => void;
    onNavigateToChangePassword?: () => void;
    onNavigateToMyTrips?: () => void;
    onNavigateToPlannerGenerate?: () => void;
    onNavigateToMyPost?: (postId: number) => void;
    onNavigateToMySaved?: () => void;
    onNavigateToMyPosts?: () => void;
}

const MyProfileScreen = ({
    onBack,
    onNavigateToRegister,
    onNavigateToLogin,
    onNavigateToPreference,
    onNavigateToEditProfile,
    onNavigateToChangePassword,
    onNavigateToMyTrips,
    onNavigateToPlannerGenerate,
    onNavigateToMyPost,
    onNavigateToMySaved,
    onNavigateToMyPosts,
}: MyProfileScreenProps) => {
    const { isLoggedIn, user, token, logout, showAlert } = useAuth();
    const insets = useSafeAreaInsets();
    const [myPosts, setMyPosts] = useState<BoardPostSummary[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [showAllPosts, setShowAllPosts] = useState(false);
    const POSTS_PREVIEW = 3;

    useEffect(() => {
        if (isLoggedIn && token) {
            setPostsLoading(true);
            fetchMyPosts(token, 1, 20)
                .then(data => setMyPosts(data.items))
                .catch(() => setMyPosts([]))
                .finally(() => setPostsLoading(false));
        } else {
            setMyPosts([]);
        }
    }, [isLoggedIn, token]);

    const handleLogout = () => {
        showAlert(
            '로그아웃',
            '정말 로그아웃 하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '로그아웃',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        onBack();
                    },
                },
            ],
        );
    };

    const handleDeleteAccount = () => {
        showAlert(
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
                            showAlert('완료', '회원 탈퇴가 완료되었습니다.');
                        } catch (err: any) {
                            showAlert('오류', err.message || '탈퇴에 실패했습니다.');
                        }
                    },
                },
            ],
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>내 정보</Text>
                    <Text style={styles.headerSubtitle}>나의 여행 기록과 계정을 관리해요</Text>
                </View>
                {isLoggedIn && (
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>로그아웃</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 프로필 섹션 */}
                <View style={styles.profileSection}>
                    {isLoggedIn ? (
                        <View style={styles.profileRow}>
                            {/* 왼쪽: 프로필 사진 */}
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0) || '?'}
                                </Text>
                            </View>

                            {/* 오른쪽: 닉네임 + 회원 수정 */}
                            <View style={styles.profileInfo}>
                                <Text style={styles.userName}>{user?.name || '사용자'}</Text>
                                <Text style={styles.userEmail}>{user?.email || ''}</Text>
                                <TouchableOpacity style={styles.editButton} onPress={onNavigateToEditProfile}>
                                    <Text style={styles.editButtonText}>회원 수정</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.guestSection}>
                            {/* 게스트 아바타 */}
                            <View style={styles.guestAvatar}>
                                <Text style={styles.guestAvatarText}>?</Text>
                            </View>
                            <Text style={styles.guestText}>로그인하고 더 많은 기능을 이용해보세요</Text>
                            <View style={styles.authButtons}>
                                <TouchableOpacity style={styles.loginButton} onPress={onNavigateToLogin}>
                                    <Text style={styles.loginButtonText}>로그인</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.registerButton} onPress={onNavigateToRegister}>
                                    <Text style={styles.registerButtonText}>회원가입</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* 내 활동 메뉴 */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>내 활동</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={onNavigateToMyTrips}>
                        <Image source={AirplaneIcon} style={styles.menuIconImage} resizeMode="contain" />
                        <Text style={styles.menuLabel}>내 일정</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={onNavigateToMySaved}>
                        <Image source={HeartIcon} style={styles.menuIconImage} resizeMode="contain" />
                        <Text style={styles.menuLabel}>내 저장</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    {/* New My Posts Menu Item */}
                    <TouchableOpacity style={styles.menuItem} onPress={onNavigateToMyPosts}>
                        <Image source={NoteIcon} style={styles.menuIconImage} resizeMode="contain" />
                        <Text style={styles.menuLabel}>내 게시글</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                </View>




                {/* 앱 정보 */}
                <View style={styles.appInfo}>
                    <Text style={styles.appVersion}>버전 1.0.0</Text>
                </View>
            </ScrollView>
        </View>
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
        borderBottomColor: '#F0F0F0',
    },
    headerLeft: { flex: 1 },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666666',
    },
    logoutButton: {
        width: 60,
        alignItems: 'flex-end',
    },
    logoutButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E74C3C',
    },
    content: {
        flex: 1,
    },
    // 프로필 섹션
    profileSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginBottom: 12,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 20,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#888888',
        marginBottom: 12,
    },
    editButton: {
        backgroundColor: '#5B67CA',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // 메뉴 섹션
    menuSection: {
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999999',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    menuIcon: {
        fontSize: 22,
        marginRight: 16,
    },
    menuIconImage: {
        width: 24,
        height: 24,
        marginRight: 16,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: '#2B2B2B',
    },
    menuArrow: {
        fontSize: 24,
        color: '#CCCCCC',
    },
    dangerText: {
        color: '#E74C3C',
    },
    // 게스트 섹션
    guestSection: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    guestAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#CCCCCC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    guestAvatarText: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    guestText: {
        fontSize: 15,
        color: '#888888',
        marginBottom: 20,
    },
    authButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    loginButton: {
        backgroundColor: '#5B67CA',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 20,
    },
    loginButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    registerButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#5B67CA',
    },
    registerButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#5B67CA',
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    appVersion: {
        fontSize: 13,
        color: '#AAAAAA',
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionCount: {
        fontSize: 13,
        color: '#5B67CA',
        fontWeight: '600',
        paddingRight: 8,
    },
    emptyPost: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    emptyPostText: {
        fontSize: 14,
        color: '#AAAAAA',
    },
    postItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    postItemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    postItemMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    postItemRegion: {
        fontSize: 12,
        color: '#5B67CA',
    },
    postItemStat: {
        fontSize: 12,
        color: '#999',
    },
    showMoreButton: {
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    showMoreText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#5B67CA',
    },
});

export default MyProfileScreen;

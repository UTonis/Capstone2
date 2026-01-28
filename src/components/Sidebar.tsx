/**
 * Sidebar Component - 사이드 메뉴
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
    CloseIcon,
    BellIcon,
    SettingsIcon,
    UserIcon,
    MapPinIcon,
    HeartIcon,
    StarIcon,
    BookIcon,
    ChevronRightIcon,
} from './Icons';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.85;

interface SidebarProps {
    visible: boolean;
    onClose: () => void;
    onNavigateToProfile?: () => void;
    onNavigateToMyTrips?: () => void;
    onNavigateToSavedPlaces?: () => void;
}

function Sidebar({ visible, onClose, onNavigateToProfile, onNavigateToMyTrips, onNavigateToSavedPlaces }: SidebarProps) {
    const insets = useSafeAreaInsets();
    const { isLoggedIn, user, login, logout } = useAuth();

    const handleLogin = () => {
        // 테스트용 로그인
        login({
            id: '1',
            name: '홍길동',
            email: 'hong@example.com',
        });
    };

    const handleLogout = () => {
        logout();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <View style={[styles.sidebar, { paddingTop: insets.top }]}>
                    {/* 상단 헤더 */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <CloseIcon size={24} color="#2B2B2B" />
                        </TouchableOpacity>
                        <View style={styles.headerIcons}>
                            <TouchableOpacity style={styles.headerIconButton}>
                                <BellIcon size={22} color="#2B2B2B" />
                                <View style={styles.notificationBadge} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerIconButton}>
                                <SettingsIcon size={22} color="#2B2B2B" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* 프로필 섹션 */}
                        <View style={styles.profileSection}>
                            <View style={styles.profileLeft}>
                                {isLoggedIn ? (
                                    <>
                                        <Text style={styles.userName}>{user?.name || '사용자'}</Text>
                                        <TouchableOpacity onPress={() => {
                                            onClose();
                                            onNavigateToProfile && onNavigateToProfile();
                                        }}>
                                            <Text style={styles.editProfile}>프로필 편집 ›</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.userName}>게스트</Text>
                                        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                                            <Text style={styles.loginButtonText}>로그인</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                            <View style={styles.avatar}>
                                <View style={styles.avatarCircle}>
                                    {isLoggedIn ? (
                                        <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                                    ) : (
                                        <UserIcon size={28} color="#FFFFFF" />
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* 4개 아이콘 메뉴 */}
                        <View style={styles.iconMenuSection}>
                            <TouchableOpacity
                                style={styles.iconMenuItem}
                                onPress={() => {
                                    onClose();
                                    onNavigateToMyTrips && onNavigateToMyTrips();
                                }}
                            >
                                <MapPinIcon size={28} color="#2B2B2B" />
                                <Text style={styles.iconMenuLabel}>내 여행</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconMenuItem}
                                onPress={() => {
                                    onClose();
                                    onNavigateToSavedPlaces && onNavigateToSavedPlaces();
                                }}
                            >
                                <HeartIcon size={28} color="#2B2B2B" />
                                <Text style={styles.iconMenuLabel}>내 저장</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconMenuItem}>
                                <StarIcon size={28} color="#2B2B2B" />
                                <Text style={styles.iconMenuLabel}>내 리뷰</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconMenuItem}>
                                <BookIcon size={28} color="#2B2B2B" />
                                <Text style={styles.iconMenuLabel}>내 여행기</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 리스트 메뉴 */}
                        <View style={styles.listMenuSection}>
                            <TouchableOpacity style={styles.listMenuItem}>
                                <Text style={styles.listMenuLabel}>내 예약</Text>
                                <ChevronRightIcon size={20} color="#CCCCCC" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.listMenuItem}>
                                <View style={styles.listMenuLeft}>
                                    <Text style={styles.listMenuLabel}>쿠폰함</Text>
                                    <View style={styles.newBadge} />
                                </View>
                                <View style={styles.listMenuRight}>
                                    <Text style={styles.listMenuCount}>13</Text>
                                    <ChevronRightIcon size={20} color="#CCCCCC" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.listMenuItem}>
                                <Text style={styles.listMenuLabel}>NOL 포인트</Text>
                                <View style={styles.listMenuRight}>
                                    <Text style={styles.listMenuCount}>0</Text>
                                    <ChevronRightIcon size={20} color="#CCCCCC" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.listMenuItem}>
                                <Text style={styles.listMenuLabel}>여행자 클럽</Text>
                                <View style={styles.listMenuRight}>
                                    <Text style={styles.listMenuCount}>0P</Text>
                                    <ChevronRightIcon size={20} color="#CCCCCC" />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.listMenuItem}>
                                <Text style={styles.listMenuLabel}>오프라인 가이드</Text>
                                <ChevronRightIcon size={20} color="#CCCCCC" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* 하단 버튼 */}
                    <View style={styles.footer}>
                        {isLoggedIn ? (
                            <>
                                <TouchableOpacity style={styles.footerButton}>
                                    <Text style={styles.footerButtonText}>공지사항</Text>
                                    <View style={styles.newDot} />
                                </TouchableOpacity>
                                <View style={styles.footerDivider} />
                                <TouchableOpacity style={styles.footerButton} onPress={handleLogout}>
                                    <Text style={[styles.footerButtonText, styles.logoutText]}>로그아웃</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.footerButton}>
                                    <Text style={styles.footerButtonText}>공지사항</Text>
                                    <View style={styles.newDot} />
                                </TouchableOpacity>
                                <View style={styles.footerDivider} />
                                <TouchableOpacity style={styles.footerButton}>
                                    <Text style={styles.footerButtonText}>고객센터</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sidebar: {
        width: SIDEBAR_WIDTH,
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    closeButton: {
        padding: 4,
    },
    closeIcon: {
        fontSize: 24,
        color: '#2B2B2B',
    },
    headerIcon: {
        fontSize: 22,
    },
    iconMenuIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    headerIconButton: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF4444',
    },
    content: {
        flex: 1,
    },
    profileSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    profileLeft: {
        flex: 1,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    editProfile: {
        fontSize: 14,
        color: '#888888',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#B8A4E8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    loginButton: {
        backgroundColor: '#5B67CA',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 4,
    },
    loginButtonText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    iconMenuSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    iconMenuItem: {
        flex: 1,
        alignItems: 'center',
    },
    iconMenuLabel: {
        fontSize: 13,
        color: '#2B2B2B',
        marginTop: 8,
    },
    listMenuSection: {
        paddingVertical: 8,
    },
    listMenuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    listMenuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listMenuLabel: {
        fontSize: 16,
        color: '#2B2B2B',
        fontWeight: '500',
    },
    newBadge: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF4444',
        marginLeft: 6,
    },
    listMenuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    listMenuCount: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    listMenuArrow: {
        fontSize: 24,
        color: '#CCCCCC',
    },
    footer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    footerButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerButtonText: {
        fontSize: 14,
        color: '#666666',
    },
    newDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#FF4444',
        marginLeft: 4,
    },
    footerDivider: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 8,
    },
    logoutText: {
        color: '#E74C3C',
    },
});

export default Sidebar;

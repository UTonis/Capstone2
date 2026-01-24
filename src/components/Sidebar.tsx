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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface SidebarProps {
    visible: boolean;
    onClose: () => void;
}

// 메뉴 아이템 데이터
const menuItems = [
    { id: 1, icon: '🏠', label: '홈' },
    { id: 2, icon: '👤', label: '내 정보' },
    { id: 3, icon: '❤️', label: '찜한 여행지' },
    { id: 4, icon: '📅', label: '내 일정' },
    { id: 5, icon: '💬', label: '알림' },
    { id: 6, icon: '⚙️', label: '설정' },
];

function Sidebar({ visible, onClose }: SidebarProps) {
    const insets = useSafeAreaInsets();

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

                <View style={[styles.sidebar, { paddingTop: insets.top + 20 }]}>
                    {/* 프로필 섹션 */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>👤</Text>
                        </View>
                        <Text style={styles.userName}>사용자님</Text>
                        <Text style={styles.userEmail}>user@example.com</Text>
                    </View>

                    {/* 구분선 */}
                    <View style={styles.divider} />

                    {/* 메뉴 아이템들 */}
                    <View style={styles.menuContainer}>
                        {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={onClose}
                            >
                                <Text style={styles.menuIcon}>{item.icon}</Text>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 하단 로그아웃 */}
                    <View style={styles.bottomSection}>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.logoutButton}>
                            <Text style={styles.logoutIcon}>🚪</Text>
                            <Text style={styles.logoutText}>로그아웃</Text>
                        </TouchableOpacity>
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
    profileSection: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 13,
        color: '#888888',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 20,
    },
    menuContainer: {
        flex: 1,
        paddingTop: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    menuIcon: {
        fontSize: 22,
        marginRight: 16,
    },
    menuLabel: {
        fontSize: 16,
        color: '#333333',
    },
    bottomSection: {
        paddingBottom: 30,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    logoutIcon: {
        fontSize: 22,
        marginRight: 16,
    },
    logoutText: {
        fontSize: 16,
        color: '#E74C3C',
    },
});

export default Sidebar;

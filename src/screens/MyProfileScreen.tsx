import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MyProfileScreenProps {
    onBack: () => void;
}

const MyProfileScreen = ({ onBack }: MyProfileScreenProps) => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>내 정보</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 프로필 섹션 */}
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>홍</Text>
                    </View>
                    <Text style={styles.userName}>홍길동</Text>
                    <Text style={styles.userEmail}>hong@example.com</Text>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>프로필 수정</Text>
                    </TouchableOpacity>
                </View>

                {/* 통계 */}
                <View style={styles.statsSection}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>여행 계획</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>8</Text>
                        <Text style={styles.statLabel}>완료한 여행</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>24</Text>
                        <Text style={styles.statLabel}>찜한 장소</Text>
                    </View>
                </View>

                {/* 메뉴 */}
                <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>👤</Text>
                        <Text style={styles.menuLabel}>계정 설정</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>🔔</Text>
                        <Text style={styles.menuLabel}>알림 설정</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>🌍</Text>
                        <Text style={styles.menuLabel}>언어 설정</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>❓</Text>
                        <Text style={styles.menuLabel}>도움말</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* 앱 정보 */}
                <View style={styles.appInfo}>
                    <Text style={styles.appVersion}>버전 1.0.0</Text>
                </View>
            </ScrollView>
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
        padding: 4,
    },
    backButtonText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    placeholder: {
        width: 60,
    },
    content: {
        flex: 1,
    },
    profileSection: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        paddingVertical: 40,
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 15,
        color: '#888888',
        marginBottom: 20,
    },
    editButton: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5B67CA',
    },
    statsSection: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#5B67CA',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#888888',
    },
    menuSection: {
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
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
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: '#2B2B2B',
    },
    menuArrow: {
        fontSize: 24,
        color: '#CCCCCC',
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    appVersion: {
        fontSize: 13,
        color: '#AAAAAA',
    },
});

export default MyProfileScreen;

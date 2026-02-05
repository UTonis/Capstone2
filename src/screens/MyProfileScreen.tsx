import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AirplaneIcon = require('../data/airplane.png');
const HeartIcon = require('../data/Heart.webp');
const NoteIcon = require('../data/Note.png');

interface MyProfileScreenProps {
    onBack: () => void;
}

const MyProfileScreen = ({ onBack }: MyProfileScreenProps) => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <View style={styles.placeholder} />
                <Text style={styles.headerTitle}>내 정보</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 프로필 섹션 - 가로 배치 */}
                <View style={styles.profileSection}>
                    <View style={styles.profileRow}>
                        {/* 왼쪽: 프로필 사진 */}
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>홍</Text>
                        </View>

                        {/* 오른쪽: 닉네임 + 프로필 수정 */}
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>홍길동</Text>
                            <Text style={styles.userEmail}>hong@example.com</Text>
                            <TouchableOpacity style={styles.editButton}>
                                <Text style={styles.editButtonText}>프로필 수정</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 내 활동 메뉴 */}
                <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Image source={AirplaneIcon} style={styles.menuIconImage} resizeMode="contain" />
                        <Text style={styles.menuLabel}>내 여행</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Image source={HeartIcon} style={styles.menuIconImage} resizeMode="contain" />
                        <Text style={styles.menuLabel}>내 저장</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Image source={NoteIcon} style={styles.menuIconImage} resizeMode="contain" />
                        <Text style={styles.menuLabel}>내 리뷰</Text>
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

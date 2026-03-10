/**
 * Features Screen - 기능 목록 페이지
 * 앱의 주요 기능들을 리스트로 보여주는 화면
 */

import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenName = 'main' | 'features' | 'aiplanner' | 'recommend' | 'schedule';

// 기능 목록 데이터
const features = [
    {
        id: 1,
        title: 'AI 플래너',
        icon: '📸',
        screen: 'aiplanner' as ScreenName,
        available: true,
    },
    {
        id: 2,
        title: '사진 분석',
        icon: '🔍',
        screen: null,
        available: false,
    },
    {
        id: 3,
        title: '장소 정보',
        icon: '📍',
        screen: null,
        available: false,
    },
    {
        id: 4,
        title: '경로 계산',
        icon: '🗺️',
        screen: null,
        available: false,
    },
    {
        id: 5,
        title: '지도 시각화',
        icon: '🌏',
        screen: null,
        available: false,
    },
    {
        id: 6,
        title: '여행지 추천',
        icon: '✨',
        screen: 'recommend' as ScreenName,
        available: true,
    },
    {
        id: 7,
        title: '일정 생성',
        icon: '📅',
        screen: 'schedule' as ScreenName,
        available: true,
    },
];

interface FeaturesScreenProps {
    onBack: () => void;
    onNavigate: (screen: any) => void;
}

function FeaturesScreen({ onBack, onNavigate }: FeaturesScreenProps) {
    const insets = useSafeAreaInsets();

    const handleFeaturePress = (feature: typeof features[0]) => {
        if (feature.available && feature.screen) {
            onNavigate(feature.screen);
        } else {
            Alert.alert('준비 중', '해당 기능은 현재 준비 중입니다.');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>기능 목록</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* 기능 목록 */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.sectionDescription}>
                    여행 계획에 필요한 다양한 기능을 확인해보세요
                </Text>

                <View style={styles.gridContainer}>
                    {features.map((feature) => (
                        <TouchableOpacity
                            key={feature.id}
                            style={[
                                styles.featureCard,
                                !feature.available && styles.featureCardDisabled,
                            ]}
                            onPress={() => handleFeaturePress(feature)}
                            activeOpacity={feature.available ? 0.7 : 1}
                        >
                            <View style={styles.iconContainer}>
                                <Text style={styles.featureIcon}>{feature.icon}</Text>
                            </View>
                            <Text style={[
                                styles.featureTitle,
                                !feature.available && styles.featureTitleDisabled,
                            ]}>
                                {feature.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 하단 여백 */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
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
        fontWeight: '600',
        color: '#2B2B2B',
    },
    headerPlaceholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#888888',
        marginBottom: 20,
        lineHeight: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureCard: {
        width: '48%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        minHeight: 120,
    },
    featureCardDisabled: {
        backgroundColor: '#FAFAFA',
        borderColor: '#E8E8E8',
        opacity: 0.6,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F0F0FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureIcon: {
        fontSize: 28,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2B2B2B',
        textAlign: 'center',
    },
    featureTitleDisabled: {
        color: '#AAAAAA',
    },
});

export default FeaturesScreen;

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

type ScreenName = 'main' | 'features' | 'photoInput' | 'recommend' | 'schedule';

// 기능 목록 데이터
const features = [
    {
        id: 1,
        title: '사진 입력 & 기본 처리',
        description: '여행 사진을 업로드하고 기본 처리를 진행합니다',
        screen: 'photoInput' as ScreenName,
        available: true,
    },
    {
        id: 2,
        title: '사진 분석',
        description: 'AI를 활용하여 사진 속 장소와 정보를 분석합니다',
        screen: null,
        available: false,
    },
    {
        id: 3,
        title: '장소 상세 정보 제공',
        description: '분석된 장소의 상세 정보를 제공합니다',
        screen: null,
        available: false,
    },
    {
        id: 4,
        title: '이동 경로 계산',
        description: '여행지 간 최적의 이동 경로를 계산합니다',
        screen: null,
        available: false,
    },
    {
        id: 5,
        title: '지도 시각화',
        description: '여행 경로를 지도에 시각적으로 표시합니다',
        screen: null,
        available: false,
    },
    {
        id: 6,
        title: '유사 여행지 추천',
        description: '취향에 맞는 비슷한 여행지를 추천합니다',
        screen: 'recommend' as ScreenName,
        available: true,
    },
    {
        id: 7,
        title: '여행 일정 생성',
        description: '자동으로 최적의 여행 일정을 생성합니다',
        screen: 'schedule' as ScreenName,
        available: true,
    },
];

interface FeaturesScreenProps {
    onBack: () => void;
    onNavigate: (screen: ScreenName) => void;
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
                    <Text style={styles.backButtonText}>{'<'}</Text>
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

                {features.map((feature, index) => (
                    <TouchableOpacity
                        key={feature.id}
                        style={[
                            styles.featureCard,
                            !feature.available && styles.featureCardDisabled,
                        ]}
                        onPress={() => handleFeaturePress(feature)}
                        activeOpacity={feature.available ? 0.7 : 1}
                    >
                        <View style={[
                            styles.featureNumber,
                            !feature.available && styles.featureNumberDisabled,
                        ]}>
                            <Text style={styles.featureNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.featureContent}>
                            <View style={styles.featureTitleRow}>
                                <Text style={[
                                    styles.featureTitle,
                                    !feature.available && styles.featureTitleDisabled,
                                ]}>
                                    {feature.title}
                                </Text>
                                {feature.available && (
                                    <View style={styles.availableBadge}>
                                        <Text style={styles.availableBadgeText}>사용가능</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={[
                                styles.featureDescription,
                                !feature.available && styles.featureDescriptionDisabled,
                            ]}>
                                {feature.description}
                            </Text>
                        </View>
                        <View style={styles.featureArrow}>
                            <Text style={[
                                styles.featureArrowText,
                                !feature.available && styles.featureArrowDisabled,
                            ]}>{'>'}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

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
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        fontSize: 24,
        color: '#2B2B2B',
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: 18,
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
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    featureCardDisabled: {
        backgroundColor: '#FAFAFA',
        borderColor: '#E8E8E8',
    },
    featureNumber: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    featureNumberDisabled: {
        backgroundColor: '#CCCCCC',
    },
    featureNumberText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    featureContent: {
        flex: 1,
    },
    featureTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
    },
    featureTitleDisabled: {
        color: '#AAAAAA',
    },
    availableBadge: {
        marginLeft: 8,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    availableBadgeText: {
        fontSize: 10,
        color: '#4CAF50',
        fontWeight: '600',
    },
    featureDescription: {
        fontSize: 13,
        color: '#888888',
        lineHeight: 18,
    },
    featureDescriptionDisabled: {
        color: '#BBBBBB',
    },
    featureArrow: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureArrowText: {
        fontSize: 18,
        color: '#5B67CA',
        fontWeight: '300',
    },
    featureArrowDisabled: {
        color: '#CCCCCC',
    },
});

export default FeaturesScreen;

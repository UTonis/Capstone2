/**
 * ImageAnalysisModal
 * 사진 분석 결과를 아래서 위로 슬라이드되는 모달로 표시
 * 각 사진의 분석 결과를 개별 카드로 보여주고 하나를 선택할 수 있음
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import { FullAnalysisResponse } from '../services/api';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// 개별 사진 결과 아이템
export interface PhotoResultItem {
    uri: string;
    result: FullAnalysisResponse | null;
}

// (하위 호환용) 도시 선택지 - 현재는 사용 안 함, 향후 확장을 위해 남김
export interface CityChoice {
    city: string;
    onSelect: () => void;
}

interface ImageAnalysisModalProps {
    visible: boolean;
    loading?: boolean;                        // 전체 분석 중 로딩
    photoResults: PhotoResultItem[];          // 사진별 분석 결과
    onSelectResult: (result: FullAnalysisResponse) => void;  // 결과 선택
    onCancel: () => void;
}

// 타입 레이블 & 배지 색상
const TYPE_INFO: Record<string, { label: string; color: string; bg: string }> = {
    A: { label: '위치 확인됨', color: '#10B981', bg: '#ECFDF5' },
    B: { label: '유사 위치 예측', color: '#F59E0B', bg: '#FFFBEB' },
    C: { label: '위치 불명확', color: '#6B7280', bg: '#F3F4F6' },
};

function ImageAnalysisModal({
    visible,
    loading = false,
    photoResults,
    onSelectResult,
    onCancel,
}: ImageAnalysisModalProps) {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    damping: 20,
                    stiffness: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            {/* 배경 딤 */}
            <TouchableWithoutFeedback onPress={onCancel}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
            </TouchableWithoutFeedback>

            {/* 슬라이드 패널 */}
            <Animated.View
                style={[
                    styles.panel,
                    { transform: [{ translateY: slideAnim }] },
                ]}
            >
                {/* 드래그 핸들 */}
                <View style={styles.handle} />

                {/* 헤더 */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerTitle}>🔍 분석 결과</Text>
                        {!loading && photoResults.length > 0 && (
                            <Text style={styles.headerSub}>
                                여행을 계획할 결과를 선택해주세요
                            </Text>
                        )}
                    </View>
                </View>

                {/* 컨텐츠 */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#5B67CA" />
                        <Text style={styles.loadingText}>AI가 사진을 분석하는 중...</Text>
                        <Text style={styles.loadingSub}>잠시만 기다려 주세요</Text>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        bounces={false}
                    >
                        {photoResults.map((item, index) => {
                            const res = item.result;
                            const typeInfo = res ? TYPE_INFO[res.type] ?? TYPE_INFO['C'] : null;
                            const confidencePercent = res ? Math.round(res.confidence * 100) : 0;
                            const locParts = res?.location
                                ? [res.location.landmark, res.location.city].filter(Boolean)
                                : [];
                            const locationLabel = locParts.length > 0
                                ? locParts.join(', ')
                                : '위치를 특정할 수 없습니다';
                            const sceneTags = res?.scene?.scene_type ?? [];

                            return (
                                <View key={index} style={styles.resultCard}>
                                    {/* 사진 번호 */}
                                    <View style={styles.cardHeaderRow}>
                                        <View style={styles.cardIndexBadge}>
                                            <Text style={styles.cardIndexText}>사진 {index + 1}</Text>
                                        </View>
                                        {typeInfo && (
                                            <View style={[styles.typeBadge, { backgroundColor: typeInfo.bg }]}>
                                                <View style={[styles.typeDot, { backgroundColor: typeInfo.color }]} />
                                                <Text style={[styles.typeLabel, { color: typeInfo.color }]}>
                                                    {typeInfo.label}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* 사진 썸네일 */}
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={styles.thumbnail}
                                        resizeMode="cover"
                                    />

                                    {res ? (
                                        <View style={styles.cardBody}>
                                            {/* 장소 */}
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoIcon}>📍</Text>
                                                <View style={styles.infoContent}>
                                                    <Text style={styles.infoTitle}>장소</Text>
                                                    <Text style={styles.infoValue}>{locationLabel}</Text>
                                                </View>
                                            </View>

                                            {/* 신뢰도 */}
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoIcon}>📊</Text>
                                                <View style={styles.infoContent}>
                                                    <Text style={styles.infoTitle}>신뢰도</Text>
                                                    <View style={styles.confidenceRow}>
                                                        <View style={styles.confidenceBar}>
                                                            <View
                                                                style={[
                                                                    styles.confidenceFill,
                                                                    {
                                                                        width: `${confidencePercent}%` as any,
                                                                        backgroundColor:
                                                                            confidencePercent >= 70
                                                                                ? '#10B981'
                                                                                : confidencePercent >= 40
                                                                                ? '#F59E0B'
                                                                                : '#EF4444',
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                        <Text style={styles.confidenceText}>{confidencePercent}%</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* AI 설명 */}
                                            <View style={styles.infoRow}>
                                                <Text style={styles.infoIcon}>💬</Text>
                                                <View style={styles.infoContent}>
                                                    <Text style={styles.infoTitle}>AI 분석</Text>
                                                    <Text style={styles.infoValue}>{res.explanation}</Text>
                                                </View>
                                            </View>

                                            {/* 분위기 */}
                                            {res.scene?.atmosphere ? (
                                                <View style={styles.infoRow}>
                                                    <Text style={styles.infoIcon}>✨</Text>
                                                    <View style={styles.infoContent}>
                                                        <Text style={styles.infoTitle}>분위기</Text>
                                                        <Text style={styles.infoValue}>{res.scene.atmosphere}</Text>
                                                    </View>
                                                </View>
                                            ) : null}

                                            {/* 태그 */}
                                            {sceneTags.length > 0 && (
                                                <View style={styles.tagsContainer}>
                                                    {sceneTags.map((tag, ti) => (
                                                        <View key={ti} style={styles.tag}>
                                                            <Text style={styles.tagText}>#{tag}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}

                                            {/* 선택 버튼 */}
                                            <TouchableOpacity
                                                style={styles.selectBtn}
                                                onPress={() => onSelectResult(res)}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.selectBtnText}>이 결과로 일정 만들기</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.noResultBox}>
                                            <Text style={styles.noResultText}>분석 결과 없음</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}

                        <View style={{ height: 8 }} />
                    </ScrollView>
                )}

                {/* 취소 버튼 */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={onCancel}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.cancelBtnText}>취소</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    panel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: SCREEN_HEIGHT * 0.92,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 4,
    },

    // 헤더
    headerRow: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1A2E',
    },
    headerSub: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },

    // 로딩
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2B2B2B',
        marginTop: 8,
    },
    loadingSub: {
        fontSize: 13,
        color: '#999',
    },

    // 스크롤
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        gap: 16,
    },

    // 결과 카드
    resultCard: {
        backgroundColor: '#F8F9FE',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEEEF8',
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
    },
    cardIndexBadge: {
        backgroundColor: '#5B67CA',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    cardIndexText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 5,
    },
    typeDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    typeLabel: {
        fontSize: 12,
        fontWeight: '700',
    },

    // 썸네일
    thumbnail: {
        width: '100%',
        height: 180,
        backgroundColor: '#E0E0E0',
    },

    // 카드 본문
    cardBody: {
        padding: 16,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    infoIcon: {
        fontSize: 17,
        marginTop: 1,
    },
    infoContent: {
        flex: 1,
        gap: 2,
    },
    infoTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#5B67CA',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 14,
        color: '#2B2B2B',
        lineHeight: 20,
    },

    // 신뢰도 바
    confidenceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    confidenceBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    confidenceFill: {
        height: '100%',
        borderRadius: 4,
    },
    confidenceText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2B2B2B',
        minWidth: 36,
    },

    // 태그
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tag: {
        backgroundColor: '#EEF0FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    tagText: {
        fontSize: 12,
        color: '#5B67CA',
        fontWeight: '600',
    },

    // 선택 버튼
    selectBtn: {
        backgroundColor: '#5B67CA',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    selectBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },

    // 결과 없음
    noResultBox: {
        alignItems: 'center',
        padding: 20,
    },
    noResultText: {
        fontSize: 14,
        color: '#999',
    },

    // 하단 취소
    bottomBar: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 28,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
    },
    cancelBtn: {
        backgroundColor: '#F3F4F6',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#6B7280',
    },
});

export default ImageAnalysisModal;

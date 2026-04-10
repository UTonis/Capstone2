/**
 * Schedule Screen - 여행 일정 생성 화면
 * 날짜와 장소를 입력하여 일정표 생성
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    FlatList,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getMyTrips, deleteTrip, TripSummary, BASE_URL } from '../../services/api';
import ScheduleDetailScreen from './ScheduleDetailScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScheduleScreenProps {
    onBack: () => void;
    onNavigateToPlannerGenerate?: () => void;
    onNavigateToScheduleDetail?: (id: number, title: string) => void;
}


interface ScheduleItem {
    id: number;
    day: number;
    time: string;
    place: string;
    note: string;
}

function ScheduleScreen({ onBack, onNavigateToPlannerGenerate, onNavigateToScheduleDetail }: ScheduleScreenProps) {
    const insets = useSafeAreaInsets();
    const { token, showAlert } = useAuth();
    const [savedTrips, setSavedTrips] = useState<TripSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [bannerIndex, setBannerIndex] = useState(0);

    useEffect(() => {
        if (token) {
            fetchTrips();
        }
    }, [token]);

    const fetchTrips = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await getMyTrips(token);
            setSavedTrips(data.trips);
        } catch (err) {
            console.error('Error fetching trips:', err);
        } finally {
            setLoading(false);
        }
    };

    // 배너에 표시할 이미지 URL 정규화 함수
    const resolveImageUrl = (trip: TripSummary): string | null => {
        let rawUrl = trip.thumbnail_url || trip.image_url;
        if (!rawUrl || rawUrl === 'null' || rawUrl === '') return null;
        const url = rawUrl.trim();
        if (url.startsWith('http')) return url;
        if (url.startsWith('//')) return `http:${url}`;
        const cleanPath = url.startsWith('/') ? url.substring(1) : url;
        return `${BASE_URL}/${cleanPath.replace(/\\/g, '/')}`;
    };

    // 이미지가 있는 여행만 배너 슬라이더에 표시
    const bannerTrips = savedTrips.filter(t => resolveImageUrl(t) !== null).slice(0, 5);

    const handleBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setBannerIndex(idx);
    };

    const handleDeleteTrip = (id: number, title: string) => {
        showAlert(
            '일정 삭제',
            `'${title}' 일정을 삭제하시겠습니까?`,
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        if (!token) return;
                        try {
                            setLoading(true);
                            await deleteTrip(token, id);
                            // 목록 새로고침
                            await fetchTrips();
                            showAlert('알림', '일정이 삭제되었습니다.');
                        } catch (err) {
                            console.error('Error deleting trip:', err);
                            showAlert('오류', '일정 삭제에 실패했습니다.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };


    // 일정 상세 화면 표시
    if (selectedSchedule) {
        return (
            <ScheduleDetailScreen
                schedule={selectedSchedule}
                onBack={() => setSelectedSchedule(null)}
            />
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>여행 일정</Text>
                </View>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* 사진 배너 슬라이더 */}
            {!loading && bannerTrips.length > 0 && (
                <View style={styles.bannerContainer}>
                    <FlatList
                        data={bannerTrips}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleBannerScroll}
                        scrollEventThrottle={16}
                        keyExtractor={(item) => `banner-${item.id}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                activeOpacity={0.92}
                                onPress={() => setSelectedSchedule(item)}
                                style={styles.bannerSlide}
                            >
                                <Image
                                    source={{ uri: resolveImageUrl(item)! }}
                                    style={styles.bannerImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.bannerOverlay}>
                                    <View style={styles.bannerBadge}>
                                        <Text style={styles.bannerBadgeText}>📍 {item.region || '여행'}</Text>
                                    </View>
                                    <Text style={styles.bannerTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.bannerDate}>{item.start_date} ~ {item.end_date}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                    {/* 도트 인디케이터 */}
                    {bannerTrips.length > 1 && (
                        <View style={styles.dotRow}>
                            {bannerTrips.map((_, i) => (
                                <View
                                    key={i}
                                    style={i === bannerIndex ? [styles.dot, styles.dotActive] as any : styles.dot}
                                />
                            ))}
                        </View>
                    )}
                </View>
            )}

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 저장된 일정 목록 */}
                <View style={styles.section}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#5B67CA" style={{ marginTop: 40 }} />
                    ) : savedTrips.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateIcon}>📅</Text>
                            <Text style={styles.emptyStateText}>저장된 일정이 없습니다</Text>
                            <Text style={styles.emptyStateSubtext}>AI 플래너로 일정을 만들어보세요</Text>
                        </View>
                    ) : (
                        savedTrips.map((schedule) => (
                            <TouchableOpacity
                                key={schedule.id}
                                style={styles.scheduleCard}
                                onPress={() => onNavigateToScheduleDetail?.(schedule.id, schedule.title)}
                            >
                                <View style={styles.scheduleCardHeader}>
                                    <Text style={styles.scheduleCardTitle} numberOfLines={1}>{schedule.title}</Text>
                                    <TouchableOpacity
                                        style={styles.deleteIconButton}
                                        onPress={() => handleDeleteTrip(schedule.id, schedule.title)}
                                    >
                                        <Text style={styles.deleteIconText}>🗑️</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.scheduleCardArrow}>›</Text>
                                </View>
                                <Text style={styles.scheduleCardDate}>
                                    {schedule.start_date} ~ {schedule.end_date}
                                </Text>
                                <View style={styles.scheduleCardFooter}>
                                    <View style={styles.regionRow}>
                                        <Image source={require('../../data/PIN Icon.png')} style={styles.pinIcon} />
                                        <Text style={styles.scheduleCardInfo}>
                                            {schedule.region || '지역 미설정'}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
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
        backgroundColor: '#FFFFFF',
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
    headerLeft: { flex: 1, alignItems: 'center' },
    headerTitle: {
        fontSize: 28,
        fontWeight: '600',
        color: '#2B2B2B',
    },
    headerPlaceholder: {
        width: 40,
    },
    // ── 배너 슬라이더 ──────────────────────────────
    bannerContainer: {
        position: 'relative',
        backgroundColor: '#1A1A2E',
    },
    bannerSlide: {
        width: SCREEN_WIDTH,
        height: 220,
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 60,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    bannerBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(91,103,202,0.85)',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 6,
    },
    bannerBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    bannerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
        marginBottom: 4,
    },
    bannerDate: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 13,
        fontWeight: '500',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    dotRow: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.45)',
    },
    dotActive: {
        width: 18,
        backgroundColor: '#FFFFFF',
    },
    // ──────────────────────────────────────────────
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#888',
    },
    scheduleCard: {
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#5B67CA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    scheduleCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    scheduleCardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2B2B2B',
        flex: 1,
    },
    scheduleCardArrow: {
        fontSize: 24,
        color: '#5B67CA',
        fontWeight: '300',
    },
    scheduleCardDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    scheduleCardFooter: {
        flexDirection: 'row',
        gap: 16,
    },
    scheduleCardInfo: {
        fontSize: 13,
        color: '#888',
    },
    deleteIconButton: {
        padding: 5,
        marginHorizontal: 8,
    },
    deleteIconText: {
        fontSize: 16,
    },
    regionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pinIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        marginRight: 4,
    },
});

export default ScheduleScreen;

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getTripDetail, TripDetail, ItineraryItem } from '../../services/api';
import MapScreen from '../Explore/MapScreen';

// Internal interface for MapScreen compatibility
interface MapMarker {
    id: number;
    day: number;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
    note?: string;
}

interface ScheduleDetailScreenProps {
    schedule?: TripDetail; // Updated to TripDetail
    tripId?: number;
    tripTitle?: string;
    onBack: () => void;
    onNavigateToChat?: (id: number, title: string) => void;
}

function ScheduleDetailScreen({ schedule: initialSchedule, tripId, tripTitle, onBack, onNavigateToChat }: ScheduleDetailScreenProps) {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const [schedule, setSchedule] = useState<TripDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        if (initialSchedule) {
            // Convert initialSchedule (mock) if needed, but for now let's just use it
            // setSchedule(initialSchedule as any);
            setLoading(false);
            return;
        }

        const fetchDetail = async () => {
            if (!token || !tripId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const detail = await getTripDetail(token, tripId);
                setSchedule(detail);
            } catch (err) {
                console.error('Error fetching trip detail:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [initialSchedule, tripId, token]);

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#5B67CA" />
                <Text style={{ marginTop: 12, color: '#666' }}>일정을 불러오는 중...</Text>
                <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#5B67CA' }}>뒤로가기</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!schedule) {
        return (
            <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
                <Text style={{ color: '#666' }}>일정을 찾을 수 없습니다.</Text>
                <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#5B67CA' }}>뒤로가기</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Map backend itinerary to UI schedule items (compatible with old MapScreen)
    const scheduleItems = schedule.itineraries.map(it => ({
        id: it.id,
        trip_id: schedule.id,
        day_number: it.day_number,
        place: it.place.name,
        latitude: it.place.latitude,
        longitude: it.place.longitude,
        arrival_time: it.arrival_time?.substring(0, 5) || '미정',
        memo: it.memo || undefined,
        order_index: it.order_index
    }));

    // 일정을 날짜별로 그룹화
    const groupedItems = schedule.itineraries.reduce((acc, item) => {
        if (!acc[item.day_number]) {
            acc[item.day_number] = [];
        }
        acc[item.day_number].push(item);
        return acc;
    }, {} as Record<number, ItineraryItem[]>);

    if (showMap) {
        return (
            <MapScreen
                scheduleItems={scheduleItems as any}
                onBack={() => setShowMap(false)}
            />
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>일정 상세</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 일정 정보 */}
                <View style={styles.infoSection}>
                    <Text style={styles.tripTitle}>{schedule.title}</Text>
                    <Text style={styles.tripDate}>
                        {schedule.start_date} ~ {schedule.end_date}
                    </Text>
                    <Text style={styles.tripInfo}>
                        총 {schedule.itineraries.length}개 장소
                    </Text>
                </View>

                {/* 지도에서 보기 버튼 */}
                <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => setShowMap(true)}
                >
                    <Text style={styles.mapButtonIcon}>🗺️</Text>
                    <Text style={styles.mapButtonText}>지도에서 전체 일정 보기</Text>
                </TouchableOpacity>

                {/* AI 수정 버튼 (New) */}
                <TouchableOpacity
                    style={styles.aiButton}
                    onPress={() => onNavigateToChat?.(tripId || schedule.id, tripTitle || schedule.title)}
                >
                    <Text style={styles.aiButtonIcon}>🤖</Text>
                    <Text style={styles.aiButtonText}>AI에게 일정 수정 부탁하기 (채팅)</Text>
                </TouchableOpacity>

                {/* 일정 목록 */}
                {Object.entries(groupedItems).map(([day, items]) => (
                    <View key={day} style={styles.daySection}>
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayLabel}>Day {day}</Text>
                        </View>
                        {items.map((item) => (
                            <View key={item.id} style={styles.scheduleItem}>
                                <View style={styles.scheduleTime}>
                                    <Text style={styles.scheduleTimeText}>
                                        {item.arrival_time?.substring(0, 5) || '미정'}
                                    </Text>
                                </View>
                                <View style={styles.scheduleContent}>
                                    <Text style={styles.schedulePlace}>
                                        📍 {item.place.name}
                                    </Text>
                                    {item.memo ? (
                                        <Text style={styles.scheduleNote}>
                                            {item.memo}
                                        </Text>
                                    ) : null}
                                </View>
                            </View>
                        ))}
                    </View>
                ))}

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
    center: {
        justifyContent: 'center',
        alignItems: 'center',
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
    infoSection: {
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    tripTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 8,
    },
    tripDate: {
        fontSize: 15,
        color: '#666',
        marginBottom: 4,
    },
    tripInfo: {
        fontSize: 14,
        color: '#888',
    },
    mapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#5B67CA',
        borderRadius: 12,
        paddingVertical: 16,
        marginBottom: 24,
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    mapButtonIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    mapButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    daySection: {
        marginBottom: 24,
    },
    dayHeader: {
        backgroundColor: '#5B67CA',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    dayLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#5B67CA',
    },
    scheduleTime: {
        width: 60,
        paddingTop: 2,
    },
    scheduleTimeText: {
        fontSize: 13,
        color: '#5B67CA',
        fontWeight: '600',
    },
    scheduleContent: {
        flex: 1,
    },
    schedulePlace: {
        fontSize: 15,
        color: '#2B2B2B',
        fontWeight: '500',
        marginBottom: 4,
    },
    scheduleNote: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
    },
    aiButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#5B67CA',
        borderRadius: 12,
        paddingVertical: 18,
        marginBottom: 24,
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    aiButtonIcon: {
        fontSize: 22,
        marginRight: 10,
    },
    aiButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default ScheduleDetailScreen;

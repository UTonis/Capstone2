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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getMyTrips, deleteTrip, TripSummary } from '../../services/api';
import ScheduleDetailScreen from './ScheduleDetailScreen';

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
    const { token } = useAuth();
    const [savedTrips, setSavedTrips] = useState<TripSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

    useEffect(() => {
        if (token) {
            fetchTrips();
        }
    }, [token]);

    const fetchTrips = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const trips = await getMyTrips(token);
            setSavedTrips(trips);
        } catch (err) {
            console.error('Error fetching trips:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrip = (id: number, title: string) => {
        Alert.alert(
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
                            Alert.alert('알림', '일정이 삭제되었습니다.');
                        } catch (err) {
                            console.error('Error deleting trip:', err);
                            Alert.alert('오류', '일정 삭제에 실패했습니다.');
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
                    <Text style={styles.backButtonText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>여행 일정</Text>
                <View style={styles.headerPlaceholder} />
            </View>


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
                                    <Text style={styles.scheduleCardInfo}>
                                        📍 {schedule.itinerary_count}개 장소
                                    </Text>
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
});

export default ScheduleScreen;

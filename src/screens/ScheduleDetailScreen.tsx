import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TravelSchedule } from '../data/mockData';
import MapScreen from './MapScreen';

interface ScheduleDetailScreenProps {
    schedule: TravelSchedule;
    onBack: () => void;
}

function ScheduleDetailScreen({ schedule, onBack }: ScheduleDetailScreenProps) {
    const insets = useSafeAreaInsets();
    const [showMap, setShowMap] = useState(false);

    // 일정을 날짜별로 그룹화
    const groupedItems = schedule.items.reduce((acc, item) => {
        if (!acc[item.day]) {
            acc[item.day] = [];
        }
        acc[item.day].push(item);
        return acc;
    }, {} as Record<number, typeof schedule.items>);

    if (showMap) {
        return (
            <MapScreen
                scheduleItems={schedule.items}
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
                        {schedule.startDate} ~ {schedule.endDate}
                    </Text>
                    <Text style={styles.tripInfo}>
                        총 {schedule.items.length}개 장소
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
                                        {item.time}
                                    </Text>
                                </View>
                                <View style={styles.scheduleContent}>
                                    <Text style={styles.schedulePlace}>
                                        📍 {item.place}
                                    </Text>
                                    {item.note ? (
                                        <Text style={styles.scheduleNote}>
                                            {item.note}
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
});

export default ScheduleDetailScreen;

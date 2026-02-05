/**
 * Schedule Screen - 여행 일정 생성 화면
 * 날짜와 장소를 입력하여 일정표 생성
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScheduleScreenProps {
    onBack: () => void;
}

interface ScheduleItem {
    id: number;
    day: number;
    time: string;
    place: string;
    note: string;
}

function ScheduleScreen({ onBack }: ScheduleScreenProps) {
    const insets = useSafeAreaInsets();
    const [tripName, setTripName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [nextId, setNextId] = useState(1);

    // 새 일정 입력용 상태
    const [newDay, setNewDay] = useState('1');
    const [newTime, setNewTime] = useState('');
    const [newPlace, setNewPlace] = useState('');
    const [newNote, setNewNote] = useState('');

    const handleAddSchedule = () => {
        if (!newPlace.trim()) {
            Alert.alert('알림', '장소를 입력해주세요.');
            return;
        }

        const newItem: ScheduleItem = {
            id: nextId,
            day: parseInt(newDay, 10) || 1,
            time: newTime.trim() || '미정',
            place: newPlace.trim(),
            note: newNote.trim(),
        };

        setSchedules([...schedules, newItem].sort((a, b) => {
            if (a.day !== b.day) return a.day - b.day;
            return a.time.localeCompare(b.time);
        }));
        setNextId(nextId + 1);
        setNewPlace('');
        setNewTime('');
        setNewNote('');
    };

    const handleRemoveSchedule = (id: number) => {
        setSchedules(schedules.filter(item => item.id !== id));
    };

    const handleSaveSchedule = () => {
        if (!tripName.trim()) {
            Alert.alert('알림', '여행 이름을 입력해주세요.');
            return;
        }
        if (schedules.length === 0) {
            Alert.alert('알림', '일정을 하나 이상 추가해주세요.');
            return;
        }
        Alert.alert('저장 완료', `"${tripName}" 일정이 저장되었습니다.\n(데모 기능)`);
    };

    // 일정을 날짜별로 그룹화
    const groupedSchedules = schedules.reduce((acc, item) => {
        if (!acc[item.day]) {
            acc[item.day] = [];
        }
        acc[item.day].push(item);
        return acc;
    }, {} as Record<number, ScheduleItem[]>);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>여행 일정 생성</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 여행 기본 정보 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>여행 정보</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="여행 이름 (예: 제주도 힐링 여행)"
                        placeholderTextColor="#999"
                        value={tripName}
                        onChangeText={setTripName}
                    />
                    <View style={styles.dateRow}>
                        <TextInput
                            style={[styles.input, styles.dateInput]}
                            placeholder="시작일 (예: 2025-01-25)"
                            placeholderTextColor="#999"
                            value={startDate}
                            onChangeText={setStartDate}
                        />
                        <Text style={styles.dateSeparator}>~</Text>
                        <TextInput
                            style={[styles.input, styles.dateInput]}
                            placeholder="종료일 (예: 2025-01-27)"
                            placeholderTextColor="#999"
                            value={endDate}
                            onChangeText={setEndDate}
                        />
                    </View>
                </View>

                {/* 일정 추가 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>일정 추가</Text>
                    <View style={styles.addRow}>
                        <TextInput
                            style={[styles.input, styles.dayInput]}
                            placeholder="Day"
                            placeholderTextColor="#999"
                            value={newDay}
                            onChangeText={setNewDay}
                            keyboardType="number-pad"
                        />
                        <TextInput
                            style={[styles.input, styles.timeInput]}
                            placeholder="시간 (예: 10:00)"
                            placeholderTextColor="#999"
                            value={newTime}
                            onChangeText={setNewTime}
                        />
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="장소 (예: 성산일출봉)"
                        placeholderTextColor="#999"
                        value={newPlace}
                        onChangeText={setNewPlace}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="메모 (선택사항)"
                        placeholderTextColor="#999"
                        value={newNote}
                        onChangeText={setNewNote}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddSchedule}>
                        <Text style={styles.addButtonText}>일정 추가</Text>
                    </TouchableOpacity>
                </View>

                {/* 일정 목록 */}
                {schedules.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            일정표 ({schedules.length}개)
                        </Text>
                        {Object.entries(groupedSchedules).map(([day, items]) => (
                            <View key={day} style={styles.dayGroup}>
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
                                                {item.place}
                                            </Text>
                                            {item.note ? (
                                                <Text style={styles.scheduleNote}>
                                                    {item.note}
                                                </Text>
                                            ) : null}
                                        </View>
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => handleRemoveSchedule(item.id)}
                                        >
                                            <Text style={styles.removeButtonText}>X</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                )}

                {/* 저장 버튼 */}
                {schedules.length > 0 && (
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveSchedule}>
                        <Text style={styles.saveButtonText}>일정 저장하기</Text>
                    </TouchableOpacity>
                )}

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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 12,
    },
    input: {
        height: 48,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateInput: {
        flex: 1,
    },
    dateSeparator: {
        marginHorizontal: 8,
        fontSize: 16,
        color: '#888',
    },
    addRow: {
        flexDirection: 'row',
    },
    dayInput: {
        width: 70,
        marginRight: 10,
    },
    timeInput: {
        flex: 1,
    },
    addButton: {
        backgroundColor: '#5B67CA',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    dayGroup: {
        marginBottom: 16,
    },
    dayHeader: {
        backgroundColor: '#5B67CA',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    dayLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    scheduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#5B67CA',
    },
    scheduleTime: {
        width: 60,
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
    },
    scheduleNote: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    removeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: '#666',
        fontSize: 12,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#5B67CA',
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ScheduleScreen;

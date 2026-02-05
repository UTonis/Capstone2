/**
 * Recommend Screen - 축제 정보 화면
 * 필터 아이콘을 통한 날짜/지역 필터 설정
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 필터 아이콘
const FilterIcon = require('../data/Filter.webp');

interface RecommendScreenProps {
    onBack: () => void;
}

// 지역(시) 데이터
const regions = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '수원', '전주', '청주', '춘천', '제주'];

// 년도 데이터
const years = [2024, 2025, 2026, 2027, 2028];

// 월 데이터
const monthNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// 일 데이터
const dayNumbers = Array.from({ length: 31 }, (_, i) => i + 1);

// 축제 데이터 (목업)
interface Festival {
    id: number;
    name: string;
    region: string;
    startDate: string;
    endDate: string;
    month: number;
    day: number;
    description: string;
    image: string;
}

const festivalData: Festival[] = [
    { id: 1, name: '서울빛초롱축제', region: '서울', startDate: '2026-11-01', endDate: '2026-11-17', month: 11, day: 1, description: '청계천에서 펼쳐지는 빛의 향연', image: 'https://picsum.photos/400/200?random=50' },
    { id: 2, name: '부산불꽃축제', region: '부산', startDate: '2026-10-26', endDate: '2026-10-26', month: 10, day: 26, description: '광안리 해변의 화려한 불꽃놀이', image: 'https://picsum.photos/400/200?random=51' },
    { id: 3, name: '진해군항제', region: '부산', startDate: '2026-04-01', endDate: '2026-04-10', month: 4, day: 1, description: '벚꽃과 함께하는 군항의 봄', image: 'https://picsum.photos/400/200?random=52' },
    { id: 4, name: '대구치맥페스티벌', region: '대구', startDate: '2026-07-15', endDate: '2026-07-20', month: 7, day: 15, description: '치킨과 맥주의 환상적인 만남', image: 'https://picsum.photos/400/200?random=53' },
    { id: 5, name: '인천펜타포트락페스티벌', region: '인천', startDate: '2026-08-08', endDate: '2026-08-10', month: 8, day: 8, description: '국내 최대 규모 록 페스티벌', image: 'https://picsum.photos/400/200?random=54' },
    { id: 6, name: '광주비엔날레', region: '광주', startDate: '2026-09-01', endDate: '2026-11-30', month: 9, day: 1, description: '현대미술의 최전선을 만나다', image: 'https://picsum.photos/400/200?random=55' },
    { id: 7, name: '대전사이언스페스티벌', region: '대전', startDate: '2026-10-01', endDate: '2026-10-07', month: 10, day: 1, description: '과학과 기술의 축제', image: 'https://picsum.photos/400/200?random=56' },
    { id: 8, name: '울산고래축제', region: '울산', startDate: '2026-05-20', endDate: '2026-05-25', month: 5, day: 20, description: '고래와 함께하는 바다 축제', image: 'https://picsum.photos/400/200?random=57' },
    { id: 9, name: '수원화성문화제', region: '수원', startDate: '2026-10-04', endDate: '2026-10-06', month: 10, day: 4, description: '정조대왕의 효심을 기리는 축제', image: 'https://picsum.photos/400/200?random=58' },
    { id: 10, name: '전주비빔밥축제', region: '전주', startDate: '2026-10-15', endDate: '2026-10-18', month: 10, day: 15, description: '한식의 정수, 비빔밥의 모든 것', image: 'https://picsum.photos/400/200?random=59' },
    { id: 11, name: '청주직지축제', region: '청주', startDate: '2026-09-15', endDate: '2026-09-22', month: 9, day: 15, description: '세계 최초 금속활자본의 역사', image: 'https://picsum.photos/400/200?random=60' },
    { id: 12, name: '춘천마임축제', region: '춘천', startDate: '2026-05-25', endDate: '2026-05-31', month: 5, day: 25, description: '세계적인 마임 공연 축제', image: 'https://picsum.photos/400/200?random=61' },
    { id: 13, name: '제주들불축제', region: '제주', startDate: '2026-03-01', endDate: '2026-03-03', month: 3, day: 1, description: '제주의 봄을 알리는 불꽃 축제', image: 'https://picsum.photos/400/200?random=62' },
    { id: 14, name: '서울재즈페스티벌', region: '서울', startDate: '2026-05-24', endDate: '2026-05-26', month: 5, day: 24, description: '아시아 최대 재즈 페스티벌', image: 'https://picsum.photos/400/200?random=63' },
    { id: 15, name: '부산국제영화제', region: '부산', startDate: '2026-10-02', endDate: '2026-10-11', month: 10, day: 2, description: '아시아 최고의 영화 축제', image: 'https://picsum.photos/400/200?random=64' },
];

const ITEM_HEIGHT = 36;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// 휠 피커 컴포넌트
function WheelPicker<T>({
    items,
    selectedIndex,
    onSelect,
    renderItem,
}: {
    items: T[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    renderItem: (item: T, isSelected: boolean) => string;
}) {
    const scrollRef = useRef<ScrollView>(null);

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
        onSelect(clampedIndex);
    };

    useEffect(() => {
        scrollRef.current?.scrollTo({
            y: selectedIndex * ITEM_HEIGHT,
            animated: false,
        });
    }, []);

    return (
        <View style={styles.wheelWrapper}>
            <View style={styles.wheelHighlight} />
            <ScrollView
                ref={scrollRef}
                style={styles.wheel}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleScroll}
                contentContainerStyle={{
                    paddingVertical: ITEM_HEIGHT,
                }}
            >
                {items.map((item, index) => (
                    <View key={index} style={styles.wheelItem}>
                        <Text
                            style={[
                                styles.wheelItemText,
                                selectedIndex === index && styles.wheelItemTextSelected,
                            ]}
                        >
                            {renderItem(item, selectedIndex === index)}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

function RecommendScreen({ onBack }: RecommendScreenProps) {
    const insets = useSafeAreaInsets();

    // 현재 날짜
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // 적용된 필터 상태
    const [appliedRegions, setAppliedRegions] = useState<string[]>([]);
    const [appliedStartDate, setAppliedStartDate] = useState({ year: currentYear, month: currentMonth, day: currentDay });
    const [appliedEndDate, setAppliedEndDate] = useState({ year: currentYear, month: 12, day: 31 });
    const [hasFilter, setHasFilter] = useState<boolean>(false);

    // 모달 내 임시 필터 상태
    const [tempRegions, setTempRegions] = useState<string[]>([]);
    const [tempStartYear, setTempStartYear] = useState<number>(years.indexOf(currentYear));
    const [tempStartMonth, setTempStartMonth] = useState<number>(currentMonth - 1);
    const [tempStartDay, setTempStartDay] = useState<number>(currentDay - 1);
    const [tempEndYear, setTempEndYear] = useState<number>(years.indexOf(currentYear));
    const [tempEndMonth, setTempEndMonth] = useState<number>(11);
    const [tempEndDay, setTempEndDay] = useState<number>(30);

    // 모달 표시 상태
    const [showFilterModal, setShowFilterModal] = useState(false);

    // 지역 토글
    const toggleRegion = (region: string) => {
        if (region === '전체') {
            // 전체 선택 시 다른 지역 해제
            setTempRegions(['전체']);
        } else {
            // 다른 지역 선택 시 전체 해제
            setTempRegions(prev => {
                const withoutAll = prev.filter(r => r !== '전체');
                if (withoutAll.includes(region)) {
                    return withoutAll.filter(r => r !== region);
                } else {
                    return [...withoutAll, region];
                }
            });
        }
    };

    // 필터링된 축제 목록
    const filteredFestivals = useMemo(() => {
        return festivalData.filter((festival) => {
            const regionMatch = appliedRegions.length === 0 || appliedRegions.includes('전체') || appliedRegions.includes(festival.region);
            return regionMatch;
        });
    }, [appliedRegions]);

    // 필터 모달 열기
    const openFilterModal = () => {
        setTempRegions([...appliedRegions]);
        setTempStartYear(years.indexOf(appliedStartDate.year));
        setTempStartMonth(appliedStartDate.month - 1);
        setTempStartDay(appliedStartDate.day - 1);
        setTempEndYear(years.indexOf(appliedEndDate.year));
        setTempEndMonth(appliedEndDate.month - 1);
        setTempEndDay(appliedEndDate.day - 1);
        setShowFilterModal(true);
    };

    // 필터 적용
    const applyFilters = () => {
        setAppliedRegions([...tempRegions]);
        setAppliedStartDate({
            year: years[tempStartYear],
            month: tempStartMonth + 1,
            day: tempStartDay + 1,
        });
        setAppliedEndDate({
            year: years[tempEndYear],
            month: tempEndMonth + 1,
            day: tempEndDay + 1,
        });
        setHasFilter(true);
        setShowFilterModal(false);
    };

    // 필터 초기화
    const resetFilters = () => {
        setTempRegions(['전체']);
        setTempStartYear(years.indexOf(currentYear));
        setTempStartMonth(currentMonth - 1);
        setTempStartDay(currentDay - 1);
        setTempEndYear(years.indexOf(currentYear));
        setTempEndMonth(11);
        setTempEndDay(30);
    };

    // 적용된 필터 태그 생성
    const getAppliedFilterTags = () => {
        const tags: string[] = [];
        if (hasFilter) {
            tags.push(`${appliedStartDate.year}.${appliedStartDate.month}.${appliedStartDate.day}~${appliedEndDate.year}.${appliedEndDate.month}.${appliedEndDate.day}`);
        }
        if (appliedRegions.length > 0) {
            tags.push(...appliedRegions);
        }
        return tags;
    };

    const appliedTags = getAppliedFilterTags();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>축제 정보</Text>
            </View>

            {/* 필터 아이콘 및 적용된 필터 표시 */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={styles.filterIconButton}
                    onPress={openFilterModal}
                >
                    <Image source={FilterIcon} style={styles.filterIcon} resizeMode="contain" />
                </TouchableOpacity>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterTagsContainer}
                    contentContainerStyle={styles.filterTagsContent}
                >
                    {appliedTags.length > 0 ? (
                        appliedTags.map((tag, index) => (
                            <View key={index} style={styles.filterTag}>
                                <Text style={styles.filterTagText}>{tag}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noFilterText}>필터 없음</Text>
                    )}
                </ScrollView>
            </View>

            {/* 결과 카운트 */}
            <View style={styles.resultCount}>
                <Text style={styles.resultCountText}>
                    총 <Text style={styles.resultCountNumber}>{filteredFestivals.length}</Text>개의 축제
                </Text>
            </View>

            {/* 축제 리스트 */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {filteredFestivals.length > 0 ? (
                    filteredFestivals.map((festival) => (
                        <TouchableOpacity key={festival.id} style={styles.festivalCard}>
                            <Image source={{ uri: festival.image }} style={styles.festivalImage} resizeMode="cover" />
                            <View style={styles.festivalContent}>
                                <View style={styles.festivalHeader}>
                                    <Text style={styles.festivalName}>{festival.name}</Text>
                                    <View style={styles.regionBadge}>
                                        <Text style={styles.regionBadgeText}>{festival.region}</Text>
                                    </View>
                                </View>
                                <Text style={styles.festivalDate}>📅 {festival.startDate} ~ {festival.endDate}</Text>
                                <Text style={styles.festivalDescription}>{festival.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateEmoji}>🎭</Text>
                        <Text style={styles.emptyStateText}>선택한 조건에 맞는 축제가 없습니다.</Text>
                    </View>
                )}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* 필터 모달 (중앙) */}
            <Modal visible={showFilterModal} transparent animationType="fade" onRequestClose={() => setShowFilterModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Text style={styles.modalCancel}>취소</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>필터 설정</Text>
                            <TouchableOpacity onPress={resetFilters}>
                                <Text style={styles.modalReset}>초기화</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {/* 시작 날짜 */}
                            <View style={styles.dateSection}>
                                <Text style={styles.sectionTitle}>📅 시작 날짜</Text>
                                <View style={styles.datePickerContainer}>
                                    <View style={styles.datePickerRow}>
                                        <WheelPicker items={years} selectedIndex={tempStartYear} onSelect={setTempStartYear} renderItem={(y) => `${y}년`} />
                                        <WheelPicker items={monthNumbers} selectedIndex={tempStartMonth} onSelect={setTempStartMonth} renderItem={(m) => `${m}월`} />
                                        <WheelPicker items={dayNumbers} selectedIndex={tempStartDay} onSelect={setTempStartDay} renderItem={(d) => `${d}일`} />
                                    </View>
                                </View>
                            </View>

                            {/* 종료 날짜 */}
                            <View style={styles.dateSection}>
                                <Text style={styles.sectionTitle}>📅 종료 날짜</Text>
                                <View style={styles.datePickerContainer}>
                                    <View style={styles.datePickerRow}>
                                        <WheelPicker items={years} selectedIndex={tempEndYear} onSelect={setTempEndYear} renderItem={(y) => `${y}년`} />
                                        <WheelPicker items={monthNumbers} selectedIndex={tempEndMonth} onSelect={setTempEndMonth} renderItem={(m) => `${m}월`} />
                                        <WheelPicker items={dayNumbers} selectedIndex={tempEndDay} onSelect={setTempEndDay} renderItem={(d) => `${d}일`} />
                                    </View>
                                </View>
                            </View>

                            {/* 지역 */}
                            <View style={styles.dateSection}>
                                <Text style={styles.sectionTitle}>📍 지역</Text>
                                <View style={styles.regionTagsContainer}>
                                    {regions.map((region) => (
                                        <TouchableOpacity
                                            key={region}
                                            style={[
                                                styles.regionTag,
                                                tempRegions.includes(region) && styles.regionTagActive,
                                            ]}
                                            onPress={() => toggleRegion(region)}
                                        >
                                            <Text
                                                style={[
                                                    styles.regionTagText,
                                                    tempRegions.includes(region) && styles.regionTagTextActive,
                                                ]}
                                            >
                                                {region}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                            <Text style={styles.applyButtonText}>완료</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#2B2B2B' },
    filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    filterIconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12 },
    filterIcon: { width: 24, height: 24 },
    filterTagsContainer: { flex: 1, marginLeft: 12 },
    filterTagsContent: { alignItems: 'center' },
    filterTag: { backgroundColor: '#5B67CA', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, marginRight: 8 },
    filterTagText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
    noFilterText: { fontSize: 14, color: '#999' },
    resultCount: { paddingHorizontal: 16, paddingVertical: 10 },
    resultCountText: { fontSize: 13, color: '#888' },
    resultCountNumber: { fontWeight: '700', color: '#5B67CA' },
    scrollView: { flex: 1, paddingHorizontal: 16 },
    festivalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    festivalImage: { width: '100%', height: 140, backgroundColor: '#F0F0F0' },
    festivalContent: { padding: 16 },
    festivalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    festivalName: { flex: 1, fontSize: 17, fontWeight: '700', color: '#2B2B2B' },
    regionBadge: { backgroundColor: '#5B67CA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
    regionBadgeText: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
    festivalDate: { fontSize: 13, color: '#666', marginBottom: 6 },
    festivalDescription: { fontSize: 14, color: '#888', lineHeight: 20 },
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyStateEmoji: { fontSize: 48, marginBottom: 16 },
    emptyStateText: { fontSize: 16, fontWeight: '600', color: '#2B2B2B' },
    // 모달
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 340, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalCancel: { fontSize: 15, color: '#888' },
    modalTitle: { fontSize: 17, fontWeight: '700', color: '#2B2B2B' },
    modalReset: { fontSize: 15, color: '#5B67CA' },
    modalBody: { paddingBottom: 10 },
    dateSection: { paddingHorizontal: 16, paddingTop: 14 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#2B2B2B', marginBottom: 8 },
    datePickerContainer: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 8, overflow: 'hidden' },
    datePickerRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
    // 휠
    wheelWrapper: { height: PICKER_HEIGHT, width: 68, overflow: 'hidden', borderRadius: 8, backgroundColor: 'transparent' },
    wheelHighlight: { position: 'absolute', top: ITEM_HEIGHT, left: 0, right: 0, height: ITEM_HEIGHT, backgroundColor: '#E8EBFF', borderRadius: 6 },
    wheel: { flex: 1 },
    wheelItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
    wheelItemText: { fontSize: 14, color: '#999' },
    wheelItemTextSelected: { fontSize: 16, fontWeight: '700', color: '#5B67CA' },
    // 지역 태그
    regionTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    regionTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F5F5F5' },
    regionTagActive: { backgroundColor: '#5B67CA' },
    regionTagText: { fontSize: 14, color: '#666' },
    regionTagTextActive: { color: '#FFFFFF', fontWeight: '600' },
    applyButton: { marginHorizontal: 16, marginVertical: 16, backgroundColor: '#5B67CA', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    applyButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default RecommendScreen;

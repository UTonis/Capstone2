/**
 * Recommend Screen - 축제 정보 화면
 * 필터 아이콘을 통한 날짜/지역 필터 설정
 * /festivals/search API 연동
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchFestivals, SearchFestivalInfo } from '../services/api';
import { Festival } from '../data/mockData';
import FestivalDetailModal from '../components/FestivalDetailModal';

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

// 해당 월의 마지막 날짜 구하기
function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

// 날짜 포맷 헬퍼 (day를 해당 월 범위로 자동 보정)
function formatDateStr(year: number, month: number, day: number): string {
    const maxDay = getDaysInMonth(year, month);
    const safeDay = Math.min(day, maxDay);
    return `${year}-${String(month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}

function formatApiDate(dateStr: string | null): string {
    if (!dateStr || dateStr.length !== 8) return '';
    return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
}

// API 축제 → FestivalDetailModal용 Festival 변환
function toModalFestival(f: SearchFestivalInfo): Festival {
    return {
        id: f.id,
        name: f.title,
        location: f.address || f.region || '',
        date: `${formatApiDate(f.event_start_date)} ~ ${formatApiDate(f.event_end_date)}`,
        month: f.event_start_date ? parseInt(f.event_start_date.slice(4, 6), 10) : 0,
        image: f.image_url || 'https://picsum.photos/400/200?random=' + f.id,
        description: f.description || '',
        rating: 0,
    };
}

function RecommendScreen({ onBack }: RecommendScreenProps) {
    const insets = useSafeAreaInsets();

    // 현재 날짜
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    // 1달 후 계산
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const endYear = oneMonthLater.getFullYear();
    const endMonth = oneMonthLater.getMonth() + 1;
    const endDay = oneMonthLater.getDate();

    // 적용된 필터 상태 (초기값: 오늘~1달 후, 전체 지역)
    const [appliedRegions, setAppliedRegions] = useState<string[]>(['전체']);
    const [appliedStartDate, setAppliedStartDate] = useState({ year: currentYear, month: currentMonth, day: currentDay });
    const [appliedEndDate, setAppliedEndDate] = useState({ year: endYear, month: endMonth, day: endDay });

    // 모달 내 임시 필터 상태
    const [tempRegions, setTempRegions] = useState<string[]>(['전체']);
    const [tempStartYear, setTempStartYear] = useState<number>(years.indexOf(currentYear));
    const [tempStartMonth, setTempStartMonth] = useState<number>(currentMonth - 1);
    const [tempStartDay, setTempStartDay] = useState<number>(currentDay - 1);
    const [tempEndYear, setTempEndYear] = useState<number>(years.indexOf(endYear));
    const [tempEndMonth, setTempEndMonth] = useState<number>(endMonth - 1);
    const [tempEndDay, setTempEndDay] = useState<number>(endDay - 1);

    // 모달 표시 상태
    const [showFilterModal, setShowFilterModal] = useState(false);

    // API 결과 상태
    const [festivals, setFestivals] = useState<SearchFestivalInfo[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 축제 상세 모달 상태
    const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // API 호출 함수
    const doSearch = useCallback(async (
        regionList: string[],
        startDate: { year: number; month: number; day: number },
        endDate: { year: number; month: number; day: number },
    ) => {
        try {
            setLoading(true);
            setError(null);

            const region = regionList.length === 0 || regionList.includes('전체')
                ? undefined
                : regionList[0]; // API는 단일 지역만 지원

            const result = await searchFestivals({
                region,
                start_date: formatDateStr(startDate.year, startDate.month, startDate.day),
                end_date: formatDateStr(endDate.year, endDate.month, endDate.day),
                max_items: 50,
            });

            setFestivals(result.festivals);
            setTotalCount(result.total_count);
        } catch (err: any) {
            setError(err.message || '축제 검색에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    // 초기 로드: 오늘~1달, 전체 지역
    useEffect(() => {
        doSearch(appliedRegions, appliedStartDate, appliedEndDate);
    }, []);

    // 지역 토글
    const toggleRegion = (region: string) => {
        if (region === '전체') {
            setTempRegions(['전체']);
        } else {
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

    // 필터 적용 → API 호출
    const applyFilters = () => {
        const startYear = years[tempStartYear];
        const startMonth = tempStartMonth + 1;
        const startDay = Math.min(tempStartDay + 1, getDaysInMonth(startYear, startMonth));
        const endYear = years[tempEndYear];
        const endMonthVal = tempEndMonth + 1;
        const endDayVal = Math.min(tempEndDay + 1, getDaysInMonth(endYear, endMonthVal));
        const newStart = { year: startYear, month: startMonth, day: startDay };
        const newEnd = { year: endYear, month: endMonthVal, day: endDayVal };
        const newRegions = tempRegions.length === 0 ? ['전체'] : [...tempRegions];

        setAppliedRegions(newRegions);
        setAppliedStartDate(newStart);
        setAppliedEndDate(newEnd);
        setShowFilterModal(false);

        // API 호출
        doSearch(newRegions, newStart, newEnd);
    };

    // 필터 초기화
    const resetFilters = () => {
        setTempRegions(['전체']);
        setTempStartYear(years.indexOf(currentYear));
        setTempStartMonth(currentMonth - 1);
        setTempStartDay(currentDay - 1);
        setTempEndYear(years.indexOf(endYear));
        setTempEndMonth(endMonth - 1);
        setTempEndDay(endDay - 1);
    };

    // 적용된 필터 태그 생성
    const getAppliedFilterTags = () => {
        const tags: string[] = [];
        tags.push(`${appliedStartDate.year}.${appliedStartDate.month}.${appliedStartDate.day}~${appliedEndDate.year}.${appliedEndDate.month}.${appliedEndDate.day}`);
        if (appliedRegions.length > 0) {
            tags.push(...appliedRegions);
        }
        return tags;
    };

    const openDetail = (f: SearchFestivalInfo) => {
        setSelectedFestival(toModalFestival(f));
        setShowDetailModal(true);
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
                    {appliedTags.map((tag, index) => (
                        <View key={index} style={styles.filterTag}>
                            <Text style={styles.filterTagText}>{tag}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* 결과 카운트 */}
            <View style={styles.resultCount}>
                <Text style={styles.resultCountText}>
                    총 <Text style={styles.resultCountNumber}>{totalCount}</Text>개의 축제
                </Text>
            </View>

            {/* 축제 리스트 */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#5B67CA" />
                    <Text style={styles.loadingText}>축제를 검색하는 중...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorEmoji}>⚠️</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => doSearch(appliedRegions, appliedStartDate, appliedEndDate)}
                    >
                        <Text style={styles.retryButtonText}>다시 시도</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {festivals.length > 0 ? (
                        festivals.map((festival) => (
                            <TouchableOpacity
                                key={festival.id}
                                style={styles.festivalCard}
                                onPress={() => openDetail(festival)}
                            >
                                <Image
                                    source={{ uri: festival.image_url || `https://picsum.photos/400/200?random=${festival.id}` }}
                                    style={styles.festivalImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.festivalContent}>
                                    <View style={styles.festivalHeader}>
                                        <Text style={styles.festivalName} numberOfLines={1}>{festival.title}</Text>
                                        {festival.region && (
                                            <View style={styles.regionBadge}>
                                                <Text style={styles.regionBadgeText}>{festival.region}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.festivalDate}>
                                        📅 {formatApiDate(festival.event_start_date)} ~ {formatApiDate(festival.event_end_date)}
                                    </Text>
                                    {/* 상태 배지 */}
                                    <View style={styles.statusRow}>
                                        {festival.is_ongoing && (
                                            <View style={[styles.statusBadge, styles.ongoingBadge]}>
                                                <Text style={styles.statusBadgeText}>진행중</Text>
                                            </View>
                                        )}
                                        {festival.is_upcoming && festival.days_until_start != null && (
                                            <View style={[styles.statusBadge, styles.upcomingBadge]}>
                                                <Text style={styles.statusBadgeText}>D-{festival.days_until_start}</Text>
                                            </View>
                                        )}
                                        {!festival.is_ongoing && !festival.is_upcoming && (
                                            <View style={[styles.statusBadge, styles.endedBadge]}>
                                                <Text style={[styles.statusBadgeText, { color: '#999' }]}>종료</Text>
                                            </View>
                                        )}
                                    </View>
                                    {festival.address && (
                                        <Text style={styles.festivalAddress} numberOfLines={1}>📍 {festival.address}</Text>
                                    )}
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
            )}

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

            {/* 축제 상세 모달 */}
            <FestivalDetailModal
                visible={showDetailModal}
                festival={selectedFestival}
                onClose={() => setShowDetailModal(false)}
            />
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
    resultCount: { paddingHorizontal: 16, paddingVertical: 10 },
    resultCountText: { fontSize: 13, color: '#888' },
    resultCountNumber: { fontWeight: '700', color: '#5B67CA' },
    // 로딩 / 에러
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 14, color: '#888', marginTop: 12 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    errorEmoji: { fontSize: 48, marginBottom: 16 },
    errorText: { fontSize: 15, color: '#E74C3C', textAlign: 'center', marginBottom: 16 },
    retryButton: { backgroundColor: '#5B67CA', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
    retryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    // 리스트
    scrollView: { flex: 1, paddingHorizontal: 16 },
    festivalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    festivalImage: { width: '100%', height: 140, backgroundColor: '#F0F0F0' },
    festivalContent: { padding: 16 },
    festivalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    festivalName: { flex: 1, fontSize: 17, fontWeight: '700', color: '#2B2B2B' },
    regionBadge: { backgroundColor: '#5B67CA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
    regionBadgeText: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
    festivalDate: { fontSize: 13, color: '#666', marginBottom: 6 },
    festivalAddress: { fontSize: 13, color: '#888', marginTop: 4 },
    statusRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    ongoingBadge: { backgroundColor: '#E8F5E9' },
    upcomingBadge: { backgroundColor: '#E3F2FD' },
    endedBadge: { backgroundColor: '#F5F5F5' },
    statusBadgeText: { fontSize: 11, fontWeight: '600', color: '#2E7D32' },
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

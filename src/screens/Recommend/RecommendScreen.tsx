/**
 * Recommend Screen - 축제 정보 화면
 * 필터 아이콘을 통한 날짜/지역 필터 설정
 * /festivals/search API 연동
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { searchFestivals, SearchFestivalInfo } from '../../services/api';
import { Festival } from '../../data/mockData';
import FestivalDetailModal from '../../components/FestivalDetailModal';
import FestivalImage from '../../components/FestivalImage';

// 필터 아이콘
const FilterIcon = require('../../assets/icons/Filter.webp');

interface RecommendScreenProps {
    onBack: () => void;
    onNavigateToCondition?: () => void;
    initialYear?: number | null;
    initialMonth?: number | null;
    onInitialMonthConsumed?: () => void;
}

interface DateObj {
    year: number;
    month: number;
    day: number;
}

// 지역(시) 데이터
const regions = ['전체', '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '수원', '전주', '청주', '춘천', '제주'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// 해당 년/월의 일수 계산
function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

// 해당 월 1일의 요일 (0=일요일)
function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month - 1, 1).getDay();
}

// 요일 이름 가져오기
function getDayOfWeekName(year: number, month: number, day: number): string {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return dayNames[new Date(year, month - 1, day).getDay()];
}

// 날짜 비교 (a < b: -1, a === b: 0, a > b: 1)
function compareDates(a: DateObj, b: DateObj): number {
    if (a.year !== b.year) return a.year < b.year ? -1 : 1;
    if (a.month !== b.month) return a.month < b.month ? -1 : 1;
    if (a.day !== b.day) return a.day < b.day ? -1 : 1;
    return 0;
}

// 날짜가 범위 안에 있는지
function isDateInRange(date: DateObj, start: DateObj | null, end: DateObj | null): boolean {
    if (!start || !end) return false;
    return compareDates(date, start) >= 0 && compareDates(date, end) <= 0;
}

function isSameDate(a: DateObj, b: DateObj | null): boolean {
    if (!b) return false;
    return a.year === b.year && a.month === b.month && a.day === b.day;
}

// 캘린더 범위 피커 컴포넌트
function CalendarRangePicker({
    startDate,
    endDate,
    onTapDate,
}: {
    startDate: DateObj | null;
    endDate: DateObj | null;
    onTapDate: (year: number, month: number, day: number) => void;
}) {
    const initYear = startDate?.year ?? new Date().getFullYear();
    const initMonth = startDate?.month ?? (new Date().getMonth() + 1);
    const [viewYear, setViewYear] = useState(initYear);
    const [viewMonth, setViewMonth] = useState(initMonth);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const calendarDays = useMemo(() => {
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(d);
        }
        return days;
    }, [viewYear, viewMonth, daysInMonth, firstDay]);

    const goToPrevMonth = () => {
        if (viewMonth === 1) {
            setViewYear(viewYear - 1);
            setViewMonth(12);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (viewMonth === 12) {
            setViewYear(viewYear + 1);
            setViewMonth(1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const getDayStyle = (day: number) => {
        const date: DateObj = { year: viewYear, month: viewMonth, day };
        const isStart = isSameDate(date, startDate);
        const isEnd = isSameDate(date, endDate);
        const inRange = isDateInRange(date, startDate, endDate);

        return { isStart, isEnd, inRange };
    };

    return (
        <View style={calStyles.container}>
            {/* 년/월 헤더 */}
            <View style={calStyles.monthHeader}>
                <TouchableOpacity onPress={goToPrevMonth} style={calStyles.arrowButton}>
                    <Text style={calStyles.arrowText}>{'‹'}</Text>
                </TouchableOpacity>
                <Text style={calStyles.monthTitle}>{viewYear}년 {viewMonth}월</Text>
                <TouchableOpacity onPress={goToNextMonth} style={calStyles.arrowButton}>
                    <Text style={calStyles.arrowText}>{'›'}</Text>
                </TouchableOpacity>
            </View>

            {/* 요일 헤더 */}
            <View style={calStyles.weekRow}>
                {DAY_LABELS.map((label, i) => (
                    <View key={i} style={calStyles.weekCell}>
                        <Text style={[
                            calStyles.weekLabel,
                            i === 0 && calStyles.sundayLabel,
                            i === 6 && calStyles.saturdayLabel,
                        ]}>{label}</Text>
                    </View>
                ))}
            </View>

            {/* 날짜 그리드 */}
            <View style={calStyles.daysGrid}>
                {calendarDays.map((day, index) => {
                    if (day === null) {
                        return <View key={index} style={calStyles.dayCell} />;
                    }

                    const { isStart, isEnd, inRange } = getDayStyle(day);
                    const colIndex = index % 7;

                    return (
                        <View key={index} style={calStyles.dayCell}>
                            {/* 범위 배경 (시작~끝 사이 날짜들) */}
                            {inRange && !isStart && !isEnd && (
                                <View style={calStyles.rangeBg} />
                            )}
                            {/* 시작일이면서 끝일이 아닌 경우: 오른쪽으로 범위 배경 */}
                            {isStart && endDate && !isSameDate(startDate!, endDate) && (
                                <View style={[calStyles.rangeBg, calStyles.rangeBgRight]} />
                            )}
                            {/* 끝일이면서 시작일이 아닌 경우: 왼쪽으로 범위 배경 */}
                            {isEnd && startDate && !isSameDate(startDate!, endDate!) && (
                                <View style={[calStyles.rangeBg, calStyles.rangeBgLeft]} />
                            )}

                            <TouchableOpacity
                                style={[
                                    calStyles.dayButton,
                                    (isStart || isEnd) && calStyles.dayButtonSelected,
                                ]}
                                onPress={() => onTapDate(viewYear, viewMonth, day)}
                            >
                                <Text style={[
                                    calStyles.dayText,
                                    colIndex === 0 && calStyles.sundayText,
                                    colIndex === 6 && calStyles.saturdayText,
                                    (isStart || isEnd) && calStyles.dayTextSelected,
                                    inRange && !isStart && !isEnd && calStyles.dayTextInRange,
                                ]}>{day}</Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const calStyles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
    },
    monthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 16,
    },
    arrowButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        fontSize: 24,
        color: '#5B67CA',
        fontWeight: '600',
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#5B67CA',
    },
    weekRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 8,
        marginBottom: 4,
    },
    weekCell: {
        flex: 1,
        alignItems: 'center',
    },
    weekLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
    },
    sundayLabel: {
        color: '#E74C3C',
    },
    saturdayLabel: {
        color: '#7B9FD4',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%` as any,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    rangeBg: {
        position: 'absolute',
        top: '20%',
        bottom: '20%',
        left: 0,
        right: 0,
        backgroundColor: '#E8EBFF',
    },
    rangeBgRight: {
        left: '50%',
        right: 0,
    },
    rangeBgLeft: {
        left: 0,
        right: '50%',
    },
    dayButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    dayButtonSelected: {
        backgroundColor: '#5B67CA',
    },
    dayText: {
        fontSize: 14,
        color: '#333',
    },
    sundayText: {
        color: '#E74C3C',
    },
    saturdayText: {
        color: '#7B9FD4',
    },
    dayTextSelected: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    dayTextInRange: {
        color: '#5B67CA',
        fontWeight: '600',
    },
});

// 날짜 포맷 헬퍼
function formatDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatApiDate(dateStr: string | null): string {
    if (!dateStr || dateStr.length !== 8) return '';
    return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
}

function RecommendScreen({ onBack, onNavigateToCondition, initialYear, initialMonth, onInitialMonthConsumed }: RecommendScreenProps) {
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
    const [appliedStartDate, setAppliedStartDate] = useState<DateObj>({ year: currentYear, month: currentMonth, day: currentDay });
    const [appliedEndDate, setAppliedEndDate] = useState<DateObj>({ year: endYear, month: endMonth, day: endDay });

    // 모달 내 임시 필터 상태
    const [tempRegions, setTempRegions] = useState<string[]>(['전체']);
    const [tempStartDate, setTempStartDate] = useState<DateObj | null>({ year: currentYear, month: currentMonth, day: currentDay });
    const [tempEndDate, setTempEndDate] = useState<DateObj | null>({ year: endYear, month: endMonth, day: endDay });

    // 날짜 선택 단계: 'start' = 다음 탭은 시작일, 'end' = 다음 탭은 종료일
    const [selectPhase, setSelectPhase] = useState<'start' | 'end'>('start');

    // 모달 표시 상태
    const [showFilterModal, setShowFilterModal] = useState(false);

    // API 결과 상태
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 축제 상세 모달 상태
    const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // 캘린더 날짜 탭 핸들러
    const handleDateTap = (year: number, month: number, day: number) => {
        const tapped: DateObj = { year, month, day };

        if (selectPhase === 'start') {
            // 시작일 설정
            setTempStartDate(tapped);
            setTempEndDate(null);
            setSelectPhase('end');
        } else {
            // 종료일 설정 — 만약 탭한 날짜가 시작일보다 이전이면 시작일로 리셋
            if (tempStartDate && compareDates(tapped, tempStartDate) < 0) {
                setTempStartDate(tapped);
                setTempEndDate(null);
                setSelectPhase('end');
            } else {
                setTempEndDate(tapped);
                setSelectPhase('start'); // 다음 탭은 다시 리셋 → 시작일
            }
        }
    };

    // API 호출 함수
    const doSearch = useCallback(async (
        regionList: string[],
        startDate: DateObj,
        endDate: DateObj,
    ) => {
        try {
            setLoading(true);
            setError(null);

            const region = regionList.length === 0 || regionList.includes('전체')
                ? undefined
                : regionList[0];

            const result = await searchFestivals({
                region,
                start_date: formatDateStr(startDate.year, startDate.month, startDate.day),
                end_date: formatDateStr(endDate.year, endDate.month, endDate.day),
                max_items: 50,
            });

            setFestivals(result.festivals);
            setTotalCount(result.total_count);
        } catch (err: any) {
            console.error('검색 오류:', err);
            setError(err.message || '축제 검색에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    // 초기 로드
    useEffect(() => {
        doSearch(appliedRegions, appliedStartDate, appliedEndDate);
    }, []);

    // 메인화면에서 더보기로 넘어온 경우
    useEffect(() => {
        if (initialYear && initialMonth) {
            const lastDay = new Date(initialYear, initialMonth, 0).getDate();
            const newStart = { year: initialYear, month: initialMonth, day: 1 };
            const newEnd = { year: initialYear, month: initialMonth, day: lastDay };
            setAppliedRegions(['전체']);
            setAppliedStartDate(newStart);
            setAppliedEndDate(newEnd);
            doSearch(['전체'], newStart, newEnd);
            onInitialMonthConsumed?.();
        }
    }, [initialYear, initialMonth]);

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
        setTempStartDate({ ...appliedStartDate });
        setTempEndDate({ ...appliedEndDate });
        setSelectPhase('start');
        setShowFilterModal(true);
    };

    // 필터 적용 → API 호출
    const applyFilters = () => {
        if (!tempStartDate || !tempEndDate) return; // 둘 다 선택되어야 적용 가능
        const newRegions = tempRegions.length === 0 ? ['전체'] : [...tempRegions];

        setAppliedRegions(newRegions);
        setAppliedStartDate({ ...tempStartDate });
        setAppliedEndDate({ ...tempEndDate });
        setShowFilterModal(false);

        doSearch(newRegions, tempStartDate, tempEndDate);
    };

    // 필터 초기화
    const resetFilters = () => {
        setTempRegions(['전체']);
        setTempStartDate({ year: currentYear, month: currentMonth, day: currentDay });
        setTempEndDate({ year: endYear, month: endMonth, day: endDay });
        setSelectPhase('start');
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

    const openDetail = (f: Festival) => {
        setSelectedFestival(f);
        setShowDetailModal(true);
    };

    const appliedTags = getAppliedFilterTags();

    // 선택 상태 표시 텍스트
    const getDateSummary = () => {
        if (!tempStartDate && !tempEndDate) {
            return '날짜를 선택해주세요';
        }
        const startLabel = tempStartDate
            ? `${tempStartDate.month}월 ${tempStartDate.day}일(${getDayOfWeekName(tempStartDate.year, tempStartDate.month, tempStartDate.day)})`
            : '?';
        const endLabel = tempEndDate
            ? `${tempEndDate.month}월 ${tempEndDate.day}일(${getDayOfWeekName(tempEndDate.year, tempEndDate.month, tempEndDate.day)})`
            : '선택중...';
        return `${startLabel}  ~  ${endLabel}`;
    };

    const canApply = tempStartDate !== null && tempEndDate !== null;

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
                                <FestivalImage
                                    uri={festival.image}
                                    style={styles.festivalImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.festivalContent}>
                                    <View style={styles.festivalHeader}>
                                        <Text style={styles.festivalName} numberOfLines={1}>{festival.name}</Text>
                                        {festival.location && (
                                            <View style={styles.regionBadge}>
                                                <Text style={styles.regionBadgeText}>{festival.location.split(' ')[0]}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.festivalDate}>
                                        📅 {festival.date}
                                    </Text>
                                    <Text style={styles.festivalAddress} numberOfLines={1}>📍 {festival.location}</Text>
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

            {/* 필터 모달 */}
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
                            {/* 날짜 선택 (캘린더 하나로 통합) */}
                            <View style={styles.dateSection}>
                                <Text style={styles.sectionTitle}>📅 날짜 선택</Text>
                                {/* 안내 텍스트 */}
                                <Text style={styles.phaseHint}>
                                    {selectPhase === 'start' ? '시작 날짜를 선택하세요' : '종료 날짜를 선택하세요'}
                                </Text>
                                <View style={styles.datePickerContainer}>
                                    <CalendarRangePicker
                                        startDate={tempStartDate}
                                        endDate={tempEndDate}
                                        onTapDate={handleDateTap}
                                    />
                                    {/* 선택된 범위 표시 바 */}
                                    <View style={styles.selectedDateBar}>
                                        <Text style={styles.selectedDateText}>{getDateSummary()}</Text>
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

                        <TouchableOpacity
                            style={[styles.applyButton, !canApply && styles.applyButtonDisabled]}
                            onPress={applyFilters}
                            disabled={!canApply}
                        >
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
    modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 360, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    modalCancel: { fontSize: 15, color: '#888' },
    modalTitle: { fontSize: 17, fontWeight: '700', color: '#2B2B2B' },
    modalReset: { fontSize: 15, color: '#5B67CA' },
    modalBody: { paddingBottom: 10 },
    dateSection: { paddingHorizontal: 16, paddingTop: 14 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: '#2B2B2B', marginBottom: 4 },
    phaseHint: { fontSize: 12, color: '#5B67CA', marginBottom: 8, fontWeight: '500' },
    datePickerContainer: { backgroundColor: '#F8F8F8', borderRadius: 12, overflow: 'hidden' },
    // 선택된 날짜 표시 바
    selectedDateBar: {
        backgroundColor: '#8B95D9',
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    selectedDateText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    // 지역 태그
    regionTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    regionTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#F5F5F5' },
    regionTagActive: { backgroundColor: '#5B67CA' },
    regionTagText: { fontSize: 14, color: '#666' },
    regionTagTextActive: { color: '#FFFFFF', fontWeight: '600' },
    applyButton: { marginHorizontal: 16, marginVertical: 16, backgroundColor: '#5B67CA', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    applyButtonDisabled: { backgroundColor: '#D4D4D4' },
    applyButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default RecommendScreen;

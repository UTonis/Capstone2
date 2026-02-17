/**
 * Main Screen - Festival-focused Travel App Home
 * 축제 중심 메인 화면
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { popularFestivals as mockPopularFestivals, Festival } from '../data/mockData';
import { fetchPopularFestivals, fetchMonthlyFestivals } from '../services/api';
import FestivalDetailModal from '../components/FestivalDetailModal';

const { width } = Dimensions.get('window');

interface MainScreenProps {
    onNavigateToAIPlanner?: () => void;
    onNavigateToFestivalDetail?: (festival: any) => void;
    onNavigateToSearch?: () => void;
}

function MainScreen({
    onNavigateToAIPlanner,
    onNavigateToFestivalDetail,
    onNavigateToSearch,
}: MainScreenProps) {
    const insets = useSafeAreaInsets();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // 축제 상세 모달 상태
    const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const openFestivalDetail = (festival: Festival) => {
        setSelectedFestival(festival);
        setShowDetailModal(true);
    };

    // 인기 축제 API 상태
    const [popularFestivals, setPopularFestivals] = useState<Festival[]>(mockPopularFestivals);
    const [popularLoading, setPopularLoading] = useState(true);

    // 캘린더 축제 캐시
    const [festivalCache, setFestivalCache] = useState<{ [key: string]: Festival[] }>({});
    const [calendarLoading, setCalendarLoading] = useState(true);

    // 인기 축제 데이터 가져오기
    const loadPopularFestivals = useCallback(async () => {
        try {
            setPopularLoading(true);
            const data = await fetchPopularFestivals(10);
            if (data.length > 0) {
                setPopularFestivals(data);
            }
        } catch (err) {
            console.log('인기 축제 API 연결 실패, mock 데이터 사용:', err);
        } finally {
            setPopularLoading(false);
        }
    }, []);

    // 캘린더 축제 데이터 가져오기 (캐시 활용)
    const loadCalendarFestivals = useCallback(async (year: number, month: number) => {
        const cacheKey = `${year}-${month}`;
        if (festivalCache[cacheKey]) return; // 이미 캐시에 있으면 스킵
        try {
            setCalendarLoading(true);
            const data = await fetchMonthlyFestivals(year, month);
            setFestivalCache(prev => ({ ...prev, [cacheKey]: data }));
        } catch (err) {
            console.log('캘린더 API 연결 실패:', err);
            setFestivalCache(prev => ({ ...prev, [cacheKey]: [] }));
        } finally {
            setCalendarLoading(false);
        }
    }, [festivalCache]);

    useEffect(() => {
        loadPopularFestivals();
    }, [loadPopularFestivals]);

    useEffect(() => {
        loadCalendarFestivals(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);

    // 캐시에서 현재 선택된 달 데이터 가져오기
    const calendarFestivals = festivalCache[`${selectedYear}-${selectedMonth}`] || [];

    const months = [
        { num: 1, name: '1월' },
        { num: 2, name: '2월' },
        { num: 3, name: '3월' },
        { num: 4, name: '4월' },
        { num: 5, name: '5월' },
        { num: 6, name: '6월' },
        { num: 7, name: '7월' },
        { num: 8, name: '8월' },
        { num: 9, name: '9월' },
        { num: 10, name: '10월' },
        { num: 11, name: '11월' },
        { num: 12, name: '12월' },
    ];

    const currentMonthFestivals = calendarFestivals;

    // 달력 생성 함수
    const generateCalendar = (year: number, month: number) => {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const calendar: (number | null)[] = [];

        // 빈 칸 추가 (이전 달)
        for (let i = 0; i < startDayOfWeek; i++) {
            calendar.push(null);
        }

        // 날짜 추가
        for (let day = 1; day <= daysInMonth; day++) {
            calendar.push(day);
        }

        return calendar;
    };

    // 축제별 색상 팔레트 (겹치지 않게)
    const festivalColors = [
        { bg: '#E8EEFF', text: '#5B67CA', border: '#5B67CA' },
        { bg: '#FFF0F0', text: '#EF4444', border: '#EF4444' },
        { bg: '#F0FFF4', text: '#10B981', border: '#10B981' },
        { bg: '#FFF7ED', text: '#F59E0B', border: '#F59E0B' },
        { bg: '#F5F3FF', text: '#8B5CF6', border: '#8B5CF6' },
    ];

    // 날짜 문자열에서 시작일과 종료일 파싱
    const parseDateRange = (dateStr: string, currentMonth: number) => {
        // "1월 6일 ~ 1월 28일" 또는 "3월 25일 ~ 4월 3일" 형식 파싱
        const parts = dateStr.split('~').map(p => p.trim());

        if (parts.length === 1) {
            // 단일 날짜 "10월 26일"
            const monthMatch = parts[0].match(/(\d+)월/);
            const dayMatch = parts[0].match(/(\d+)일/);
            const month = monthMatch ? parseInt(monthMatch[1]) : currentMonth;
            const day = dayMatch ? parseInt(dayMatch[1]) : 0;

            if (month === currentMonth) {
                return { startDay: day, endDay: day };
            }
            return { startDay: 0, endDay: 0 };
        } else {
            // 범위 날짜
            const startMonthMatch = parts[0].match(/(\d+)월/);
            const startDayMatch = parts[0].match(/(\d+)일/);
            const endMonthMatch = parts[1].match(/(\d+)월/);
            const endDayMatch = parts[1].match(/(\d+)일/);

            const startMonth = startMonthMatch ? parseInt(startMonthMatch[1]) : currentMonth;
            const startDay = startDayMatch ? parseInt(startDayMatch[1]) : 0;
            const endMonth = endMonthMatch ? parseInt(endMonthMatch[1]) : currentMonth;
            const endDay = endDayMatch ? parseInt(endDayMatch[1]) : 0;

            // 현재 월에 해당하는 범위만 반환
            if (startMonth === currentMonth && endMonth === currentMonth) {
                return { startDay, endDay };
            } else if (startMonth === currentMonth && endMonth > currentMonth) {
                const lastDayOfMonth = new Date(selectedYear, currentMonth, 0).getDate();
                return { startDay, endDay: lastDayOfMonth };
            } else if (startMonth < currentMonth && endMonth === currentMonth) {
                return { startDay: 1, endDay };
            }

            return { startDay: 0, endDay: 0 };
        }
    };

    // 특정 날짜가 축제 기간에 포함되는지 확인
    const getFestivalsOnDate = (day: number) => {
        return currentMonthFestivals.filter(festival => {
            const { startDay, endDay } = parseDateRange(festival.date, selectedMonth);
            return day >= startDay && day <= endDay && startDay > 0;
        });
    };

    // 축제에 색상 인덱스 할당 (겹치지 않게)
    const assignFestivalColors = () => {
        const colorMap: { [key: number]: number } = {};
        currentMonthFestivals.forEach((festival, index) => {
            colorMap[festival.id] = index % festivalColors.length;
        });
        return colorMap;
    };

    const festivalColorMap = assignFestivalColors();

    const calendarDays = generateCalendar(selectedYear, selectedMonth);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    // 이전 월로 이동
    const goToPreviousMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    // 다음 월로 이동
    const goToNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };


    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.logoText}>PtoT</Text>
                    <Text style={styles.headerSubtitle}>축제와 함께하는 여행</Text>
                </View>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={onNavigateToSearch}
                >
                    <Text style={styles.searchButtonText}>⌕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* 히어로 섹션 - 여행 사진 + CTA */}
                <TouchableOpacity
                    style={styles.heroSection}
                    onPress={onNavigateToAIPlanner}
                    activeOpacity={0.9}
                >
                    <Image
                        source={{ uri: 'https://picsum.photos/800/400?random=hero' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    <View style={styles.heroOverlay}>
                        <Text style={styles.heroTitle}>일정을 만들어 보세요</Text>
                        <Text style={styles.heroSubtitle}>AI가 맞춤 여행 계획을 도와드려요</Text>
                        <View style={styles.heroButton}>
                            <Text style={styles.heroButtonText}>시작하기</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* 이달의 축제 섹션 */}
                <View style={styles.calendarSection}>
                    <Text style={styles.sectionTitle}>이달의 축제</Text>
                    <Text style={styles.sectionSubtitle}>이번 달 열리는 특별한 축제를 확인하세요</Text>

                    {/* 달력 UI */}
                    <View style={styles.calendarContainer}>
                        {/* 달력 헤더 with 이전/다음 버튼 */}
                        <View style={styles.calendarHeaderContainer}>
                            <TouchableOpacity
                                style={styles.calendarNavButton}
                                onPress={goToPreviousMonth}
                            >
                                <Text style={styles.calendarNavButtonText}>◀</Text>
                            </TouchableOpacity>

                            <Text style={styles.calendarHeader}>{selectedYear}년 {selectedMonth}월</Text>

                            <TouchableOpacity
                                style={styles.calendarNavButton}
                                onPress={goToNextMonth}
                            >
                                <Text style={styles.calendarNavButtonText}>▶</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 요일 헤더 */}
                        <View style={styles.weekDaysRow}>
                            {weekDays.map((day, index) => (
                                <View key={index} style={styles.weekDayCell}>
                                    <Text style={[
                                        styles.weekDayText,
                                        index === 0 && styles.sundayText,
                                        index === 6 && styles.saturdayText
                                    ]}>
                                        {day}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* 날짜 그리드 - key로 월 변경 시 완전 재렌더링 */}
                        <View key={`${selectedYear}-${selectedMonth}`} style={styles.daysGrid}>
                            {calendarDays.map((day, index) => {
                                const festivalsOnDay = day !== null ? getFestivalsOnDate(day) : [];
                                return (
                                    <View key={index} style={styles.dayCell}>
                                        {day !== null && (
                                            <>
                                                {/* 날짜 숫자 */}
                                                <Text style={[
                                                    styles.dayText,
                                                    index % 7 === 0 && styles.sundayText,
                                                    index % 7 === 6 && styles.saturdayText,
                                                ]}>
                                                    {day}
                                                </Text>

                                                {/* 축제 얇은 막대 표시 */}
                                                {festivalsOnDay.map((festival) => {
                                                    const globalIndex = currentMonthFestivals.findIndex(f => f.id === festival.id);
                                                    const colorIndex = festivalColorMap[festival.id];
                                                    const color = festivalColors[colorIndex];
                                                    const { startDay, endDay } = parseDateRange(festival.date, selectedMonth);
                                                    const isStart = day === startDay;
                                                    const isEnd = day === endDay;
                                                    const dayOfWeek = index % 7;
                                                    const isWeekStart = dayOfWeek === 0;
                                                    const isWeekEnd = dayOfWeek === 6;

                                                    let leftExtend = 0;
                                                    let rightExtend = 0;
                                                    if (!isStart && !isWeekStart) leftExtend = -2;
                                                    if (!isEnd && !isWeekEnd) rightExtend = -2;

                                                    return (
                                                        <View
                                                            key={festival.id}
                                                            style={[
                                                                styles.festivalBar,
                                                                {
                                                                    backgroundColor: color.border,
                                                                    bottom: 6 + (globalIndex * 6),
                                                                    borderTopLeftRadius: (isStart || isWeekStart) ? 2 : 0,
                                                                    borderBottomLeftRadius: (isStart || isWeekStart) ? 2 : 0,
                                                                    borderTopRightRadius: (isEnd || isWeekEnd) ? 2 : 0,
                                                                    borderBottomRightRadius: (isEnd || isWeekEnd) ? 2 : 0,
                                                                    left: leftExtend,
                                                                    right: rightExtend,
                                                                }
                                                            ]}
                                                        />
                                                    );
                                                })}
                                            </>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* 축제 리스트 */}
                    <View style={styles.monthFestivalsContainer}>
                        {currentMonthFestivals.length > 0 ? (
                            currentMonthFestivals.map((festival) => (
                                <TouchableOpacity
                                    key={festival.id}
                                    style={styles.monthFestivalCard}
                                    onPress={() => openFestivalDetail(festival)}
                                >
                                    <Image
                                        source={{ uri: festival.image }}
                                        style={styles.monthFestivalImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.monthFestivalInfo}>
                                        <View style={styles.monthFestivalNameRow}>
                                            <View style={[styles.festivalColorDot, { backgroundColor: festivalColors[festivalColorMap[festival.id]]?.border || '#5B67CA' }]} />
                                            <Text style={[styles.monthFestivalName, { color: festivalColors[festivalColorMap[festival.id]]?.text || '#2B2B2B' }]}>{festival.name}</Text>
                                        </View>
                                        <Text style={styles.monthFestivalLocation}>📍 {festival.location}</Text>
                                        <Text style={styles.monthFestivalDate}>📅 {festival.date}</Text>
                                        <View style={styles.ratingContainer}>
                                            <Text style={styles.ratingText}>⭐ {festival.rating}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.noFestivalContainer}>
                                <Text style={styles.noFestivalText}>이번 달에는 등록된 축제가 없습니다</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* 인기 축제 섹션 - 가로 스크롤 */}
                <View style={styles.popularSection}>
                    <View style={styles.popularSectionHeader}>
                        <Text style={styles.sectionTitle}>인기 축제</Text>
                        <Text style={styles.sectionSubtitle}>많은 사람들이 찾는 축제를 만나보세요</Text>
                    </View>

                    {popularLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#5B67CA" />
                            <Text style={styles.loadingText}>축제 정보를 불러오는 중...</Text>
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.popularFestivalsContainer}
                        >
                            {popularFestivals.map((festival) => (
                                <TouchableOpacity
                                    key={festival.id}
                                    style={styles.festivalCard}
                                    onPress={() => openFestivalDetail(festival)}
                                >
                                    <Image
                                        source={{ uri: festival.image }}
                                        style={styles.festivalCardImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.festivalCardOverlay}>
                                        <Text style={styles.festivalCardTitle} numberOfLines={2}>
                                            {festival.name}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* 하단 여백 */}
                <View style={{ height: 40 }} />
            </ScrollView>

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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerLeft: {
        flex: 1,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#5B67CA',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666666',
    },
    searchButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    searchButtonText: {
        fontSize: 24,
        color: '#5B67CA',
    },
    scrollView: {
        flex: 1,
    },

    // 히어로 섹션
    heroSection: {
        width: width,
        height: 280,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 24,
        textAlign: 'center',
        opacity: 0.9,
    },
    heroButton: {
        backgroundColor: '#5B67CA',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 25,
    },
    heroButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // 캘린더 섹션
    calendarSection: {
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 6,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 20,
    },
    monthSelector: {
        marginBottom: 20,
    },
    monthSelectorContent: {
        paddingRight: 20,
    },
    monthButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 10,
    },
    monthButtonActive: {
        backgroundColor: '#5B67CA',
    },
    monthButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
    },
    monthButtonTextActive: {
        color: '#FFFFFF',
    },

    // 달력 UI
    calendarContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F0F0FF',
    },
    calendarHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#F0F0FF',
    },
    calendarNavButton: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#F5F7FF',
        minWidth: 44,
        alignItems: 'center',
    },
    calendarNavButtonText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: 'bold',
    },
    calendarHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 8,
    },
    weekDayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    weekDayText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#666666',
        letterSpacing: 0.5,
    },
    sundayText: {
        color: '#EF4444',
    },
    saturdayText: {
        color: '#3B82F6',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -1,
        backgroundColor: '#FAFBFC',
        borderRadius: 12,
        padding: 4,
    },
    dayCell: {
        width: `${100 / 7}%`,
        minHeight: 80,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 10,
        position: 'relative',
        borderRightWidth: 0.5,
        borderRightColor: '#E8E8E8',
    },
    dayText: {
        fontSize: 15,
        color: '#2B2B2B',
        marginBottom: 4,
        zIndex: 20,
        fontWeight: '700',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    dayTextWithFestival: {
        fontWeight: 'bold',
    },
    festivalBar: {
        position: 'absolute',
        left: 4,
        right: 4,
        height: 4,
        zIndex: 1,
    },
    festivalDot: {
        position: 'absolute',
        bottom: 8,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#5B67CA',
    },

    // 월별 축제 리스트
    monthFestivalsContainer: {
    },
    monthFestivalsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 12,
    },
    monthFestivalCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 16,
    },
    monthFestivalImage: {
        width: 120,
        height: 120,
    },
    monthFestivalInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    monthFestivalNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    festivalColorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    monthFestivalName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    monthFestivalLocation: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 2,
    },
    monthFestivalDate: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 6,
    },
    ratingContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F59E0B',
    },
    noFestivalContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    noFestivalText: {
        fontSize: 14,
        color: '#999999',
    },

    // 인기 축제 섹션 - 가로 스크롤
    popularSection: {
        paddingTop: 16,
        paddingBottom: 24,
        backgroundColor: '#F9FAFB',
    },
    popularSectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    popularFestivalsContainer: {
        paddingLeft: 10,
        paddingRight: 10,
    },
    festivalCard: {
        width: width * 0.6,
        height: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 10,
        position: 'relative',
    },
    festivalCardImage: {
        width: '100%',
        height: '100%',
    },
    festivalCardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 16,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 13,
        color: '#999999',
    },
    festivalCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});

export default MainScreen;

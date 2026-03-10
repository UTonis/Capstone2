/**
 * PlannerGenerateScreen - AI 여행 일정 자동 생성 화면
 * - 여행 지역: 텍스트 자유 입력
 * - 여행 날짜: 인라인 캘린더로 선택 (시작일 → 종료일)
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
    Modal,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
    generateItinerary,
    generateWithPhoto,
    FullAnalysisResponse,
    GenerateWithPhotoRequest,
} from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PlannerGenerateScreenProps {
    onBack: () => void;
    onSuccess: () => void;
    onNavigateToDetail: (tripId: number, title: string) => void;
    initialData?: FullAnalysisResponse;
}

const THEMES = ['맛집', '자연', '힐링', '문화', '액티비티', '쇼핑', '카페', '야경', '역사', '축제'];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// ──────────────────────────────────
// 캘린더 헬퍼
// ──────────────────────────────────
function toDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDate(str: string): { year: number; month: number; day: number } | null {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    if (!y || !m || !d) return null;
    return { year: y, month: m, day: d };
}

function formatDisplay(str: string): string {
    const d = parseDate(str);
    if (!d) return '';
    return `${d.year}년 ${d.month}월 ${d.day}일`;
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

function getFirstWeekday(year: number, month: number): number {
    return new Date(year, month - 1, 1).getDay();
}

function compareDates(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

// ──────────────────────────────────
// 캘린더 컴포넌트
// ──────────────────────────────────
interface CalendarProps {
    startDate: string;
    endDate: string;
    onSelectStart: (date: string) => void;
    onSelectEnd: (date: string) => void;
    selectionStep: 'start' | 'end'; // 현재 어느 날짜를 선택 중인지
}

function Calendar({ startDate, endDate, onSelectStart, onSelectEnd, selectionStep }: CalendarProps) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);

    const daysInMonth = getDaysInMonth(year, month);
    const firstWeekday = getFirstWeekday(year, month);

    const toPrev = () => {
        if (month === 1) { setYear(y => y - 1); setMonth(12); }
        else setMonth(m => m - 1);
    };
    const toNext = () => {
        if (month === 12) { setYear(y => y + 1); setMonth(1); }
        else setMonth(m => m + 1);
    };

    const handleDayPress = (day: number) => {
        const dateStr = toDateStr(year, month, day);
        if (selectionStep === 'start') {
            onSelectStart(dateStr);
        } else {
            // 종료일은 시작일 이후여야 함
            if (startDate && compareDates(dateStr, startDate) < 0) {
                // 시작일보다 이르면 시작일로 재설정
                onSelectStart(dateStr);
            } else {
                onSelectEnd(dateStr);
            }
        }
    };

    // 날짜 셀 상태
    const getDayState = (day: number): 'start' | 'end' | 'between' | 'today' | 'normal' => {
        const dateStr = toDateStr(year, month, day);
        const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());
        if (dateStr === startDate) return 'start';
        if (dateStr === endDate) return 'end';
        if (startDate && endDate && compareDates(dateStr, startDate) > 0 && compareDates(dateStr, endDate) < 0) return 'between';
        if (dateStr === todayStr) return 'today';
        return 'normal';
    };

    // 빈 칸 (첫 주 앞부분)
    const blanks = Array(firstWeekday).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <View style={calStyles.container}>
            {/* 월 네비게이션 */}
            <View style={calStyles.nav}>
                <TouchableOpacity onPress={toPrev} style={calStyles.navBtn}>
                    <Text style={calStyles.navArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={calStyles.navTitle}>{year}년 {month}월</Text>
                <TouchableOpacity onPress={toNext} style={calStyles.navBtn}>
                    <Text style={calStyles.navArrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* 요일 헤더 */}
            <View style={calStyles.weekRow}>
                {WEEKDAYS.map((w, i) => (
                    <Text key={w} style={[calStyles.weekLabel, i === 0 && { color: '#FF6B6B' }, i === 6 && { color: '#5B67CA' }]}>{w}</Text>
                ))}
            </View>

            {/* 날짜 그리드 */}
            <View style={calStyles.grid}>
                {blanks.map((_, i) => <View key={`b${i}`} style={calStyles.cell} />)}
                {days.map(day => {
                    const state = getDayState(day);
                    const col = (firstWeekday + day - 1) % 7;
                    return (
                        <TouchableOpacity
                            key={day}
                            style={[
                                calStyles.cell,
                                state === 'between' && calStyles.betweenCell,
                                (state === 'start' || state === 'end') && calStyles.selectedCell,
                            ]}
                            onPress={() => handleDayPress(day)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                calStyles.dayCircle,
                                (state === 'start' || state === 'end') && calStyles.selectedCircle,
                            ]}>
                                <Text style={[
                                    calStyles.dayText,
                                    state === 'today' && calStyles.todayText,
                                    (state === 'start' || state === 'end') && calStyles.selectedDayText,
                                    state === 'between' && calStyles.betweenDayText,
                                    col === 0 && state === 'normal' && { color: '#FF6B6B' },
                                    col === 6 && state === 'normal' && { color: '#5B67CA' },
                                ]}>{day}</Text>
                            </View>
                            {state === 'start' && <Text style={calStyles.dayLabel}>출발</Text>}
                            {state === 'end' && <Text style={calStyles.dayLabel}>도착</Text>}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

// ──────────────────────────────────
// 메인 화면
// ──────────────────────────────────
function PlannerGenerateScreen({ onBack, onSuccess, onNavigateToDetail, initialData }: PlannerGenerateScreenProps) {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const [title, setTitle] = useState('');
    const [region, setRegion] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('start');
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [budgetLevel, setBudgetLevel] = useState<'low' | 'medium' | 'high'>('medium');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (initialData?.location) {
            const { city, landmark } = initialData.location;
            if (city) setRegion(city);
            if (landmark) setTitle(`${city || ''} ${landmark} 여행`.trim());
            else if (city) setTitle(`${city} 여행`);
            if (initialData.scene?.scene_type) {
                const matched = initialData.scene.scene_type.filter((t: string) => THEMES.includes(t));
                setSelectedThemes(matched);
            }
        }
    }, [initialData]);

    const toggleTheme = (theme: string) => {
        setSelectedThemes(prev =>
            prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
        );
    };

    // 캘린더에서 날짜 선택 처리
    const handleSelectStart = (date: string) => {
        setStartDate(date);
        setEndDate(''); // 종료일 리셋
        setSelectionStep('end');
    };

    const handleSelectEnd = (date: string) => {
        setEndDate(date);
        setSelectionStep('start'); // 다음번엔 시작일부터
    };

    // 날짜 버튼 클릭 → 해당 step으로 캘린더 오픈
    const openCalendarForStart = () => {
        setSelectionStep('start');
        setCalendarVisible(true);
    };

    const openCalendarForEnd = () => {
        if (!startDate) {
            Alert.alert('알림', '먼저 시작일을 선택해주세요.');
            return;
        }
        setSelectionStep('end');
        setCalendarVisible(true);
    };

    const handleGenerate = async (usePhotoThemes = false) => {
        if (!token) { Alert.alert('알림', '로그인이 필요합니다.'); return; }
        if (!title.trim()) { Alert.alert('알림', '여행 제목을 입력해주세요.'); return; }
        if (!region.trim()) { Alert.alert('알림', '여행 지역을 입력해주세요.'); return; }
        if (!startDate || !endDate) { Alert.alert('알림', '여행 날짜를 선택해주세요.'); return; }

        try {
            setGenerating(true);

            // 사진 분석 결과가 있으면 generate-with-photo 사용 (지역 불일치 체크 포함)
            if (initialData?.location?.city) {
                const photoReq: GenerateWithPhotoRequest = {
                    title: title.trim(),
                    region: region.trim(),
                    start_date: startDate,
                    end_date: endDate,
                    themes: selectedThemes.length > 0 ? selectedThemes : undefined,
                    photo_city: initialData.location.city ?? undefined,
                    photo_landmark: initialData.location.landmark ?? undefined,
                    photo_scene_types: initialData.scene?.scene_type ?? [],
                    use_photo_themes: usePhotoThemes,
                };

                const photoRes = await generateWithPhoto(token, photoReq);

                if (photoRes.needs_clarification) {
                    // 지역 불일치 → 사용자에게 확인
                    setGenerating(false);
                    Alert.alert(
                        '🗺️ 지역 확인',
                        photoRes.clarification_message ||
                        `사진 지역(${initialData.location.city})과 입력한 여행 지역(${region.trim()})이 다릅니다. 사진 분위기를 테마에 반영할까요?`,
                        [
                            {
                                text: '아니요 (지역 다시 입력)',
                                style: 'cancel',
                                // 아무것도 하지 않음 → Alert 닫히고 지역 입력창으로 돌아감
                            },
                            {
                                text: '네, 반영해주세요',
                                onPress: () => handleGenerate(true),
                            },
                        ]
                    );
                    return;
                }

                // 일정 생성 완료
                if (photoRes.trip_data) {
                    Alert.alert(
                        '완료',
                        'AI가 여행 일정을 생성했습니다!\n생성된 일정을 먼저 확인하고, 필요시 AI와 대화하며 수정할 수 있습니다.',
                        [{ text: '확인', onPress: () => onNavigateToDetail(photoRes.trip_data!.trip_id, title.trim()) }]
                    );
                    return;
                }
            }

            // 사진 분석 결과 없음 → 기존 generate 엔드포인트
            const response = await generateItinerary(token, {
                title: title.trim(),
                region: region.trim(),
                start_date: startDate,
                end_date: endDate,
                themes: selectedThemes.length > 0 ? selectedThemes : undefined,
            });
            Alert.alert(
                '완료',
                'AI가 여행 일정을 생성했습니다!\n생성된 일정을 먼저 확인하고, 필요시 AI와 대화하며 수정할 수 있습니다.',
                [{ text: '확인', onPress: () => onNavigateToDetail(response.trip_id, title.trim()) }]
            );
        } catch (err: any) {
            const msg = err?.message || '알 수 없는 오류';
            Alert.alert('오류', `일정 생성에 실패했습니다.\n\n${msg}`);
        } finally {
            setGenerating(false);
        }
    };

    // 여행 일수 계산
    const tripDays = startDate && endDate
        ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1
        : 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI 일정 생성</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* 여행 제목 */}
                <View style={styles.section}>
                    <Text style={styles.label}>여행 제목</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="예: 부산 2박3일 여행"
                        placeholderTextColor="#BBB"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* 여행 지역 – 자유 입력 */}
                <View style={styles.section}>
                    <Text style={styles.label}>여행 지역</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="예: 부산, 제주, 강릉, 교토 등 자유입력"
                        placeholderTextColor="#BBB"
                        value={region}
                        onChangeText={setRegion}
                        returnKeyType="done"
                    />
                    {region.trim() !== '' && (
                        <View style={styles.regionBadge}>
                            <Text style={styles.regionBadgeText}>📍 {region.trim()}</Text>
                        </View>
                    )}
                </View>

                {/* 여행 날짜 – 캘린더 */}
                <View style={styles.section}>
                    <Text style={styles.label}>여행 날짜</Text>

                    <View style={styles.dateRow}>
                        {/* 시작일 버튼 */}
                        <TouchableOpacity
                            style={[styles.dateBtn, startDate ? styles.dateBtnActive : null]}
                            onPress={openCalendarForStart}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dateBtnLabel}>출발</Text>
                            <Text style={[styles.dateBtnValue, !startDate && styles.dateBtnPlaceholder]}>
                                {startDate ? formatDisplay(startDate) : '날짜 선택'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.dateArrow}>
                            <Text style={styles.dateArrowText}>→</Text>
                        </View>

                        {/* 종료일 버튼 */}
                        <TouchableOpacity
                            style={[styles.dateBtn, endDate ? styles.dateBtnActive : null]}
                            onPress={openCalendarForEnd}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.dateBtnLabel}>귀국</Text>
                            <Text style={[styles.dateBtnValue, !endDate && styles.dateBtnPlaceholder]}>
                                {endDate ? formatDisplay(endDate) : '날짜 선택'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* 기간 뱃지 */}
                    {tripDays > 0 && (
                        <View style={styles.tripDaysBadge}>
                            <Text style={styles.tripDaysText}>
                                🗓️ {tripDays}일 여행 ({tripDays - 1 > 0 ? `${tripDays - 1}박 ${tripDays}일` : '당일치기'})
                            </Text>
                        </View>
                    )}
                </View>

                {/* 테마 선택 */}
                <View style={styles.section}>
                    <Text style={styles.label}>테마 (선택)</Text>
                    <View style={styles.chipWrap}>
                        {THEMES.map(t => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.chip, selectedThemes.includes(t) && styles.chipActive]}
                                onPress={() => toggleTheme(t)}
                            >
                                <Text style={[styles.chipText, selectedThemes.includes(t) && styles.chipTextActive]}>#{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 생성 버튼 */}
                <TouchableOpacity
                    style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
                    onPress={() => handleGenerate()}
                    disabled={generating}
                >
                    {generating ? (
                        <View style={styles.generatingRow}>
                            <ActivityIndicator size="small" color="#FFF" />
                            <Text style={styles.generateBtnText}>AI가 일정을 생성하는 중...</Text>
                        </View>
                    ) : (
                        <Text style={styles.generateBtnText}>AI 일정 생성하기</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* 캘린더 모달 */}
            <Modal
                visible={calendarVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setCalendarVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        {/* 모달 헤더 */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectionStep === 'start' ? '🛫 출발일 선택' : '🛬 귀국일 선택'}
                            </Text>
                            <TouchableOpacity onPress={() => setCalendarVisible(false)} style={styles.modalCloseBtn}>
                                <Text style={styles.modalCloseText}>완료</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 선택 안내 */}
                        <View style={styles.selectionGuide}>
                            <View style={[styles.guideStep, selectionStep === 'start' && styles.guideStepActive]}>
                                <Text style={[styles.guideStepText, selectionStep === 'start' && styles.guideStepTextActive]}>
                                    출발: {startDate ? formatDisplay(startDate) : '선택 필요'}
                                </Text>
                            </View>
                            <Text style={styles.guideArrow}>→</Text>
                            <View style={[styles.guideStep, selectionStep === 'end' && styles.guideStepActive]}>
                                <Text style={[styles.guideStepText, selectionStep === 'end' && styles.guideStepTextActive]}>
                                    귀국: {endDate ? formatDisplay(endDate) : '선택 필요'}
                                </Text>
                            </View>
                        </View>

                        <ScrollView>
                            <Calendar
                                startDate={startDate}
                                endDate={endDate}
                                onSelectStart={handleSelectStart}
                                onSelectEnd={handleSelectEnd}
                                selectionStep={selectionStep}
                            />
                        </ScrollView>

                        {/* 하단 확인 버튼 */}
                        {startDate && endDate && (
                            <TouchableOpacity
                                style={styles.modalConfirmBtn}
                                onPress={() => setCalendarVisible(false)}
                            >
                                <Text style={styles.modalConfirmText}>
                                    선택 완료 ({tripDays}일 여행)
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ──────────────────────────────────
// 캘린더 스타일
// ──────────────────────────────────
const calStyles = StyleSheet.create({
    container: { paddingHorizontal: 12, paddingTop: 8 },
    nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    navBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    navArrow: { fontSize: 28, color: '#5B67CA', fontWeight: '300' },
    navTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
    weekRow: { flexDirection: 'row', marginBottom: 4 },
    weekLabel: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#999', paddingVertical: 4 },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 2 },
    betweenCell: { backgroundColor: '#EEF0FF' },
    selectedCell: { backgroundColor: 'transparent' },
    dayCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    selectedCircle: { backgroundColor: '#5B67CA' },
    dayText: { fontSize: 14, color: '#333', fontWeight: '500' },
    todayText: { color: '#5B67CA', fontWeight: '700' },
    selectedDayText: { color: '#FFF', fontWeight: '700' },
    betweenDayText: { color: '#5B67CA' },
    dayLabel: { fontSize: 9, color: '#5B67CA', fontWeight: '600', marginTop: -2 },
});

// ──────────────────────────────────
// 메인 스타일
// ──────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    backButtonText: { fontSize: 16, color: '#5B67CA', fontWeight: '600' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 28, fontWeight: '700', color: '#1A1A2E', marginHorizontal: 8 },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 60 },
    section: { marginBottom: 24 },
    label: { fontSize: 15, fontWeight: '700', color: '#1A1A2E', marginBottom: 10 },
    input: {
        backgroundColor: '#FFF', borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 13,
        fontSize: 15, borderWidth: 1.5, borderColor: '#E8E8E8', color: '#1A1A2E',
    },
    regionBadge: {
        marginTop: 8, alignSelf: 'flex-start',
        backgroundColor: '#EEF0FF', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 5,
    },
    regionBadgeText: { fontSize: 13, color: '#5B67CA', fontWeight: '600' },

    // 날짜 버튼
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateBtn: {
        flex: 1, backgroundColor: '#FFF', borderRadius: 14,
        borderWidth: 1.5, borderColor: '#E8E8E8',
        paddingHorizontal: 14, paddingVertical: 12,
        alignItems: 'center',
    },
    dateBtnActive: { borderColor: '#5B67CA', backgroundColor: '#F5F6FF' },
    dateBtnLabel: { fontSize: 11, fontWeight: '700', color: '#5B67CA', marginBottom: 4, letterSpacing: 0.5 },
    dateBtnValue: { fontSize: 13, fontWeight: '600', color: '#1A1A2E', textAlign: 'center' },
    dateBtnPlaceholder: { color: '#BBB', fontWeight: '400' },
    dateArrow: { width: 24, alignItems: 'center' },
    dateArrowText: { fontSize: 18, color: '#BBBBCC' },
    tripDaysBadge: {
        marginTop: 10, borderRadius: 10,
        backgroundColor: '#5B67CA', paddingVertical: 7,
        paddingHorizontal: 14, alignSelf: 'flex-start',
    },
    tripDaysText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

    // 칩
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
        backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E8E8E8',
    },
    chipActive: { backgroundColor: '#5B67CA', borderColor: '#5B67CA' },
    chipText: { fontSize: 14, color: '#666' },
    chipTextActive: { color: '#FFF', fontWeight: '600' },

    // 생성 버튼
    generateBtn: {
        backgroundColor: '#5B67CA', borderRadius: 16,
        paddingVertical: 16, alignItems: 'center', marginTop: 8,
        shadowColor: '#5B67CA', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    generateBtnDisabled: { opacity: 0.7 },
    generateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    generatingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

    // 모달
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingBottom: 32, maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    modalTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
    modalCloseBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#F0F1F5' },
    modalCloseText: { fontSize: 14, color: '#5B67CA', fontWeight: '700' },
    selectionGuide: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#F8F9FE', gap: 8,
    },
    guideStep: {
        flex: 1, paddingVertical: 8, paddingHorizontal: 12,
        borderRadius: 10, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E8E8E8',
        alignItems: 'center',
    },
    guideStepActive: { borderColor: '#5B67CA', backgroundColor: '#EEF0FF' },
    guideStepText: { fontSize: 12, color: '#999', fontWeight: '500', textAlign: 'center' },
    guideStepTextActive: { color: '#5B67CA', fontWeight: '700' },
    guideArrow: { fontSize: 18, color: '#BBBBCC' },
    modalConfirmBtn: {
        marginHorizontal: 16, marginTop: 12, backgroundColor: '#5B67CA',
        borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    },
    modalConfirmText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default PlannerGenerateScreen;

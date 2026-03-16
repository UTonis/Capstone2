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
    Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import {
    generateItinerary,
    generateWithPhoto,
    FullAnalysisResponse,
    GenerateWithPhotoRequest,
} from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface PlannerGenerateScreenProps {
    onBack: () => void;
    onSuccess: () => void;
    onNavigateToDetail: (tripId: number, title: string) => void;
    onNavigateToLogin?: () => void;
    initialData?: FullAnalysisResponse;
}

const THEMES = ['맛집', '자연', '힐링', '문화', '액티비티', '쇼핑', '카페', '야경', '역사', '축제'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DateObj {
    year: number;
    month: number;
    day: number;
}

const SCENE_TO_THEME_MAP: Record<string, string[]> = {
    'beach': ['자연'],
    'mountain': ['자연'],
    'nature': ['자연'],
    'forest': ['자연'],
    'historical': ['역사', '문화'],
    'temple': ['역사'],
    'castle': ['역사'],
    'nightview': ['야경'],
    'cityview': ['야경'],
    'skyscraper': ['야경'],
    'culture': ['문화'],
    'museum': ['문화'],
    'art': ['문화'],
    'food': ['맛집'],
    'restaurant': ['맛집'],
    'cafe': ['카페'],
    'park': ['힐링', '자연'],
    'resort': ['힐링'],
    'activity': ['액티비티'],
    'sport': ['액티비티'],
    'shopping': ['쇼핑'],
    'market': ['쇼핑'],
    'festival': ['축제'],
};

// ──────────────────────────────────
// 날짜 유틸리티
// ──────────────────────────────────
function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month - 1, 1).getDay();
}

function getDayOfWeekName(year: number, month: number, day: number): string {
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    return dayNames[new Date(year, month - 1, day).getDay()];
}

function isSameDate(d1?: DateObj | null, d2?: DateObj | null): boolean {
    if (!d1 || !d2) return false;
    return d1.year === d2.year && d1.month === d2.month && d1.day === d2.day;
}

function isDateInRange(target: DateObj, start?: DateObj | null, end?: DateObj | null): boolean {
    if (!start || !end) return false;

    const t = new Date(target.year, target.month - 1, target.day).getTime();
    const s = new Date(start.year, start.month - 1, start.day).getTime();
    const e = new Date(end.year, end.month - 1, end.day).getTime();

    // start와 end 중 빠른 날짜, 늦은 날짜 판별
    const min = Math.min(s, e);
    const max = Math.max(s, e);

    return t >= min && t <= max;
}

function toDateStr(d: DateObj | null): string {
    if (!d) return '';
    return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
}

function parseDateObj(str: string): DateObj | null {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    if (!y || !m || !d) return null;
    return { year: y, month: m, day: d };
}

function formatDisplay(str: string): string {
    const d = parseDateObj(str);
    if (!d) return '';
    return `${d.month.toString().padStart(2, '0')}.${d.day.toString().padStart(2, '0')} (${getDayOfWeekName(d.year, d.month, d.day)})`;
}

// ──────────────────────────────────
// Range Calendar 컴포넌트
// ──────────────────────────────────
interface CalendarProps {
    startDateStr: string;
    endDateStr: string;
    onSelectStart: (dateStr: string) => void;
    onSelectEnd: (dateStr: string) => void;
    selectionStep: 'start' | 'end';
}

function Calendar({ startDateStr, endDateStr, onSelectStart, onSelectEnd, selectionStep }: CalendarProps) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

    const startDate = parseDateObj(startDateStr);
    const endDate = parseDateObj(endDateStr);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    // 날짜 배열 생성
    const calendarDays = React.useMemo(() => {
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
        if (viewMonth === 1) { setViewYear(viewYear - 1); setViewMonth(12); }
        else { setViewMonth(viewMonth - 1); }
    };
    const goToNextMonth = () => {
        if (viewMonth === 12) { setViewYear(viewYear + 1); setViewMonth(1); }
        else { setViewMonth(viewMonth + 1); }
    };

    const getDayStyle = (day: number) => {
        const date: DateObj = { year: viewYear, month: viewMonth, day };
        const isStart = isSameDate(date, startDate);
        const isEnd = isSameDate(date, endDate);
        const inRange = isDateInRange(date, startDate, endDate);
        return { isStart, isEnd, inRange };
    };

    const handleDayPress = (day: number) => {
        const date: DateObj = { year: viewYear, month: viewMonth, day };
        const dateStr = toDateStr(date);

        if (selectionStep === 'start') {
            onSelectStart(dateStr);
        } else {
            // 시작일보다 이전 날짜를 선택하면, 해당 날짜를 시작일로 변경
            if (startDate) {
                const sTime = new Date(startDate.year, startDate.month - 1, startDate.day).getTime();
                const tTime = new Date(date.year, date.month - 1, date.day).getTime();
                if (tTime < sTime) {
                    onSelectStart(dateStr);
                    return;
                }
            }
            onSelectEnd(dateStr);
        }
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
                    if (day === null) return <View key={index} style={calStyles.dayCell} />;

                    const { isStart, isEnd, inRange } = getDayStyle(day);
                    const colIndex = index % 7;

                    return (
                        <View key={index} style={calStyles.dayCell}>
                            {inRange && !isStart && !isEnd && <View style={calStyles.rangeBg} />}
                            {isStart && endDate && !isSameDate(startDate, endDate) && (
                                <View style={[calStyles.rangeBg, calStyles.rangeBgRight]} />
                            )}
                            {isEnd && startDate && !isSameDate(startDate, endDate) && (
                                <View style={[calStyles.rangeBg, calStyles.rangeBgLeft]} />
                            )}

                            <TouchableOpacity
                                style={[
                                    calStyles.dayButton,
                                    (isStart || isEnd) && calStyles.dayButtonSelected,
                                ]}
                                onPress={() => handleDayPress(day)}
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

// ──────────────────────────────────
// 메인 화면
// ──────────────────────────────────
function PlannerGenerateScreen({ onBack, onSuccess, onNavigateToDetail, onNavigateToLogin, initialData }: PlannerGenerateScreenProps) {
    const insets = useSafeAreaInsets();
    const { token, showAlert } = useAuth();
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
                const matchedSet = new Set<string>();
                initialData.scene.scene_type.forEach((t: string) => {
                    const koreanThemes = SCENE_TO_THEME_MAP[t.toLowerCase()];
                    if (koreanThemes) {
                        koreanThemes.forEach(kt => {
                            if (THEMES.includes(kt)) {
                                matchedSet.add(kt);
                            }
                        });
                    }
                });
                setSelectedThemes(Array.from(matchedSet));
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
            showAlert('알림', '먼저 시작일을 선택해주세요.');
            return;
        }
        setSelectionStep('end');
        setCalendarVisible(true);
    };

    const handleGenerate = async (usePhotoThemes = false) => {
        if (!token) {
            showAlert(
                '알림',
                '로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    { text: '이동', onPress: () => onNavigateToLogin?.() }
                ]
            );
            return;
        }
        if (!title.trim()) { showAlert('알림', '여행 제목을 입력해주세요.'); return; }
        if (!region.trim()) { showAlert('알림', '여행 지역을 입력해주세요.'); return; }
        if (!startDate || !endDate) { showAlert('알림', '여행 날짜를 선택해주세요.'); return; }

        try {
            setGenerating(true);

            // 사진 분석 결과가 있으면 generate-with-photo 사용 (지역 불일치 체크 포함)
            // Type C는 city가 없어도 scene_type이 있으면 generateWithPhoto 진입
            if (initialData?.location?.city || (initialData?.scene?.scene_type && initialData.scene.scene_type.length > 0)) {
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
                    image_path: initialData.image_path,
                    image_url: (initialData as any).image_url || initialData.image_path,
                };
                console.log('Generating with Photo Request:', JSON.stringify(photoReq, null, 2));

                const photoRes = await generateWithPhoto(token, photoReq);

                if (photoRes.needs_clarification) {
                    // 지역 불일치 → 사용자에게 확인
                    setGenerating(false);
                    showAlert(
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
                    showAlert(
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
            showAlert(
                '완료',
                'AI가 여행 일정을 생성했습니다!\n생성된 일정을 먼저 확인하고, 필요시 AI와 대화하며 수정할 수 있습니다.',
                [{ text: '확인', onPress: () => onNavigateToDetail(response.trip_id, title.trim()) }]
            );
        } catch (err: any) {
            const msg = err?.message || '알 수 없는 오류';
            showAlert('오류', `일정 생성에 실패했습니다.\n\n${msg}`);
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
                            <Text style={styles.dateBtnLabel}>도착</Text>
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
                                {selectionStep === 'start' ? '🛫 출발일 선택' : '🛬 도착일 선택'}
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
                                    도착: {endDate ? formatDisplay(endDate) : '선택 필요'}
                                </Text>
                            </View>
                        </View>

                        <ScrollView>
                            <Calendar
                                startDateStr={startDate}
                                endDateStr={endDate}
                                onSelectStart={handleSelectStart}
                                onSelectEnd={handleSelectEnd}
                                selectionStep={selectionStep}
                            />
                        </ScrollView>

                        {/* 하단 확인 버튼 */}
                        <TouchableOpacity
                            style={[
                                styles.modalConfirmBtn,
                                (!startDate || !endDate) && styles.modalConfirmBtnDisabled,
                            ]}
                            onPress={() => setCalendarVisible(false)}
                            disabled={!startDate || !endDate}
                        >
                            <Text style={styles.modalConfirmText}>
                                {startDate && endDate ? `선택 완료 (${tripDays}일 여행)` : '날짜를 모두 선택해주세요'}
                            </Text>
                        </TouchableOpacity>
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
        width: '14.28%',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    rangeBg: {
        position: 'absolute',
        height: 34,
        top: '50%',
        marginTop: -17,
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
        fontWeight: '500',
    },
    sundayText: {
        color: '#E74C3C',
    },
    saturdayText: {
        color: '#5B67CA',
    },
    dayTextSelected: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    dayTextInRange: {
        color: '#5B67CA',
    },
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
    modalConfirmBtnDisabled: {
        backgroundColor: '#D4D4D4',
    },
    modalConfirmText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default PlannerGenerateScreen;

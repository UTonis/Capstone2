/**
 * PlannerGenerateScreen - AI 여행 일정 자동 생성 화면
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
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { generateItinerary, FullAnalysisResponse } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';

interface PlannerGenerateScreenProps {
    onBack: () => void;
    onSuccess: () => void;
    onNavigateToDetail: (tripId: number, title: string) => void;
    initialData?: FullAnalysisResponse;
}

const REGIONS = ['서울', '부산', '제주', '경주', '강릉', '여수', '전주', '인천', '대구', '대전'];
const THEMES = ['맛집', '자연', '힐링', '문화', '액티비티', '쇼핑', '카페', '야경', '역사', '축제'];

function PlannerGenerateScreen({ onBack, onSuccess, onNavigateToDetail, initialData }: PlannerGenerateScreenProps) {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const [title, setTitle] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [budgetLevel, setBudgetLevel] = useState<'low' | 'medium' | 'high'>('medium');
    const [generating, setGenerating] = useState(false);

    /**
     * 입력된 날짜 문자열을 YYYY-MM-DD 형식으로 정규화
     * 지원 형식: YYYYMMDD, YYYY.MM.DD, YYYY-MM-DD, YYMMDD 등
     */
    const normalizeDate = (dateStr: string): string => {
        // 숫자만 추출
        const digits = dateStr.replace(/\D/g, '');

        if (digits.length === 8) {
            // YYYYMMDD -> YYYY-MM-DD
            return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
        } else if (digits.length === 6) {
            // YYMMDD -> 20YY-MM-DD
            return `20${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 6)}`;
        }

        // 형식이 맞지 않으면 입력값 그대로 반환 (백엔드 validation에 맡김)
        return dateStr;
    };

    useEffect(() => {
        if (initialData && initialData.location) {
            const { city, landmark } = initialData.location;

            if (city && REGIONS.includes(city)) {
                setSelectedRegion(city);
            } else if (city) {
                // If it's a specific city not in our simplified list, maybe we should just set it or handled it
                // For now, let's just use it if it's there
                // setSelectedRegion(city); 
            }

            if (landmark) {
                setTitle(`${city || ''} ${landmark} 여행`.trim());
            } else if (city) {
                setTitle(`${city} 여행`);
            }

            if (initialData.scene && initialData.scene.scene_type) {
                // Mapping scene_type to our THEMES
                const matchedThemes = initialData.scene.scene_type.filter((t: string) => THEMES.includes(t));
                setSelectedThemes(matchedThemes);
            }
        }
    }, [initialData]);

    const toggleTheme = (theme: string) => {
        setSelectedThemes(prev =>
            prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
        );
    };

    const handleGenerate = async () => {
        if (!token) { Alert.alert('알림', '로그인이 필요합니다.'); return; }
        if (!title.trim()) { Alert.alert('알림', '여행 제목을 입력해주세요.'); return; }
        if (!selectedRegion) { Alert.alert('알림', '여행 지역을 선택해주세요.'); return; }
        if (!startDate || !endDate) { Alert.alert('알림', '여행 날짜를 입력해주세요.'); return; }

        try {
            setGenerating(true);

            // 날짜 정규화 적용
            const cleanStartDate = normalizeDate(startDate);
            const cleanEndDate = normalizeDate(endDate);

            const response = await generateItinerary(token, {
                title: title.trim(),
                region: selectedRegion,
                start_date: cleanStartDate,
                end_date: cleanEndDate,
                budget_level: budgetLevel,
                themes: selectedThemes.length > 0 ? selectedThemes : undefined,
            });
            Alert.alert('완료', 'AI가 여행 일정을 생성했습니다!\n생성된 일정을 먼저 확인하고, 필요시 AI와 대화하며 수정할 수 있습니다.', [
                { text: '확인', onPress: () => onNavigateToDetail(response.trip_id, title.trim()) },
            ]);
        } catch (err) {
            Alert.alert('오류', '일정 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI 일정 생성</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* 여행 제목 */}
                <View style={styles.section}>
                    <Text style={styles.label}>여행 제목</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="예: 부산 2박3일 여행"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* 지역 선택 */}
                <View style={styles.section}>
                    <Text style={styles.label}>여행 지역</Text>
                    <View style={styles.chipWrap}>
                        {REGIONS.map(r => (
                            <TouchableOpacity
                                key={r}
                                style={[styles.chip, selectedRegion === r && styles.chipActive]}
                                onPress={() => setSelectedRegion(r)}
                            >
                                <Text style={[styles.chipText, selectedRegion === r && styles.chipTextActive]}>{r}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 날짜 입력 */}
                <View style={styles.section}>
                    <Text style={styles.label}>여행 날짜</Text>
                    <View style={styles.dateRow}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="시작일 (예: 20240224)"
                            value={startDate}
                            onChangeText={setStartDate}
                            keyboardType="numeric"
                        />
                        <Text style={styles.dateSep}>~</Text>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="종료일"
                            value={endDate}
                            onChangeText={setEndDate}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* 예산 수준 */}
                <View style={styles.section}>
                    <Text style={styles.label}>예산 수준</Text>
                    <View style={styles.chipWrap}>
                        {[
                            { val: 'low' as const, label: '💰 절약' },
                            { val: 'medium' as const, label: '💰💰 보통' },
                            { val: 'high' as const, label: '💰💰💰 여유' },
                        ].map(b => (
                            <TouchableOpacity
                                key={b.val}
                                style={[styles.chip, budgetLevel === b.val && styles.chipActive]}
                                onPress={() => setBudgetLevel(b.val)}
                            >
                                <Text style={[styles.chipText, budgetLevel === b.val && styles.chipTextActive]}>{b.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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
                    onPress={handleGenerate}
                    disabled={generating}
                >
                    {generating ? (
                        <View style={styles.generatingRow}>
                            <ActivityIndicator size="small" color="#FFF" />
                            <Text style={styles.generateBtnText}>AI가 일정을 생성하는 중...</Text>
                        </View>
                    ) : (
                        <Text style={styles.generateBtnText}>🤖 AI 일정 생성하기</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backText: { fontSize: 16, color: '#5B67CA', fontWeight: '600' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    section: { marginBottom: 24 },
    label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 10 },
    input: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#E8E8E8' },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateSep: { fontSize: 16, color: '#999' },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E8E8E8' },
    chipActive: { backgroundColor: '#5B67CA', borderColor: '#5B67CA' },
    chipText: { fontSize: 14, color: '#666' },
    chipTextActive: { color: '#FFF' },
    generateBtn: { backgroundColor: '#5B67CA', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    generateBtnDisabled: { opacity: 0.7 },
    generateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    generatingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

export default PlannerGenerateScreen;

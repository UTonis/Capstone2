/**
 * PreferenceSurveyScreen - 여행 선호도 설정 화면
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { savePreference, getPreference, PreferenceSurvey } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PreferenceSurveyScreenProps {
    onBack: () => void;
}

const THEMES = ['맛집', '자연', '힐링', '문화', '액티비티', '쇼핑', '카페', '야경', '역사', '축제', '사진', '호텔'];
const CATEGORIES: { key: string; label: string; emoji: string }[] = [
    { key: 'restaurant', label: '맛집', emoji: '🍽️' },
    { key: 'cafe', label: '카페', emoji: '☕' },
    { key: 'nature', label: '자연', emoji: '🌿' },
    { key: 'culture', label: '문화', emoji: '🏛️' },
    { key: 'activity', label: '액티비티', emoji: '🎯' },
    { key: 'shopping', label: '쇼핑', emoji: '🛍️' },
    { key: 'nightlife', label: '야경/밤', emoji: '🌙' },
];

function PreferenceSurveyScreen({ onBack }: PreferenceSurveyScreenProps) {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const [preferredThemes, setPreferredThemes] = useState<string[]>([]);
    const [travelPace, setTravelPace] = useState<'relaxed' | 'moderate' | 'packed'>('moderate');
    const [budgetLevel, setBudgetLevel] = useState<'low' | 'medium' | 'high'>('medium');
    const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!token) { setLoading(false); return; }
            try {
                const pref = await getPreference(token);
                if (pref) {
                    setPreferredThemes(pref.preferred_themes || []);
                    setTravelPace((pref.travel_pace as 'relaxed' | 'moderate' | 'packed') || 'moderate');
                    setBudgetLevel((pref.budget_level as 'low' | 'medium' | 'high') || 'medium');
                    setCategoryRatings(pref.category_weights || {});
                }
            } catch (err) {
                console.log('선호도 로드 실패:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token]);

    const toggleTheme = (theme: string) => {
        setPreferredThemes(prev =>
            prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
        );
    };

    const setCategoryRating = (key: string, weight: number) => {
        setCategoryRatings(prev => ({ ...prev, [key]: weight }));
    };

    const handleSave = async () => {
        if (!token) { Alert.alert('알림', '로그인이 필요합니다.'); return; }
        try {
            setSaving(true);
            const survey: PreferenceSurvey = {
                preferred_themes: preferredThemes,
                travel_pace: travelPace,
                budget_level: budgetLevel,
                category_ratings: categoryRatings,
            };
            await savePreference(token, survey);
            Alert.alert('완료', '선호도가 저장되었습니다.', [
                { text: '확인', onPress: onBack },
            ]);
        } catch (err) {
            Alert.alert('오류', '저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#5B67CA" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>여행 선호도 설정</Text>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {/* 선호 테마 */}
                <View style={styles.section}>
                    <Text style={styles.label}>선호하는 여행 테마</Text>
                    <Text style={styles.subLabel}>관심 있는 테마를 모두 선택해주세요</Text>
                    <View style={styles.chipWrap}>
                        {THEMES.map(t => (
                            <TouchableOpacity
                                key={t}
                                style={[styles.chip, preferredThemes.includes(t) && styles.chipActive]}
                                onPress={() => toggleTheme(t)}
                            >
                                <Text style={[styles.chipText, preferredThemes.includes(t) && styles.chipTextActive]}>#{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 여행 속도 */}
                <View style={styles.section}>
                    <Text style={styles.label}>여행 속도</Text>
                    <View style={styles.chipWrap}>
                        {[
                            { val: 'relaxed' as const, label: '🐢 여유롭게', desc: '하루 2~3곳' },
                            { val: 'moderate' as const, label: '🚶 보통', desc: '하루 4~5곳' },
                            { val: 'packed' as const, label: '🏃 빡빡하게', desc: '하루 6곳 이상' },
                        ].map(p => (
                            <TouchableOpacity
                                key={p.val}
                                style={[styles.paceCard, travelPace === p.val && styles.paceCardActive]}
                                onPress={() => setTravelPace(p.val)}
                            >
                                <Text style={[styles.paceLabel, travelPace === p.val && styles.paceLabelActive]}>{p.label}</Text>
                                <Text style={[styles.paceDesc, travelPace === p.val && styles.paceDescActive]}>{p.desc}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 예산 */}
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

                {/* 카테고리 가중치 */}
                <View style={styles.section}>
                    <Text style={styles.label}>카테고리 관심도</Text>
                    <Text style={styles.subLabel}>각 카테고리에 대한 관심도를 설정해주세요</Text>
                    {CATEGORIES.map(cat => (
                        <View key={cat.key} style={styles.weightRow}>
                            <Text style={styles.weightLabel}>{cat.emoji} {cat.label}</Text>
                            <View style={styles.weightBtns}>
                                {[1, 2, 3, 4, 5].map(w => (
                                    <TouchableOpacity
                                        key={w}
                                        style={[styles.weightBtn, (categoryRatings[cat.key] || 0) >= w && styles.weightBtnActive]}
                                        onPress={() => setCategoryRating(cat.key, w)}
                                    >
                                        <Text style={[styles.weightBtnText, (categoryRatings[cat.key] || 0) >= w && styles.weightBtnTextActive]}>★</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>

                {/* 저장 버튼 */}
                <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>저장하기</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backText: { fontSize: 16, color: '#5B67CA', fontWeight: '600' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 28, fontWeight: '700', color: '#1A1A2E', marginHorizontal: 8 },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 40 },
    section: { marginBottom: 28 },
    label: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
    subLabel: { fontSize: 13, color: '#999', marginBottom: 10 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E8E8E8' },
    chipActive: { backgroundColor: '#5B67CA', borderColor: '#5B67CA' },
    chipText: { fontSize: 14, color: '#666' },
    chipTextActive: { color: '#FFF' },
    paceCard: { flex: 1, minWidth: 90, padding: 12, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E8E8E8', alignItems: 'center' },
    paceCardActive: { backgroundColor: '#5B67CA', borderColor: '#5B67CA' },
    paceLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
    paceLabelActive: { color: '#FFF' },
    paceDesc: { fontSize: 11, color: '#999', marginTop: 4 },
    paceDescActive: { color: '#DDD' },
    weightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    weightLabel: { fontSize: 15, color: '#333' },
    weightBtns: { flexDirection: 'row', gap: 4 },
    weightBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
    weightBtnActive: { backgroundColor: '#FFB74D' },
    weightBtnText: { fontSize: 14, color: '#CCC' },
    weightBtnTextActive: { color: '#FFF' },
    saveBtn: { backgroundColor: '#5B67CA', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default PreferenceSurveyScreen;

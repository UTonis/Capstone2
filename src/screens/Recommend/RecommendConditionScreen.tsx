/**
 * RecommendConditionScreen - 조건 기반 여행지 추천 화면
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    FlatList,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { recommendByCondition, ConditionRecommendResponse, PopularPlace } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RecommendConditionScreenProps {
    onBack: () => void;
}

const REGIONS = ['서울', '부산', '제주', '경주', '강릉', '여수', '전주', '인천', '대구', '대전', '속초', '통영'];
const THEMES = ['맛집', '자연', '힐링', '문화', '액티비티', '쇼핑', '카페', '야경', '역사', '축제'];
const CATEGORIES = ['관광지', '음식점', '카페', '숙박', '쇼핑', '레저', '문화시설'];

function RecommendConditionScreen({ onBack }: RecommendConditionScreenProps) {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [budgetLevel, setBudgetLevel] = useState<'low' | 'medium' | 'high' | ''>('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<PopularPlace[] | null>(null);

    const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
        setter(list.includes(item) ? list.filter(t => t !== item) : [...list, item]);
    };

    const handleSearch = async () => {
        if (!token) { Alert.alert('알림', '로그인이 필요합니다.'); return; }
        try {
            setLoading(true);
            const res = await recommendByCondition(token, {
                region: selectedRegion || undefined,
                themes: selectedThemes.length > 0 ? selectedThemes : undefined,
                categories: selectedCategories.length > 0 ? selectedCategories : undefined,
                budget_level: budgetLevel || undefined,
                limit: 20,
            });
            setResults(res.places);
            if (res.places.length === 0) {
                Alert.alert('결과', '조건에 맞는 여행지가 없습니다. 조건을 변경해보세요.');
            }
        } catch (err) {
            Alert.alert('오류', '추천 요청에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const renderPlace = ({ item }: { item: PopularPlace }) => (
        <View style={styles.placeCard}>
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.placeImage} resizeMode="cover" />
            ) : (
                <View style={[styles.placeImage, { backgroundColor: '#EEF0FF', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 24 }}>📍</Text>
                </View>
            )}
            <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{item.name}</Text>
                <Text style={styles.placeCategory}>{item.category}</Text>
                <Text style={styles.placeAddress} numberOfLines={1}>{item.address}</Text>
                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagRow}>
                        {item.tags.slice(0, 3).map((tag, idx) => (
                            <Text key={idx} style={styles.tag}>#{tag}</Text>
                        ))}
                    </View>
                )}
                {item.reason && (
                    <Text style={styles.reason}>💡 {item.reason}</Text>
                )}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack}>
                    <Text style={styles.backText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>조건별 추천</Text>
                <View style={{ width: 50 }} />
            </View>

            {!results ? (
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                    {/* 지역 */}
                    <View style={styles.section}>
                        <Text style={styles.label}>지역</Text>
                        <View style={styles.chipWrap}>
                            {REGIONS.map(r => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.chip, selectedRegion === r && styles.chipActive]}
                                    onPress={() => setSelectedRegion(selectedRegion === r ? '' : r)}
                                >
                                    <Text style={[styles.chipText, selectedRegion === r && styles.chipTextActive]}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 테마 */}
                    <View style={styles.section}>
                        <Text style={styles.label}>테마</Text>
                        <View style={styles.chipWrap}>
                            {THEMES.map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.chip, selectedThemes.includes(t) && styles.chipActive]}
                                    onPress={() => toggleItem(t, selectedThemes, setSelectedThemes)}
                                >
                                    <Text style={[styles.chipText, selectedThemes.includes(t) && styles.chipTextActive]}>#{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 카테고리 */}
                    <View style={styles.section}>
                        <Text style={styles.label}>카테고리</Text>
                        <View style={styles.chipWrap}>
                            {CATEGORIES.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[styles.chip, selectedCategories.includes(c) && styles.chipActive]}
                                    onPress={() => toggleItem(c, selectedCategories, setSelectedCategories)}
                                >
                                    <Text style={[styles.chipText, selectedCategories.includes(c) && styles.chipTextActive]}>{c}</Text>
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
                                    onPress={() => setBudgetLevel(budgetLevel === b.val ? '' : b.val)}
                                >
                                    <Text style={[styles.chipText, budgetLevel === b.val && styles.chipTextActive]}>{b.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 검색 버튼 */}
                    <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Text style={styles.searchBtnText}>🔍 추천 받기</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={styles.resultHeader}>
                        <Text style={styles.resultCount}>{results.length}개의 추천 결과</Text>
                        <TouchableOpacity onPress={() => setResults(null)}>
                            <Text style={{ color: '#5B67CA', fontWeight: '600' }}>조건 변경</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={results}
                        renderItem={renderPlace}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
                    />
                </View>
            )}
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
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E8E8E8' },
    chipActive: { backgroundColor: '#5B67CA', borderColor: '#5B67CA' },
    chipText: { fontSize: 14, color: '#666' },
    chipTextActive: { color: '#FFF' },
    searchBtn: { backgroundColor: '#5B67CA', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    searchBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF' },
    resultCount: { fontSize: 15, fontWeight: '600', color: '#333' },
    placeCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, marginBottom: 10, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    placeImage: { width: 100, height: 120 },
    placeInfo: { flex: 1, padding: 12, justifyContent: 'center' },
    placeName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
    placeCategory: { fontSize: 12, color: '#5B67CA', marginBottom: 2 },
    placeAddress: { fontSize: 12, color: '#999', marginBottom: 6 },
    tagRow: { flexDirection: 'row', gap: 6 },
    tag: { fontSize: 11, color: '#5B67CA', backgroundColor: '#EEF0FF', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
    reason: { fontSize: 12, color: '#FF8C00', marginTop: 4 },
});

export default RecommendConditionScreen;

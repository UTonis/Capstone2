/**
 * BoardWriteScreen - 게시글 작성 화면
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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BoardWriteScreenProps {
    onBack: () => void;
    onSuccess: () => void;
}

const REGIONS = ['서울', '부산', '제주', '경주', '강릉', '여수', '전주', '인천', '대구', '대전', '속초', '통영'];
const TAGS_LIST = ['맛집', '자연', '힐링', '액티비티', '문화', '쇼핑', '야경', '카페', '호텔', '축제', '역사', '사진', '가족', '커플', '솔로'];

function BoardWriteScreen({ onBack, onSuccess }: BoardWriteScreenProps) {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) return prev.filter(t => t !== tag);
            if (prev.length >= 5) { Alert.alert('알림', '태그는 최대 5개까지 선택 가능합니다.'); return prev; }
            return [...prev, tag];
        });
    };

    const handleSubmit = async () => {
        if (!token) { Alert.alert('알림', '로그인이 필요합니다.'); return; }
        if (!title.trim()) { Alert.alert('알림', '제목을 입력해주세요.'); return; }
        if (!content.trim()) { Alert.alert('알림', '내용을 입력해주세요.'); return; }

        try {
            setSubmitting(true);
            await createPost(token, {
                title: title.trim(),
                content: content.trim(),
                region: selectedRegion || undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
            });
            Alert.alert('완료', '게시글이 등록되었습니다.', [
                { text: '확인', onPress: onSuccess },
            ]);
        } catch (err) {
            Alert.alert('오류', '게시글 등록에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={styles.cancelText}>취소</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>후기 작성</Text>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting || !title.trim() || !content.trim()}
                        style={[styles.submitBtn, (submitting || !title.trim() || !content.trim()) && styles.submitBtnDisabled]}
                    >
                        {submitting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.submitText}>등록</Text>}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />

                    {/* 지역 선택 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>여행 지역</Text>
                        <View style={styles.chipWrap}>
                            {REGIONS.map(region => (
                                <TouchableOpacity
                                    key={region}
                                    style={[styles.chip, selectedRegion === region && styles.chipActive]}
                                    onPress={() => setSelectedRegion(selectedRegion === region ? '' : region)}
                                >
                                    <Text style={[styles.chipText, selectedRegion === region && styles.chipTextActive]}>{region}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 태그 선택 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>태그 (최대 5개)</Text>
                        <View style={styles.chipWrap}>
                            {TAGS_LIST.map(tag => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[styles.chip, selectedTags.includes(tag) && styles.chipActive]}
                                    onPress={() => toggleTag(tag)}
                                >
                                    <Text style={[styles.chipText, selectedTags.includes(tag) && styles.chipTextActive]}>#{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 본문 */}
                    <TextInput
                        style={styles.contentInput}
                        placeholder="여행 후기를 자유롭게 작성해주세요..."
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                    />
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    cancelText: { fontSize: 16, color: '#999' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
    submitBtn: { backgroundColor: '#5B67CA', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6 },
    submitBtnDisabled: { opacity: 0.5 },
    submitText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
    scroll: { flex: 1 },
    scrollContent: { padding: 16 },
    titleInput: { fontSize: 20, fontWeight: '700', color: '#1A1A2E', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 12, marginBottom: 16 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 10 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F0F1F5' },
    chipActive: { backgroundColor: '#5B67CA' },
    chipText: { fontSize: 14, color: '#666' },
    chipTextActive: { color: '#FFF' },
    contentInput: { fontSize: 15, color: '#333', lineHeight: 24, minHeight: 200 },
});

export default BoardWriteScreen;

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
    Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { createPost, uploadImage } from '../../services/api';
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
    const [localImages, setLocalImages] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleAddImage = () => {
        launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 }, (response) => {
            if (response.assets) {
                const uris = response.assets.map(asset => asset.uri).filter(Boolean) as string[];
                setLocalImages(prev => [...prev, ...uris]);
            }
        });
    };

    const removeImage = (index: number) => {
        setLocalImages(prev => prev.filter((_, i) => i !== index));
    };

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

            // 이미지 먼저 업로드
            const imageUrls: string[] = [];
            for (const uri of localImages) {
                const url = await uploadImage(token, uri);
                imageUrls.push(url);
            }

            await createPost(token, {
                title: title.trim(),
                content: content.trim(),
                region: selectedRegion || undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
                image_urls: imageUrls,
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
                        <Text style={styles.backButtonText}>뒤로</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>게시글 작성</Text>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting || !title.trim() || !content.trim()}
                        style={styles.headerBtn}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#35C5F0" />
                        ) : (
                            <Text style={[styles.submitText, (submitting || !title.trim() || !content.trim()) && styles.submitTextDisabled]}>등록</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
                    keyboardShouldPersistTaps="handled"
                >
                    <TextInput
                        style={styles.titleInput}
                        placeholder="제목을 입력하세요"
                        placeholderTextColor="#BDBDBD"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />

                    {/* 지역 선택 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>어디로 다녀오셨나요?</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipWrap}>
                            {REGIONS.map(region => (
                                <TouchableOpacity
                                    key={region}
                                    style={[styles.chip, selectedRegion === region && styles.chipActive]}
                                    onPress={() => setSelectedRegion(selectedRegion === region ? '' : region)}
                                >
                                    <Text style={[styles.chipText, selectedRegion === region && styles.chipTextActive]}>{region}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 구분선 */}
                    <View style={styles.divider} />

                    {/* 태그 선택 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>키워드를 선택해주세요 (최대 5개)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipWrap}>
                            {TAGS_LIST.map(tag => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[styles.chip, selectedTags.includes(tag) && styles.chipActive]}
                                    onPress={() => toggleTag(tag)}
                                >
                                    <Text style={[styles.chipText, selectedTags.includes(tag) && styles.chipTextActive]}>#{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 구분선 */}
                    <View style={styles.divider} />

                    {/* 파일 버튼 (사진 추가) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>사진</Text>
                        <View style={styles.imageContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <TouchableOpacity style={styles.fileBtn} onPress={handleAddImage}>
                                    <Text style={styles.fileBtnIcon}>+</Text>
                                    <Text style={styles.fileBtnText}>파일</Text>
                                </TouchableOpacity>
                                {localImages.map((uri, idx) => (
                                    <View key={idx} style={styles.imagePreviewWrap}>
                                        <Image source={{ uri }} style={styles.imagePreview} />
                                        <TouchableOpacity style={styles.removePhoto} onPress={() => removeImage(idx)}>
                                            <Text style={styles.removePhotoText}>×</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* 본문 */}
                    <View style={styles.contentSection}>
                        <TextInput
                            style={styles.contentInput}
                            placeholder="이번 여행은 어떠셨나요? 경험을 나눠주세요!"
                            placeholderTextColor="#BDBDBD"
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    headerBtn: { padding: 4, minWidth: 44, alignItems: 'center' },
    backButtonText: { fontSize: 16, color: '#5B67CA', fontWeight: '600' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#262626' },
    submitText: { color: '#0095f6', fontWeight: 'bold', fontSize: 16 },
    submitTextDisabled: { color: '#BDBDBD' },
    scroll: { flex: 1 },
    scrollContent: { paddingVertical: 16 },
    titleInput: {
        fontSize: 22,
        fontWeight: '800',
        color: '#2F3438',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F7F8FA'
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 20,
        marginTop: 24
    },
    section: { marginTop: 24 },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#2F3438', marginBottom: 12, paddingHorizontal: 20 },
    chipWrap: { paddingHorizontal: 16, gap: 8 },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        backgroundColor: '#F7F8FA',
        marginRight: 6
    },
    chipActive: { backgroundColor: '#35C5F0' },
    chipText: { fontSize: 14, color: '#424242', fontWeight: '500' },
    chipTextActive: { color: '#FFF', fontWeight: '700' },
    contentSection: { padding: 20, marginTop: 12, flexGrow: 1 },
    contentInput: { fontSize: 16, color: '#2F3438', lineHeight: 26, minHeight: 250 },
    imageContainer: { paddingHorizontal: 20, marginBottom: 16 },
    fileBtn: {
        width: 80,
        height: 80,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#BDBDBD',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    fileBtnIcon: { fontSize: 24, color: '#BDBDBD', marginBottom: 4 },
    fileBtnText: { fontSize: 13, color: '#BDBDBD', fontWeight: '500' },
    imagePreviewWrap: { marginRight: 10, position: 'relative' },
    imagePreview: { width: 80, height: 80, borderRadius: 4 },
    removePhoto: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    removePhotoText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
});

export default BoardWriteScreen;

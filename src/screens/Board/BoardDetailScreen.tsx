/**
 * BoardDetailScreen - 게시글 상세 화면
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
    TextInput,
    Alert,
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    fetchPostDetail,
    togglePostLike,
    createComment,
    deleteComment,
    BoardPostDetail,
    BoardComment,
} from '../../services/api';

const { width } = Dimensions.get('window');

interface BoardDetailScreenProps {
    postId: number;
    onBack: () => void;
}

function BoardDetailScreen({ postId, onBack }: BoardDetailScreenProps) {
    const insets = useSafeAreaInsets();
    const { token, user } = useAuth();
    const [post, setPost] = useState<BoardPostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadPost = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchPostDetail(postId, token || undefined);
            setPost(data);
        } catch (err) {
            console.log('게시글 로드 실패:', err);
            Alert.alert('오류', '게시글을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    }, [postId, token]);

    useEffect(() => { loadPost(); }, [loadPost]);

    const handleLike = async () => {
        if (!token) { Alert.alert('알림', '로그인이 필요합니다.'); return; }
        try {
            const result = await togglePostLike(token, postId);
            setPost(prev => prev ? { ...prev, is_liked: result.is_liked, like_count: result.like_count } : null);
        } catch (err) {
            console.log('좋아요 실패:', err);
        }
    };

    const handleComment = async () => {
        if (!token) { Alert.alert('알림', '로그인이 필요합니다.'); return; }
        if (!commentText.trim()) return;
        try {
            setSubmitting(true);
            await createComment(token, postId, { content: commentText.trim() });
            setCommentText('');
            loadPost();
        } catch (err) {
            Alert.alert('오류', '댓글 작성에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!token) return;
        Alert.alert('삭제', '댓글을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteComment(token, postId, commentId);
                        loadPost();
                    } catch (err) {
                        Alert.alert('오류', '댓글 삭제에 실패했습니다.');
                    }
                },
            },
        ]);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#5B67CA" />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
                <Text>게시글을 찾을 수 없습니다.</Text>
                <TouchableOpacity onPress={onBack} style={{ marginTop: 16 }}>
                    <Text style={{ color: '#5B67CA' }}>뒤로가기</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={styles.backText}>뒤로</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{post.title}</Text>
                    <View style={{ width: 50 }} />
                </View>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                    {/* 작성자 정보 */}
                    <View style={styles.authorRow}>
                        <View style={styles.avatar}>
                            <Text style={{ fontSize: 20 }}>👤</Text>
                        </View>
                        <View>
                            <Text style={styles.authorName}>{post.author.nickname || '익명'}</Text>
                            <Text style={styles.dateText}>{formatDate(post.created_at)}</Text>
                        </View>
                        {post.region && (
                            <View style={styles.regionBadge}>
                                <Text style={styles.regionText}>📍 {post.region}</Text>
                            </View>
                        )}
                    </View>

                    {/* 이미지 */}
                    {post.images && post.images.length > 0 && (
                        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                            {post.images.map((img, idx) => (
                                <Image key={idx} source={{ uri: img.image_url }} style={styles.postImage} resizeMode="cover" />
                            ))}
                        </ScrollView>
                    )}

                    {/* 본문 */}
                    <Text style={styles.content}>{post.content}</Text>

                    {/* 태그 */}
                    {post.tags && post.tags.length > 0 && (
                        <View style={styles.tagRow}>
                            {post.tags.map((tag, idx) => (
                                <View key={idx} style={styles.tag}>
                                    <Text style={styles.tagText}>#{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* 통계 + 좋아요 */}
                    <View style={styles.statsRow}>
                        <TouchableOpacity onPress={handleLike} style={styles.likeBtn}>
                            <Text style={{ fontSize: 20 }}>{post.is_liked ? '❤️' : '🤍'}</Text>
                            <Text style={styles.statNum}>{post.like_count}</Text>
                        </TouchableOpacity>
                        <Text style={styles.statItem}>💬 {post.comment_count}</Text>
                        <Text style={styles.statItem}>👁️ {post.view_count}</Text>
                    </View>

                    {/* 댓글 목록 */}
                    <View style={styles.commentSection}>
                        <Text style={styles.commentTitle}>댓글 {post.comment_count}개</Text>
                        {post.comments && post.comments.map((comment: BoardComment) => (
                            <View key={comment.id} style={styles.commentItem}>
                                <View style={styles.commentHeader}>
                                    <Text style={styles.commentAuthor}>{comment.author.nickname || '익명'}</Text>
                                    <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
                                    {user && Number(user.id) === comment.author.id && (
                                        <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                                            <Text style={styles.deleteBtn}>삭제</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text style={styles.commentContent}>{comment.content}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* 댓글 입력 */}
                <View style={[styles.commentInput, { paddingBottom: insets.bottom + 8 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="댓글을 입력하세요..."
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!commentText.trim() || submitting) && styles.sendBtnDisabled]}
                        onPress={handleComment}
                        disabled={!commentText.trim() || submitting}
                    >
                        <Text style={styles.sendText}>{submitting ? '...' : '전송'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backText: { fontSize: 16, color: '#5B67CA', fontWeight: '600' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginHorizontal: 8 },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 20 },
    authorRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF0FF', justifyContent: 'center', alignItems: 'center' },
    authorName: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
    dateText: { fontSize: 12, color: '#999', marginTop: 2 },
    regionBadge: { marginLeft: 'auto', backgroundColor: '#EEF0FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    regionText: { fontSize: 12, color: '#5B67CA' },
    imageScroll: { marginTop: 2 },
    postImage: { width: width, height: width * 0.7 },
    content: { padding: 16, fontSize: 15, lineHeight: 24, color: '#333', backgroundColor: '#FFF' },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#FFF' },
    tag: { backgroundColor: '#EEF0FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    tagText: { fontSize: 13, color: '#5B67CA' },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, backgroundColor: '#FFF', marginTop: 8 },
    likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statNum: { fontSize: 14, fontWeight: '600', color: '#333' },
    statItem: { fontSize: 14, color: '#666' },
    commentSection: { marginTop: 8, backgroundColor: '#FFF', padding: 16 },
    commentTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
    commentItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    commentAuthor: { fontSize: 14, fontWeight: '600', color: '#333' },
    commentDate: { fontSize: 12, color: '#999' },
    deleteBtn: { fontSize: 12, color: '#FF6B6B', marginLeft: 'auto' },
    commentContent: { fontSize: 14, color: '#444', lineHeight: 20 },
    commentInput: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    input: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 14, maxHeight: 80 },
    sendBtn: { marginLeft: 8, backgroundColor: '#5B67CA', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
    sendBtnDisabled: { opacity: 0.5 },
    sendText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
});

export default BoardDetailScreen;

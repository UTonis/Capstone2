/**
 * BoardDetailScreen - 게시글 상세 화면
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import HeartIcon from '../../components/HeartIcon';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    fetchPostDetail,
    togglePostLike,
    createComment,
    deleteComment,
    deletePost,
    BoardPostDetail,
    BoardComment,
} from '../../services/api';

const { width } = Dimensions.get('window');

interface BoardDetailScreenProps {
    postId: number;
    onBack: () => void;
    canDeletePost?: boolean;
}

function BoardDetailScreen({ postId, onBack, canDeletePost = false }: BoardDetailScreenProps) {
    const insets = useSafeAreaInsets();
    const { token, user } = useAuth();
    const [post, setPost] = useState<BoardPostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

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

    const handleDeletePost = async () => {
        if (!token) return;
        Alert.alert('게시글 삭제', '정말 이 게시글을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deletePost(token, postId);
                        Alert.alert('삭제 완료', '게시글이 삭제되었습니다.', [
                            { text: '확인', onPress: onBack }
                        ]);
                    } catch (err) {
                        console.error('게시글 삭제 실패:', err);
                        Alert.alert('오류', '게시글 삭제에 실패했습니다.');
                    }
                }
            }
        ]);
    };

    const handleCommentSubmit = async () => {
        if (!token) { Alert.alert('알림', '로그인이 필요합니다.'); return; }
        if (!commentText.trim()) return;
        try {
            setSubmittingComment(true);
            await createComment(token, postId, { content: commentText.trim() });
            setCommentText('');
            loadPost();
        } catch (err) {
            console.error('댓글 작성 상세 오류:', err);
            Alert.alert('오류', '댓글 작성에 실패했습니다.');
        } finally {
            setSubmittingComment(false);
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
                        console.error('댓글 삭제 상세 오류:', err);
                        Alert.alert('오류', '댓글 삭제에 실패했습니다.');
                    }
                },
            },
        ], { cancelable: true });
    };

    const handleScroll = (event: any) => {
        const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
        if (slide !== activeImageIndex) {
            setActiveImageIndex(slide);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
    };

    const renderComment = (comment: BoardComment) => (
        <View key={comment.id} style={styles.commentRow}>
            <View style={styles.commentAvatar}>
                <Text style={{ fontSize: 12 }}>👤</Text>
            </View>
            <View style={styles.commentBody}>
                <View style={styles.commentTop}>
                    <Text style={styles.commentAuthor}>{comment.author.nickname || '익명'}</Text>
                    <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
                </View>
                <Text style={styles.commentTextContent}>{comment.content}</Text>
                {user && Number(user.id) === Number(comment.author.id) && (
                    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)} style={styles.commentDelete}>
                        <Text style={styles.deleteText}>삭제</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

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
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: '#FFF' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* 상단 헤더 */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Text style={styles.backButtonText}>뒤로</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>게시판</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {canDeletePost && user && post && Number(user.id) === Number(post.author.id) && (
                            <TouchableOpacity onPress={handleDeletePost}>
                                <Text style={{ color: '#FF6B6B', fontSize: 16, fontWeight: '600' }}>삭제</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.detailCard}>
                        <View style={styles.badgeRow}>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{post.region || '일상'}</Text>
                            </View>
                        </View>

                        <View style={styles.titleSection}>
                            <Text style={styles.titleText}>{post.title}</Text>
                        </View>

                        <View style={styles.metaRow}>
                            <Text style={styles.metaNickname}>{post.author.nickname || '익명'}</Text>
                            <Text style={styles.metaDot}> · </Text>
                            <Text style={styles.metaRegion}>{post.region || '전국'}</Text>
                            <Text style={styles.metaTime}>{formatDate(post.created_at)}</Text>
                        </View>

                        <View style={styles.contentSection}>
                            <Text style={styles.contentText}>{post.content}</Text>
                        </View>

                        {post.images && post.images.length > 0 && (
                            <View style={styles.imageGallery}>
                                <ScrollView
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    onScroll={handleScroll}
                                    scrollEventThrottle={16}
                                >
                                    {post.images.map((img) => (
                                        <View key={img.id} style={styles.galleryImageContainer}>
                                            <Image
                                                source={{ uri: img.image_url }}
                                                style={styles.galleryImage}
                                                resizeMode="cover"
                                                onError={() => console.log(`이미지 로드 실패: ${img.image_url}`)}
                                            />
                                        </View>
                                    ))}
                                </ScrollView>
                                {post.images.length > 1 && (
                                    <View style={styles.pagination}>
                                        <Text style={styles.paginationText}>{activeImageIndex + 1} / {post.images.length}</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.actionRow}>
                            <View style={styles.buttonGroup}>
                                <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                                    <HeartIcon
                                        filled={post.is_liked}
                                        size={22}
                                        color={post.is_liked ? "#ED4956" : "#333"}
                                    />
                                    <Text style={[styles.actionBtnLabel, post.is_liked && { color: '#ED4956' }, { marginLeft: 6 }]}>좋아요 {post.like_count > 0 && post.like_count}</Text>
                                </TouchableOpacity>
                                <View style={styles.verticalDivider} />
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Text style={styles.actionBtnIcon}>💬</Text>
                                    <Text style={styles.actionBtnLabel}>댓글쓰기 {post.comment_count > 0 && post.comment_count}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.commentSection}>
                        <Text style={styles.commentSectionTitle}>댓글 {post.comments?.length || 0}</Text>
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map(renderComment)
                        ) : (
                            <View style={styles.emptyComment}>
                                <Text style={styles.emptyCommentText}>첫 댓글을 남겨보세요!</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <View style={[styles.bottomInput, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="댓글을 입력하세요..."
                            placeholderTextColor="#999"
                            value={commentText}
                            onChangeText={setCommentText}
                            multiline
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleCommentSubmit}
                            disabled={!commentText.trim() || submittingComment}
                        >
                            {submittingComment ? (
                                <ActivityIndicator size="small" color="#5B67CA" />
                            ) : (
                                <Text style={[styles.sendButtonText, !commentText.trim() && { color: '#CCC' }]}>등록</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F3F7' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    backButton: { paddingRight: 8 },
    backButtonText: { fontSize: 16, color: '#5B67CA', fontWeight: '600' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#2B2B2B' },
    shareBtn: { padding: 4 },
    shareIcon: { fontSize: 24 },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    detailCard: {
        backgroundColor: '#FFFFFF',
        paddingTop: 20,
        marginBottom: 10,
    },
    badgeRow: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#F2F3F7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    titleSection: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        lineHeight: 32,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    metaNickname: { fontSize: 13, color: '#999' },
    metaDot: { fontSize: 13, color: '#DDD' },
    metaRegion: { fontSize: 13, color: '#999', flex: 1 },
    metaTime: { fontSize: 13, color: '#999' },
    contentSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    contentText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#444444',
    },
    imageGallery: {
        marginBottom: 20,
    },
    galleryImageContainer: {
        width: width,
        height: width * 0.8,
        paddingHorizontal: 20,
    },
    galleryImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: '#EEEEEE', // 로딩 전/실패 시 회색 배경
    },
    pagination: {
        position: 'absolute',
        bottom: 12,
        right: 32,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    paginationText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
    actionRow: {
        borderTopWidth: 1,
        borderTopColor: '#F2F3F7',
        paddingVertical: 4,
    },
    buttonGroup: {
        flexDirection: 'row',
        height: 48,
        alignItems: 'center',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    actionBtnLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    verticalDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#F2F3F7',
    },
    commentSection: {
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    commentSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 20,
    },
    commentRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F2F3F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    commentBody: { flex: 1 },
    commentTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#222',
        marginRight: 8,
    },
    commentDate: {
        fontSize: 11,
        color: '#BBB',
    },
    commentTextContent: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    commentDelete: {
        marginTop: 6,
    },
    deleteText: {
        fontSize: 12,
        color: '#AAA',
        fontWeight: '600',
    },
    emptyComment: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyCommentText: {
        fontSize: 14,
        color: '#BBB',
    },
    bottomInput: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#222',
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: { paddingHorizontal: 12 },
    sendButtonText: { fontSize: 15, fontWeight: 'bold', color: '#5B67CA' },
});

export default BoardDetailScreen;

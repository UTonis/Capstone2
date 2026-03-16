/**
 * BoardListScreen - 여행 후기 게시판 목록
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { fetchPosts, togglePostLike, BoardPostSummary } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import HeartIcon from '../../components/HeartIcon';
import { Alert } from 'react-native';

const { width } = Dimensions.get('window');

interface BoardListScreenProps {
    onBack: () => void;
    onNavigateToDetail: (postId: number) => void;
    onNavigateToWrite: () => void;
    onNavigateToLogin?: () => void;
    onNavigateToSearch?: () => void;
    showBackButton?: boolean;
}

const REGIONS = ['전체', '서울', '부산', '제주', '경주', '강릉', '여수', '전주', '인천', '대구', '대전'];

function BoardListScreen({ onBack, onNavigateToDetail, onNavigateToWrite, onNavigateToLogin, onNavigateToSearch, showBackButton = false }: BoardListScreenProps) {
    const insets = useSafeAreaInsets();
    const { token, showAlert } = useAuth();
    const [posts, setPosts] = useState<(BoardPostSummary & { is_liked?: boolean })[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('전체');

    const loadPosts = useCallback(async (pageNum: number, isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            const region = selectedRegion === '전체' ? undefined : selectedRegion;
            const data = await fetchPosts(pageNum, 10, region, undefined, token || undefined);
            console.log('--- BOARD LIST DATA ---');
            if (data.items && data.items.length > 0) {
                console.log(JSON.stringify(data.items[0], null, 2));
            }
            if (pageNum === 1) {
                setPosts(data.items);
            } else {
                setPosts(prev => [...prev, ...data.items]);
            }
            setTotalPages(data.total_pages);
        } catch (err) {
            console.log('게시글 로드 실패:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedRegion, token]);

    useEffect(() => {
        setPage(1);
        loadPosts(1);
    }, [selectedRegion, token]);

    const handleRefresh = () => { setPage(1); loadPosts(1, true); };
    const handleLike = async (postId: number) => {
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
        try {
            const result = await togglePostLike(token, postId);
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, like_count: result.like_count, is_liked: result.is_liked } : p
            ));
        } catch (err) {
            console.log('목록 좋아요 실패:', err);
        }
    };
    const handleLoadMore = () => {
        if (page < totalPages && !loading) { const next = page + 1; setPage(next); loadPosts(next); }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return '방금 전';
        if (hours < 24) return `${hours}시간 전`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}일 전`;
        return `${date.getMonth() + 1}.${date.getDate()}`;
    };

    const isNew = (dateStr: string | null) => {
        if (!dateStr) return false;
        const postDate = new Date(dateStr);
        const now = new Date();
        const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
        return diffInHours < 24; // 24시간 이내 글은 NEW
    };

    const renderPostCard = ({ item }: { item: BoardPostSummary & { is_liked?: boolean } }) => (
        <TouchableOpacity style={styles.postCard} onPress={() => onNavigateToDetail(item.id)} activeOpacity={0.9}>
            {/* 카테고리/지역 배지 */}
            <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.region || '일상'}</Text>
                </View>
            </View>

            {/* 제목 및 내용 요약 */}
            <View style={styles.textContent}>
                <Text style={styles.postTitleText} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.postSnippetText} numberOfLines={2}>
                    {item.content_preview || '본문 내용이 없습니다.'}
                    <Text style={styles.moreText}> ...더보기</Text>
                </Text>
            </View>

            {/* 이미지 영역 (있을 때만) */}
            {item.thumbnail_url && (
                <View style={styles.imageGallery}>
                    <Image
                        source={{ uri: item.thumbnail_url.startsWith('//') ? `http:${item.thumbnail_url}` : item.thumbnail_url }}
                        style={styles.galleryImage}
                        resizeMode="cover"
                        onError={() => console.log(`이미지 로드 실패: ${item.thumbnail_url}`)}
                    />
                </View>
            )}

            {/* 메타 정보 (작성자, 지역, 시간) */}
            <View style={styles.metaRow}>
                <Text style={styles.metaNickname}>{item.author.nickname || '익명'}</Text>
                <Text style={styles.metaDot}> · </Text>
                <Text style={styles.metaRegion}>{item.region || '전국'}</Text>
                <Text style={styles.metaTime}>{item.created_at ? formatDate(item.created_at) : '-'}</Text>
            </View>

            {/* 버튼 영역 (공감하기, 댓글쓰기) */}
            <View style={styles.actionRow}>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
                        <HeartIcon
                            filled={item.is_liked}
                            size={18}
                            color={item.is_liked ? "#ED4956" : "#333"}
                        />
                        <Text style={[styles.actionBtnLabel, item.is_liked && { color: '#ED4956' }, { marginLeft: 6 }]}>좋아요 {item.like_count > 0 && item.like_count}</Text>
                    </TouchableOpacity>
                    <View style={styles.verticalDivider} />
                    <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigateToDetail(item.id)}>
                        <Text style={{ fontSize: 18, marginRight: 6 }}>💬</Text>
                        <Text style={styles.actionBtnLabel}>댓글</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 홈과 동일한 스타일의 헤더 */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {showBackButton ? (
                        <TouchableOpacity onPress={onBack} style={{ marginBottom: 4 }}>
                            <Text style={styles.backButtonText}>뒤로</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <Text style={styles.logoText}>게시판</Text>
                            <Text style={styles.headerSubtitle}>여행자들의 생생한 이야기</Text>
                        </>
                    )}
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={onNavigateToSearch}
                    >
                        <View style={styles.searchButtonContent}>
                            <Text style={styles.searchButtonIcon}>⌕</Text>
                            <Text style={styles.searchButtonLabel}>통합 검색</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.filterSection}>
                <FlatList
                    horizontal
                    data={REGIONS}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.chip, selectedRegion === item && styles.chipActive]}
                            onPress={() => setSelectedRegion(item)}
                        >
                            <Text style={[styles.chipText, selectedRegion === item && styles.chipTextActive]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipContainer}
                />
            </View>

            {loading && posts.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#35C5F0" />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPostCard}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#35C5F0']} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={loading && posts.length > 0 ? <ActivityIndicator size="small" color="#35C5F0" style={{ marginVertical: 20 }} /> : null}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>게시물이 없습니다</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 20 }]} onPress={onNavigateToWrite} activeOpacity={0.9}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F3F7' }, // 연한 회색 배경 (커뮤니티 느낌)
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
    backButtonText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    headerLeft: { flex: 1 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666666',
    },
    searchButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    searchButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    searchButtonIcon: {
        fontSize: 20,
        color: '#5B67CA',
        fontWeight: 'bold',
    },
    searchButtonLabel: {
        fontSize: 14,
        color: '#5B67CA',
        fontWeight: '600',
    },
    filterSection: {
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE'
    },
    chipContainer: { paddingHorizontal: 16, paddingVertical: 10 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F2F3F7',
        marginRight: 8,
    },
    chipActive: {
        backgroundColor: '#5B67CA',
    },
    chipText: { fontSize: 13, color: '#666', fontWeight: 'bold' },
    chipTextActive: { color: '#FFF' },
    list: { paddingBottom: 40, paddingTop: 16 },
    postCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        paddingTop: 16,
    },
    badgeRow: {
        paddingHorizontal: 16,
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
    textContent: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    postTitleText: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
        lineHeight: 26,
    },
    postSnippetText: {
        fontSize: 14,
        color: '#555555',
        lineHeight: 22,
    },
    moreText: {
        color: '#999',
    },
    imageGallery: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    galleryImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        backgroundColor: '#EEEEEE', // 로딩 전/실패 시 회색 배경
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    metaNickname: {
        fontSize: 13,
        color: '#999',
    },
    metaDot: {
        fontSize: 13,
        color: '#DDD',
    },
    metaRegion: {
        fontSize: 13,
        color: '#999',
        flex: 1,
    },
    metaTime: {
        fontSize: 13,
        color: '#999',
    },
    actionRow: {
        borderTopWidth: 1,
        borderTopColor: '#F2F3F7',
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
        fontWeight: '500',
    },
    verticalDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#F2F3F7',
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
    empty: { alignItems: 'center', paddingVertical: 100 },
    emptyText: { fontSize: 16, color: '#999' },
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    fabText: { fontSize: 32, color: '#FFF', fontWeight: '300', marginBottom: 4 },
});

export default BoardListScreen;

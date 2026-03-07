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
import { fetchPosts, BoardPostSummary } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface BoardListScreenProps {
    onBack: () => void;
    onNavigateToDetail: (postId: number) => void;
    onNavigateToWrite: () => void;
    showBackButton?: boolean;
}

const REGIONS = ['전체', '서울', '부산', '제주', '경주', '강릉', '여수', '전주', '인천', '대구', '대전'];

function BoardListScreen({ onBack, onNavigateToDetail, onNavigateToWrite, showBackButton = false }: BoardListScreenProps) {
    const insets = useSafeAreaInsets();
    const [posts, setPosts] = useState<BoardPostSummary[]>([]);
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
            const data = await fetchPosts(pageNum, 10, region);
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
    }, [selectedRegion]);

    useEffect(() => {
        setPage(1);
        loadPosts(1);
    }, [selectedRegion]);

    const handleRefresh = () => { setPage(1); loadPosts(1, true); };
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
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const renderPostCard = ({ item }: { item: BoardPostSummary }) => (
        <TouchableOpacity style={styles.postCard} onPress={() => onNavigateToDetail(item.id)} activeOpacity={0.7}>
            {item.thumbnail_url ? (
                <Image source={{ uri: item.thumbnail_url }} style={styles.postImage} resizeMode="cover" />
            ) : (
                <View style={[styles.postImage, styles.postImagePlaceholder]}>
                    <Text style={{ fontSize: 32 }}>✈️</Text>
                </View>
            )}
            <View style={styles.postContent}>
                <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.postMeta}>
                    <Text style={styles.postAuthor}>{item.author.nickname || '익명'}</Text>
                    {item.region && <Text style={styles.postRegion}>📍{item.region}</Text>}
                </View>
                <View style={styles.postStats}>
                    <Text style={styles.postStat}>👁️ {item.view_count}</Text>
                    <Text style={styles.postStat}>❤️ {item.like_count}</Text>
                    <Text style={styles.postStat}>💬 {item.comment_count}</Text>
                    <Text style={styles.postDate}>{item.created_at ? formatDate(item.created_at) : '-'}</Text>
                </View>
                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagRow}>
                        {item.tags.slice(0, 3).map((tag, idx) => (
                            <View key={idx} style={styles.tag}><Text style={styles.tagText}>#{tag}</Text></View>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                {showBackButton ? (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>뒤로</Text>
                    </TouchableOpacity>
                ) : null}
                <View style={[styles.headerLeft, showBackButton && { alignItems: 'center' }]}>
                    <Text style={styles.headerTitle}>여행 후기</Text>
                    {!showBackButton && <Text style={styles.headerSubtitle}>다른 여행자들의 이야기를 들어보세요</Text>}
                </View>
                <TouchableOpacity onPress={onNavigateToWrite} style={styles.writeBtn}>
                    <Text style={styles.writeBtnText}>글쓰기</Text>
                </TouchableOpacity>
            </View>

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
                style={styles.chipList}
            />

            {loading && posts.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#5B67CA" />
                    <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPostCard}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#5B67CA']} />}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={loading && posts.length > 0 ? <ActivityIndicator size="small" color="#5B67CA" style={{ marginVertical: 20 }} /> : null}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ fontSize: 48, marginBottom: 12 }}>📝</Text>
                            <Text style={styles.emptyText}>아직 게시글이 없습니다</Text>
                            <Text style={styles.emptySubText}>첫 번째 여행 후기를 작성해보세요!</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 20 }]} onPress={onNavigateToWrite} activeOpacity={0.8}>
                <Text style={styles.fabText}>✏️</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerLeft: { flex: 1 },
    backButton: { paddingRight: 12 },
    backButtonText: { fontSize: 16, color: '#5B67CA', fontWeight: '600' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: '#666666' },
    writeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#5B67CA' },
    writeBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
    chipList: { maxHeight: 50, backgroundColor: '#FFF' },
    chipContainer: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F0F1F5', marginRight: 8 },
    chipActive: { backgroundColor: '#5B67CA' },
    chipText: { fontSize: 14, color: '#666', fontWeight: '500' },
    chipTextActive: { color: '#FFF' },
    list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 80 },
    postCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
    postImage: { width: 120, height: 140 },
    postImagePlaceholder: { backgroundColor: '#EEF0FF', justifyContent: 'center', alignItems: 'center' },
    postContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
    postTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 6, lineHeight: 22 },
    postMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    postAuthor: { fontSize: 13, color: '#666' },
    postRegion: { fontSize: 12, color: '#5B67CA' },
    postStats: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    postStat: { fontSize: 12, color: '#999' },
    postDate: { fontSize: 12, color: '#BBB', marginLeft: 'auto' },
    tagRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
    tag: { backgroundColor: '#EEF0FF', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
    tagText: { fontSize: 11, color: '#5B67CA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#999' },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 4 },
    emptySubText: { fontSize: 14, color: '#999' },
    fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#5B67CA', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#5B67CA', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
    fabText: { fontSize: 24 },
});

export default BoardListScreen;

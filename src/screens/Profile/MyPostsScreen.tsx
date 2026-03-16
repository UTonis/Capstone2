import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { fetchMyPosts, BoardPostSummary } from '../../services/api';
import HeartIcon from '../../components/HeartIcon';

interface MyPostsScreenProps {
    onBack: () => void;
    onNavigateToDetail?: (postId: number) => void;
}

const PAGE_SIZE = 20;

const MyPostsScreen = ({ onBack, onNavigateToDetail }: MyPostsScreenProps) => {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();

    const [posts, setPosts] = useState<BoardPostSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadPosts = useCallback(async (pageNum: number, reset: boolean = false) => {
        if (!token) return;
        if (pageNum === 1) {
            reset ? setRefreshing(true) : setLoading(true);
        }
        try {
            const data = await fetchMyPosts(token, pageNum, PAGE_SIZE);
            const newItems = data.items ?? [];
            setPosts(prev => reset || pageNum === 1 ? newItems : [...prev, ...newItems]);
            setHasMore(newItems.length === PAGE_SIZE);
        } catch {
            // Error handling
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        loadPosts(1, true);
    }, [loadPosts]);

    const handleLoadMore = () => {
        if (!hasMore || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        loadPosts(nextPage);
    };

    const handleRefresh = () => {
        setPage(1);
        setHasMore(true);
        loadPosts(1, true);
    };

    const renderItem = ({ item }: { item: BoardPostSummary }) => (
        <TouchableOpacity
            style={styles.postItem}
            activeOpacity={0.7}
            onPress={() => onNavigateToDetail?.(item.id)}
        >
            <View style={styles.postHeader}>
                <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
            </View>
            {item.content_preview ? (
                <Text style={styles.postContent} numberOfLines={2}>{item.content_preview}</Text>
            ) : null}
            <View style={styles.postMeta}>
                {item.region ? (
                    <View style={styles.regionBadge}>
                        <Text style={styles.regionText}>📍 {item.region}</Text>
                    </View>
                ) : <View />}
                <View style={styles.statsRow}>
                    <HeartIcon
                        filled={item.is_liked}
                        size={14}
                        color={item.is_liked ? "#ED4956" : "#999999"}
                    />
                    <Text style={[styles.postStat, { marginLeft: 4 }]}>{item.like_count ?? 0}</Text>
                    <Text style={[styles.postStat, { marginLeft: 10 }]}>💬 {item.comment_count ?? 0}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!hasMore) return <View style={{ height: 20 }} />;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#5B67CA" />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>작성한 게시글이 없습니다</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>내 게시글</Text>
                <View style={styles.placeholder} />
            </View>

            {loading && posts.length === 0 ? (
                <View style={styles.initialLoader}>
                    <ActivityIndicator size="large" color="#5B67CA" />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#5B67CA"
                        />
                    }
                    contentContainerStyle={posts.length === 0 ? styles.emptyList : undefined}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    backButtonText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    placeholder: {
        width: 60,
    },
    initialLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postItem: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
    },
    postHeader: {
        marginBottom: 6,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2B2B2B',
        lineHeight: 22,
    },
    postContent: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 8,
    },
    postMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    regionBadge: {
        backgroundColor: '#EEF0FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    regionText: {
        fontSize: 12,
        color: '#5B67CA',
        fontWeight: '600',
    },
    postStat: {
        fontSize: 12,
        color: '#999999',
    },
    separator: {
        height: 1,
        backgroundColor: '#F5F5F5',
        marginHorizontal: 20,
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 15,
        color: '#AAAAAA',
    },
    emptyList: {
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default MyPostsScreen;

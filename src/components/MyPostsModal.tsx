/**
 * MyPostsModal - 내 게시글 전체 보기 모달
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    Animated,
    PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchMyPosts, BoardPostSummary } from '../services/api';

const { height } = Dimensions.get('window');

interface MyPostsModalProps {
    visible: boolean;
    token: string;
    onClose: () => void;
    onPressPost?: (postId: number) => void;
}

const PAGE_SIZE = 20;

function MyPostsModal({ visible, token, onClose, onPressPost }: MyPostsModalProps) {
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) => gs.dy > 5,
            onPanResponderMove: (_, gs) => {
                if (gs.dy > 0) translateY.setValue(gs.dy);
            },
            onPanResponderRelease: (_, gs) => {
                // 150px 이상 내리거나 빠르게 스와이프하면 닫기
                if (gs.dy > 150 || gs.vy > 0.8) {
                    Animated.timing(translateY, {
                        toValue: height,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        translateY.setValue(0);
                        onClose();
                    });
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 80,
                        friction: 10,
                    }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (visible) translateY.setValue(0);
    }, [visible]);
    const [posts, setPosts] = useState<BoardPostSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const loadPosts = useCallback(async (pageNum: number, reset: boolean = false) => {
        if (!token) return;
        if (pageNum === 1) {
            reset ? setRefreshing(true) : setLoading(true);
        }
        try {
            const data = await fetchMyPosts(token, pageNum, PAGE_SIZE);
            const newItems = data.items ?? [];
            setPosts(prev => reset || pageNum === 1 ? newItems : [...prev, ...newItems]);
            setTotalCount(data.total ?? newItems.length);
            setHasMore(newItems.length === PAGE_SIZE);
        } catch {
            // 실패 시 기존 데이터 유지
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        if (visible) {
            setPage(1);
            setHasMore(true);
            loadPosts(1, true);
        } else {
            setPosts([]);
        }
    }, [visible]);

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
            onPress={() => {
                onPressPost?.(item.id);
                onClose();
            }}
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
                <Text style={styles.postStat}>❤️ {item.like_count ?? 0}  💬 {item.comment_count ?? 0}</Text>
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
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* 반투명 배경 탭하면 닫힘 */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <Animated.View
                    style={[styles.modalContainer, { paddingBottom: insets.bottom, transform: [{ translateY }] }]}
                >
                    {/* 드래그 핸들 */}
                    <View style={styles.dragHandle} {...panResponder.panHandlers} />

                    {/* 헤더 */}
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>내 게시글</Text>
                            {totalCount > 0 && (
                                <Text style={styles.modalSubtitle}>총 {totalCount}개</Text>
                            )}
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 목록 */}
                    {loading && posts.length === 0 ? (
                        <View style={styles.initialLoader}>
                            <ActivityIndicator size="large" color="#5B67CA" />
                            <Text style={styles.loadingText}>게시글 불러오는 중...</Text>
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
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: height * 0.88,
        minHeight: height * 0.5,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#DDDDDD',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    modalSubtitle: {
        fontSize: 13,
        color: '#5B67CA',
        fontWeight: '600',
        marginTop: 2,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#555555',
        fontWeight: 'bold',
    },
    initialLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#888888',
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
});

export default MyPostsModal;

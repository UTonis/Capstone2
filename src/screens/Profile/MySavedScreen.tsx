import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { fetchLikedPosts, BoardPostSummary } from '../../services/api';
import HeartIcon from '../../components/HeartIcon';

interface MySavedScreenProps {
    onBack: () => void;
    onNavigateToDetail?: (postId: number) => void;
}

const MySavedScreen = ({ onBack, onNavigateToDetail }: MySavedScreenProps) => {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const [savedPosts, setSavedPosts] = useState<BoardPostSummary[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            loadSavedPosts();
        }
    }, [token]);

    const loadSavedPosts = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await fetchLikedPosts(token, 1, 100);
            setSavedPosts(data.items);
        } catch (err) {
            console.error('Error fetching liked posts:', err);
            setSavedPosts([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>내 저장</Text>
                <View style={styles.placeholder} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#5B67CA" />
                </View>
            ) : savedPosts.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>저장된 게시글이 없습니다.</Text>
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {savedPosts.map((post) => (
                        <TouchableOpacity
                            key={post.id}
                            style={styles.tripCard}
                            onPress={() => onNavigateToDetail?.(post.id)}
                        >
                            <Image
                                source={{ uri: post.thumbnail_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800' }}
                                style={styles.tripImage}
                            />
                            <View style={styles.tripInfo}>
                                <Text style={styles.tripTitle}>{post.title}</Text>
                                {post.travel_start_date && post.travel_end_date && (
                                    <Text style={styles.tripDate}>
                                        {post.travel_start_date} ~ {post.travel_end_date}
                                    </Text>
                                )}
                                <View style={styles.tripMeta}>
                                    <View style={styles.statsRow}>
                                        <Text style={styles.metaText}>📍 {post.region || '지역 미설정'}  </Text>
                                        <HeartIcon filled={true} size={12} color="#ED4956" />
                                        <Text style={styles.statText}> {post.like_count} </Text>
                                        <Text style={styles.statDivider}>|</Text>
                                        <Text style={styles.statText}> 💬 {post.comment_count}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
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
    content: {
        flex: 1,
        padding: 16,
    },
    tripCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tripImage: {
        width: '100%',
        height: 180,
    },
    tripInfo: {
        padding: 16,
    },
    tripTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 8,
    },
    tripDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    tripMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: '#999',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        color: '#999',
    },
    statDivider: {
        fontSize: 12,
        color: '#DDD',
        marginHorizontal: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888888',
    },
});

export default MySavedScreen;

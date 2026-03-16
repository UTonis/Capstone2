import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getMyTrips, deleteTrip, TripSummary, BASE_URL } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MyTripsScreenProps {
    onBack: () => void;
    onNavigateToDetail?: (id: number, title: string) => void;
}

const MyTripsScreen = ({ onBack, onNavigateToDetail }: MyTripsScreenProps) => {
    const insets = useSafeAreaInsets();
    const { token, showAlert } = useAuth();
    const [trips, setTrips] = useState<TripSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // 백엔드에서 여행 목록 가져오기
    useEffect(() => {
        if (token) {
            fetchTrips();
        }
    }, [token]);

    const fetchTrips = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await getMyTrips(token);
            setTrips(data.trips);
        } catch (err) {
            console.error('Error fetching trips:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrip = (id: number, title: string) => {
        showAlert(
            '여행 삭제',
            `'${title}' 여행을 삭제하시겠습니까?`,
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        if (!token) return;
                        try {
                            setLoading(true);
                            await deleteTrip(token, id);
                            await fetchTrips();
                            showAlert('알림', '여행이 삭제되었습니다.');
                        } catch (err) {
                            console.error('Error deleting trip:', err);
                            showAlert('오류', '여행 삭제에 실패했습니다.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>내 여행</Text>
                <View style={styles.placeholder} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#5B67CA" />
                </View>
            ) : trips.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>저장된 여행이 없습니다.</Text>
                </View>
            ) : (
                <ScrollView style={styles.content}>
                    {trips.map((trip) => (
                        <TouchableOpacity
                            key={trip.id}
                            style={styles.tripCard}
                            onPress={() => onNavigateToDetail?.(trip.id, trip.title)}
                        >
                            <Image
                                source={{
                                    uri: (() => {
                                        // 1. thumbnail_url 우선 순위, 없으면 image_url
                                        let rawUrl = trip.thumbnail_url || trip.image_url;

                                        // "null" 문자열이나 빈 값 처리
                                        if (!rawUrl || rawUrl === 'null' || rawUrl === '') {
                                            return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800';
                                        }

                                        const url = rawUrl.trim();
                                        // 완전한 URL인 경우
                                        if (url.startsWith('http')) return url;
                                        // 프로토콜 생략 URL인 경우
                                        if (url.startsWith('//')) return `http:${url}`;

                                        // 상대 경로인 경우 BASE_URL 결합 (슬래시 중복 방지)
                                        const cleanPath = url.startsWith('/') ? url.substring(1) : url;
                                        return `${BASE_URL}/${cleanPath.replace(/\\/g, '/')}`;
                                    })()
                                }}
                                style={styles.tripImage}
                                onError={(e) => console.log(`Trip Image Load Error [ID: ${trip.id}]:`, e.nativeEvent.error)}
                            />
                            <View style={styles.tripInfo}>
                                <View style={styles.tripInfoHeader}>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>여행 완료</Text>
                                    </View>
                                    <View style={styles.menuContainer}>
                                        <TouchableOpacity
                                            style={styles.moreButton}
                                            onPress={() => setOpenMenuId(openMenuId === trip.id ? null : trip.id)}
                                        >
                                            <Text style={styles.moreButtonText}>⋮</Text>
                                        </TouchableOpacity>

                                        {openMenuId === trip.id && (
                                            <View style={styles.dropdownMenu}>
                                                <TouchableOpacity
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        setOpenMenuId(null);
                                                        handleDeleteTrip(trip.id, trip.title);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownTextDelete}>일정 삭제</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <Text style={styles.tripTitle}>{trip.title}</Text>
                                <Text style={styles.tripDate}>
                                    {trip.start_date} ~ {trip.end_date}
                                </Text>
                                <View style={styles.tripMeta}>
                                    <Text style={styles.metaText}>📍 {trip.region || '지역 미설정'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
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
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    tripTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    dates: {
        fontSize: 14,
        color: '#888888',
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
    tripInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    deleteButton: {
        padding: 5,
    },
    deleteButtonText: {
        fontSize: 18,
    },
    menuContainer: {
        position: 'relative',
        zIndex: 10,
    },
    moreButton: {
        padding: 5,
        paddingHorizontal: 10,
    },
    moreButtonText: {
        fontSize: 20,
        color: '#666',
        fontWeight: 'bold',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 35,
        right: 0,
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 8,
        minWidth: 120,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 100,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    dropdownTextDelete: {
        color: '#D32F2F',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default MyTripsScreen;

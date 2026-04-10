import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Image,
    Modal,
    Alert,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getTripDetail, TripDetail, ItineraryItem, BASE_URL, fetchPlaceDetail } from '../../services/api';
import MapScreen from '../Explore/MapScreen';

// Internal interface for MapScreen compatibility
interface MapMarker {
    id: number;
    day: number;
    time: string;
    place: string;
    latitude: number;
    longitude: number;
    note?: string;
}

interface ScheduleDetailScreenProps {
    schedule?: TripDetail; // Updated to TripDetail
    tripId?: number;
    tripTitle?: string;
    onBack: () => void;
    onNavigateToChat?: (id: number, title: string) => void;
}

function ScheduleDetailScreen({ schedule: initialSchedule, tripId, tripTitle, onBack, onNavigateToChat }: ScheduleDetailScreenProps) {
    const insets = useSafeAreaInsets();
    const { token } = useAuth();
    const [schedule, setSchedule] = useState<TripDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedPlaceDetail, setSelectedPlaceDetail] = useState<any>(null);
    const [selectedPlaceMemo, setSelectedPlaceMemo] = useState<string | null>(null);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    // 슬라이드 닫기 제스처를 위한 상태 및 Ref
    const screenHeight = Dimensions.get('window').height;
    const panY = React.useRef(new Animated.Value(0)).current;
    const backgroundAlpha = React.useRef(new Animated.Value(0)).current; // 배경 투명도

    const resetModal = () => {
        panY.setValue(0);
        backgroundAlpha.setValue(0);
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(panY, {
                toValue: screenHeight,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(backgroundAlpha, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            setIsImageModalVisible(false);
            resetModal();
        });
    };

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    panY.setValue(gestureState.dy);
                    // 아래로 내릴수록 배경도 같이 투명해지도록 (선택 사항)
                    const opacity = Math.max(0, 1 - gestureState.dy / (screenHeight * 0.5));
                    backgroundAlpha.setValue(opacity);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 150 || gestureState.vy > 0.5) {
                    closeModal();
                } else {
                    Animated.parallel([
                        Animated.spring(panY, {
                            toValue: 0,
                            useNativeDriver: true,
                        }),
                        Animated.spring(backgroundAlpha, {
                            toValue: 1,
                            useNativeDriver: true,
                        })
                    ]).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (initialSchedule) {
            // Convert initialSchedule (mock) if needed, but for now let's just use it
            // setSchedule(initialSchedule as any);
            setLoading(false);
            return;
        }

        const fetchDetail = async (isRefresh: boolean = false) => {
            if (!token || !tripId) {
                setLoading(false);
                setRefreshing(false);
                return;
            }
            try {
                if (!isRefresh) setLoading(true);
                else setRefreshing(true);

                // AI 채팅 등에서 수정된 내용을 반영하기 위해 항상 최신 데이터를 서버에서 가져옵니다 (캐시 방지)
                const detail = await getTripDetail(token, tripId, true);
                setSchedule(detail);
            } catch (err) {
                console.error('Error fetching trip detail:', err);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        fetchDetail();
    }, [initialSchedule, tripId, token]);

    const onRefresh = () => {
        const fetchDetail = async () => {
            if (!token || !tripId) return;
            try {
                setRefreshing(true);
                const detail = await getTripDetail(token, tripId, true);
                setSchedule(detail);
            } catch (err) {
                console.error('Error refreshing trip detail:', err);
            } finally {
                setRefreshing(false);
            }
        };
        fetchDetail();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#5B67CA" />
                <Text style={{ marginTop: 12, color: '#666' }}>일정을 불러오는 중...</Text>
                <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!schedule) {
        return (
            <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
                <Text style={{ color: '#666' }}>일정을 찾을 수 없습니다.</Text>
                <TouchableOpacity onPress={onBack} style={{ marginTop: 20 }}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Map backend itinerary to UI schedule items (compatible with old MapScreen)
    const scheduleItems = (schedule.itineraries || [])
        .filter(it => it.place)
        .map(it => ({
            id: it.id,
            trip_id: schedule.id,
            day_number: it.day_number,
            place: it.place?.name || '알 수 없는 장소',
            latitude: it.place?.latitude || 0,
            longitude: it.place?.longitude || 0,
            arrival_time: it.arrival_time?.substring(0, 5) || '미정',
            memo: it.memo || undefined,
            order_index: it.order_index
        }));

    // 일정을 날짜별로 그룹화
    const groupedItems = (schedule.itineraries || []).reduce((acc, item) => {
        if (!acc[item.day_number]) {
            acc[item.day_number] = [];
        }
        acc[item.day_number].push(item);
        return acc;
    }, {} as Record<number, ItineraryItem[]>);

    const handlePlacePress = async (placeId: number, memo: string | null = null) => {
        console.log('Fetching place detail for ID:', placeId, 'Memo:', memo);
        try {
            setSelectedPlaceMemo(memo); // 추천 사유 저장
            const detail = await fetchPlaceDetail(placeId);
            console.log('Received detail:', detail);

            let imageUrl = null;
            if (detail.image_url) {
                let trimmed = detail.image_url.trim();

                // 로컬 네트워크 환경을 위해 localhost를 BASE_URL로 교체
                if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) {
                    trimmed = trimmed.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/, BASE_URL);
                }

                if (trimmed.startsWith('http')) {
                    imageUrl = trimmed;
                } else {
                    const cleanPath = trimmed.startsWith('/') ? trimmed.substring(1) : trimmed;
                    imageUrl = `${BASE_URL}/${cleanPath.replace(/\\/g, '/')}`;
                }
            }

            setSelectedPlaceDetail({ ...detail, imageUrl });

            // 모달 열기 애니메이션: 아래에서 위로 + 배경 페이드인
            panY.setValue(screenHeight);
            backgroundAlpha.setValue(0);
            setIsImageModalVisible(true);

            Animated.parallel([
                Animated.spring(panY, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(backgroundAlpha, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } catch (err: any) {
            console.error('Error fetching place image:', err);
            Alert.alert('오류', '장소 정보를 불러오는 데 실패했습니다.\n' + (err.message || ''));
        }
    };

    if (showMap) {
        return (
            <MapScreen
                scheduleItems={scheduleItems as any}
                onBack={() => setShowMap(false)}
                title={schedule.title}
            />
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>뒤로</Text>
                </TouchableOpacity>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>나의 여행</Text>
                </View>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#5B67CA']}
                        tintColor={'#5B67CA'}
                    />
                }
            >
                {/* 히어로 이미지 */}
                <View style={styles.heroImageContainer}>
                    <Image
                        source={{
                            uri: (() => {
                                // 1. thumbnail_url 우선 순위, 없으면 image_url
                                let rawUrl = schedule.thumbnail_url || schedule.image_url;

                                if (!rawUrl || rawUrl === 'null' || rawUrl === '') {
                                    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800';
                                }

                                let url = rawUrl.trim();

                                // 로컬 네트워크 환경을 위해 localhost를 BASE_URL로 교체
                                if (url.includes('localhost') || url.includes('127.0.0.1')) {
                                    url = url.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/, BASE_URL);
                                }

                                if (url.startsWith('http')) return url;
                                if (url.startsWith('//')) return `http:${url}`;

                                const cleanPath = url.startsWith('/') ? url.substring(1) : url;
                                return `${BASE_URL}/${cleanPath.replace(/\\/g, '/')}`;
                            })()
                        }}
                        style={styles.heroImage}
                    />
                </View>

                {/* 일정 정보 */}
                <View style={[styles.infoSection, { marginTop: -20, backgroundColor: '#FFFFFF' }]}>
                    <Text style={styles.tripTitle}>{schedule.title}</Text>
                    <Text style={styles.tripDate}>
                        {schedule.start_date} ~ {schedule.end_date}
                    </Text>
                    <Text style={styles.tripInfo}>
                        총 {schedule.itineraries.length}개 장소
                    </Text>
                </View>

                {/* 버튼 행: 지도 보기 + 채팅 수정 */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => setShowMap(true)}
                    >
                        <Image source={require('../../data/Map Icon.png')} style={styles.buttonIconImage} />
                        <Text style={styles.mapButtonText}>지도경로 보기</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.aiButton}
                        onPress={() => onNavigateToChat?.(tripId || schedule.id, tripTitle || schedule.title)}
                    >
                        <Image source={require('../../data/AI Icon.png')} style={styles.buttonIconImage} />
                        <Text style={styles.aiButtonText}>AI일정 수정</Text>
                    </TouchableOpacity>
                </View>

                {/* 일정 목록 */}
                {Object.entries(groupedItems).map(([day, items]) => (
                    <View key={day} style={styles.daySection}>
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayLabel}>Day {day}</Text>
                        </View>
                        {items.map((item) => {
                            // 장소 이미지 URL 처리
                            let placeImageUrl: string | null = null;
                            if (item.place?.image_url) {
                                let rawImg = item.place.image_url.trim();
                                if (rawImg.includes('localhost') || rawImg.includes('127.0.0.1')) {
                                    rawImg = rawImg.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/, BASE_URL);
                                }
                                if (rawImg.startsWith('http')) {
                                    placeImageUrl = rawImg;
                                } else {
                                    const cleanPath = rawImg.startsWith('/') ? rawImg.substring(1) : rawImg;
                                    placeImageUrl = `${BASE_URL}/${cleanPath.replace(/\\/g, '/')}`;
                                }
                            }

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.scheduleItem}
                                    onPress={() => item.place && handlePlacePress(item.place.id, item.memo)}
                                    activeOpacity={0.85}
                                >
                                    {/* 배경 이미지 */}
                                    {placeImageUrl ? (
                                        <Image
                                            source={{ uri: placeImageUrl }}
                                            style={styles.scheduleItemBg}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={styles.scheduleItemBgPlaceholder} />
                                    )}

                                    {/* 어두운 그라데이션 오버레이 */}
                                    <View style={styles.scheduleItemOverlay} />

                                    {/* 콘텐츠 레이어 */}
                                    <View style={styles.scheduleItemContent}>
                                        {/* 오른쪽 상단: 시간 */}
                                        <View style={styles.scheduleItemTopRow}>
                                            <View style={styles.scheduleTimeBadge}>
                                                <Text style={styles.scheduleTimeText}>
                                                    {item.arrival_time?.substring(0, 5) || '미정'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* 하단: 장소명 + 메모 */}
                                        <View style={styles.scheduleItemBottomRow}>
                                            <View style={styles.placeContainer}>
                                                <Image source={require('../../data/PIN Icon.png')} style={styles.pinIconImage} />
                                                <Text style={styles.schedulePlace}>
                                                    {item.place?.name || '알 수 없는 장소'}
                                                </Text>
                                            </View>
                                            {item.memo ? (
                                                <Text style={styles.scheduleNote} numberOfLines={2}>
                                                    {item.memo}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* 이미지 확대 모달 */}
            <Modal
                visible={isImageModalVisible}
                transparent={true}
                animationType="none"
                onRequestClose={closeModal}
            >
                <Animated.View
                    style={[
                        styles.modalOverlay,
                        { opacity: backgroundAlpha }
                    ]}
                >
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={closeModal}
                    />
                    <Animated.View
                        style={[
                            styles.modalContent,
                            { transform: [{ translateY: panY }] }
                        ]}
                        {...panResponder.panHandlers}
                    >
                        <View style={styles.modalHandle} />
                        {selectedPlaceDetail ? (
                            <ScrollView
                                style={{ width: '100%' }}
                                showsVerticalScrollIndicator={false}
                            >
                                {selectedPlaceDetail.imageUrl ? (
                                    <View style={styles.modalImageContainer}>
                                        <Image
                                            source={{ uri: selectedPlaceDetail.imageUrl }}
                                            style={styles.modalImage}
                                            resizeMode="cover"
                                            onLoadStart={() => setImageLoading(true)}
                                            onLoad={() => setImageLoading(false)}
                                            onError={() => setImageLoading(false)}
                                        />
                                        {imageLoading && (
                                            <View style={[StyleSheet.absoluteFill, styles.center]}>
                                                <ActivityIndicator size="large" color="#5B67CA" />
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View style={[styles.modalImageContainer, styles.noImageContainer]}>
                                        <Text style={styles.noImageText}>등록된 사진이 없습니다</Text>
                                    </View>
                                )}

                                <View style={styles.modalInfoContainer}>
                                    <Text style={styles.modalPlaceTitle}>{selectedPlaceDetail.name}</Text>

                                    {selectedPlaceDetail.category && (
                                        <View style={styles.modalDetailRow}>
                                            <Text style={styles.modalDetailIconEmoji}>🏷️</Text>
                                            <Text style={styles.modalDetailText}>{selectedPlaceDetail.category}</Text>
                                        </View>
                                    )}

                                    {selectedPlaceDetail.address && (
                                        <View style={styles.modalDetailRow}>
                                            <Image source={require('../../data/PIN Icon.png')} style={styles.modalDetailIcon} />
                                            <Text style={styles.modalDetailText}>{selectedPlaceDetail.address}</Text>
                                        </View>
                                    )}

                                    {selectedPlaceDetail.tel && (
                                        <View style={styles.modalDetailRow}>
                                            <Text style={styles.modalDetailIconEmoji}>📞</Text>
                                            <Text style={styles.modalDetailText}>{selectedPlaceDetail.tel}</Text>
                                        </View>
                                    )}

                                    {/* 상세 섹션 (축제 상세 스타일 반영) */}
                                    {selectedPlaceMemo && (
                                        <View style={styles.modalSection}>
                                            <Text style={styles.modalSectionTitle}>AI 추천 사유</Text>
                                            <Text style={styles.modalSectionContent}>{selectedPlaceMemo}</Text>
                                        </View>
                                    )}

                                    {selectedPlaceDetail.description && (
                                        <View style={styles.modalSection}>
                                            <Text style={styles.modalSectionTitle}>장소 소개</Text>
                                            <Text style={styles.modalSectionContent}>{selectedPlaceDetail.description.replace(/<[^>]+>/g, '')}</Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        ) : (
                            <ActivityIndicator size="large" color="#5B67CA" />
                        )}
                    </Animated.View>
                </Animated.View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    headerLeft: { flex: 1, alignItems: 'center' },
    headerTitle: {
        fontSize: 28,
        fontWeight: '600',
        color: '#2B2B2B',
    },
    headerPlaceholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 0,
    },
    heroImageContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    heroImage: {
        width: '100%',
        height: 250,
        backgroundColor: '#F0F0F0',
    },
    infoSection: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingHorizontal: 24,
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    tripTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 8,
    },
    tripDate: {
        fontSize: 15,
        color: '#666',
        marginBottom: 4,
    },
    tripInfo: {
        fontSize: 14,
        color: '#888',
    },
    buttonRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 24,
        gap: 10,
    },
    mapButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 15,
        borderWidth: 2,
        borderColor: '#5B67CA',
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
    },
    buttonIconImage: {
        width: 20,
        height: 20,
        marginRight: 6,
        resizeMode: 'contain',
        backgroundColor: 'transparent',
    },
    mapButtonText: {
        color: '#5B67CA',
        fontSize: 15,
        fontWeight: '700',
    },
    daySection: {
        marginBottom: 24,
        paddingHorizontal: 16, // 일정도 여백 유지
    },
    dayHeader: {
        backgroundColor: '#5B67CA',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    dayLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    scheduleItem: {
        height: 120,
        borderRadius: 14,
        marginBottom: 12,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    scheduleItemBg: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    scheduleItemBgPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#3D4590',
    },
    scheduleItemOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(20, 20, 50, 0.50)',
    },
    scheduleItemContent: {
        flex: 1,
        padding: 14,
        justifyContent: 'space-between',
    },
    scheduleItemTopRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    scheduleTimeBadge: {
        backgroundColor: 'rgba(91, 103, 202, 0.85)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    scheduleTimeText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    scheduleItemBottomRow: {
        gap: 3,
    },
    scheduleContent: {
        flex: 1,
    },
    placeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    pinIconImage: {
        width: 14,
        height: 14,
        marginRight: 5,
        resizeMode: 'contain',
        tintColor: '#FFFFFF',
    },
    schedulePlace: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
        flex: 1,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    scheduleNote: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.80)',
        lineHeight: 16,
    },
    aiButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#5B67CA',
        borderRadius: 12,
        paddingVertical: 15,
        shadowColor: '#5B67CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    aiButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        height: '85%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 12,
        paddingBottom: 20,
        alignItems: 'center',
        overflow: 'hidden',
    },
    modalHandle: {
        width: 45,
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginBottom: 12,
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    modalImageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#F5F5F5',
        marginBottom: 0, // 이미지가 컨테이너 상단에 붙도록
    },
    noImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
    },
    noImageText: {
        color: '#888',
        fontSize: 14,
    },
    modalInfoContainer: {
        width: '100%',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    modalPlaceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 16,
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalDetailIcon: {
        width: 16,
        height: 16,
        marginRight: 10,
        resizeMode: 'contain',
    },
    modalDetailIconEmoji: {
        fontSize: 16,
        marginRight: 10,
        color: '#555',
    },
    modalDetailText: {
        fontSize: 15,
        color: '#555555',
        flex: 1,
    },
    modalSection: {
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    modalSectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 10,
    },
    modalSectionContent: {
        fontSize: 14,
        color: '#555555',
    },
});

export default ScheduleDetailScreen;

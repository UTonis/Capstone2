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
    Linking,
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
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

    const toggleItem = (id: number) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

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
            onStartShouldSetPanResponder: () => false,
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
        const fetchDetail = async (isRefresh: boolean = false) => {
            if (!token || !tripId) {
                // tripId 없고 initialSchedule만 있는 경우 (배너 클릭 등)
                if (initialSchedule) {
                    setSchedule(initialSchedule as any);
                }
                setLoading(false);
                setRefreshing(false);
                return;
            }
            try {
                if (!isRefresh) setLoading(true);
                else setRefreshing(true);

                // tripId가 있으면 항상 서버에서 최신 데이터를 가져옵니다
                // (thumbnail_url 등 생성 직후 반영되는 필드 포함)
                const detail = await getTripDetail(token, tripId, true);
                setSchedule(detail);
            } catch (err) {
                console.error('Error fetching trip detail:', err);
                // API 실패 시 initialSchedule로 폴백
                if (initialSchedule) {
                    setSchedule(initialSchedule as any);
                }
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

            setSelectedPlaceDetail({ ...detail, imageUrl, mergedFeeInfo: detail.fee_info });

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

                                // http://어떤호스트:포트 든 현재 BASE_URL로 교체
                                // (백엔드 저장 시점과 앱 실행 시점의 서버 주소가 다를 수 있음)
                                if (url.startsWith('http://') || url.startsWith('https://')) {
                                    url = url.replace(/^https?:\/\/[^/]+/, BASE_URL);
                                    return url;
                                }

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
                        <Image source={require('../../data/AI icon.png')} style={styles.buttonIconImage} />
                        <Text style={styles.aiButtonText}>AI일정 수정</Text>
                    </TouchableOpacity>
                </View>

                {/* 일정 목록 */}
                {Object.entries(groupedItems).map(([day, items]) => (
                    <View key={day} style={styles.daySection}>
                        {/* Day 헤더 (비인터랙티브) */}
                        <View style={styles.dayHeader}>
                            <Text style={styles.dayLabel}>Day {day}</Text>
                        </View>

                        {items.map((item) => {
                            const isOpen = !!expandedItems[item.id];
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
                                <View key={item.id} style={styles.accordionWrapper}>
                                    {/* 접힌 카드 - 펼치면 하단 모서리 제거 */}
                                    <TouchableOpacity
                                        style={[
                                            styles.scheduleItem,
                                            isOpen && styles.scheduleItemOpen
                                        ]}
                                        onPress={() => toggleItem(item.id)}
                                        activeOpacity={0.85}
                                    >
                                        {placeImageUrl ? (
                                            <Image source={{ uri: placeImageUrl }} style={styles.scheduleItemBg} resizeMode="cover" />
                                        ) : (
                                            <View style={styles.scheduleItemBgPlaceholder} />
                                        )}
                                        <View style={styles.scheduleItemOverlay} />
                                        <View style={styles.scheduleItemContent}>
                                            <View style={styles.scheduleItemTopRow}>
                                                <View style={styles.scheduleTimeBadge}>
                                                    <Text style={styles.scheduleTimeText}>
                                                        {item.arrival_time?.substring(0, 5) || '미정'}
                                                    </Text>
                                                </View>
                                                <Text style={styles.accordionChevron}>{isOpen ? '▲' : '▼'}</Text>
                                            </View>
                                            <View style={styles.scheduleItemBottomRow}>
                                                <View style={styles.placeContainer}>
                                                    <Image source={require('../../data/PIN Icon.png')} style={styles.pinIconImage} />
                                                    <Text style={styles.schedulePlace}>
                                                        {item.place?.name || '알 수 없는 장소'}
                                                    </Text>
                                                </View>
                                                {item.memo ? (
                                                    <Text style={styles.scheduleNote} numberOfLines={isOpen ? undefined : 1}>
                                                        {item.memo}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    {/* 펼쳐진 상세 정보 */}
                                    {isOpen && (
                                        <View style={styles.accordionDetail}>
                                            {/* 태그 */}
                                            {item.place?.tags && item.place.tags.length > 0 && (
                                                <View style={styles.accordionTagRow}>
                                                    {item.place.tags.slice(0, 5).map((tag, i) => (
                                                        <View key={i} style={styles.accordionTag}>
                                                            <Text style={styles.accordionTagText}>#{tag}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}

                                            {item.place?.address ? (
                                                <View style={styles.accordionRow}>
                                                    <Image source={require('../../data/PIN Icon.png')} style={styles.accordionPinIcon} />
                                                    <Text style={styles.accordionText}>{item.place.address}</Text>
                                                </View>
                                            ) : null}
                                            {item.place?.operating_hours ? (
                                                <View style={styles.accordionRow}>
                                                    <Text style={styles.accordionIcon}>⏰</Text>
                                                    <Text style={styles.accordionText}>{item.place.operating_hours}</Text>
                                                </View>
                                            ) : null}
                                            {item.place?.closed_days ? (
                                                <View style={styles.accordionRow}>
                                                    <Text style={styles.accordionIcon}>📅</Text>
                                                    <Text style={styles.accordionText}>휴무: {item.place.closed_days}</Text>
                                                </View>
                                            ) : null}

                                            <TouchableOpacity
                                                style={styles.accordionDetailBtn}
                                                onPress={() => item.place && handlePlacePress(item.place.id, item.memo)}
                                            >
                                                <Text style={styles.accordionDetailBtnText}>자세히 보기  ›</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
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
                                style={{ flex: 1, width: '100%' }}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 40 }}
                            >
                                {/* 히어로 이미지 섹션 (상단 고정 스타일) */}
                                <View style={styles.modernHeroContainer}>
                                    {selectedPlaceDetail.imageUrl ? (
                                        <Image
                                            source={{ uri: selectedPlaceDetail.imageUrl }}
                                            style={styles.modernHeroImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[styles.modernHeroImage, styles.noImageContainer]}>
                                            <Text style={styles.noImageText}>등록된 사진이 없습니다</Text>
                                        </View>
                                    )}
                                    <View style={styles.modernHeroOverlay} />

                                    {/* 이미지 하단 텍스트 정보 */}
                                    <View style={styles.modernHeroInfo}>
                                        <Text style={styles.modernHeroTitle}>{selectedPlaceDetail.name}</Text>
                                        <Text style={styles.modernHeroTagline}>
                                            {selectedPlaceDetail.category || '여행 명소'} • {selectedPlaceDetail.address?.split(' ')[1] || '위치 정보'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.modernBodyContent}>
                                    {/* AI 추천 팁 박스 */}
                                    {selectedPlaceMemo && (
                                        <View style={styles.modernAiTipBox}>
                                            <View style={styles.modernAiTipHeader}>
                                                <Image source={require('../../data/AI icon.png')} style={styles.modernAiTipIcon} />
                                                <Text style={styles.modernAiTipTitle}>AI 추천 이유</Text>
                                            </View>
                                            <Text style={styles.modernAiTipContent}>{selectedPlaceMemo}</Text>
                                        </View>
                                    )}

                                    <View style={styles.modernSection}>
                                        <Text style={styles.modernSectionTitle}>기본 정보</Text>

                                        {selectedPlaceDetail.category && (
                                            <View style={styles.modernInfoRow}>
                                                <View style={styles.modernInfoIconBox}>
                                                    <Text style={styles.modernInfoEmoji}>🏛️</Text>
                                                </View>
                                                <View style={styles.modernInfoContent}>
                                                    <Text style={styles.modernInfoLabel}>장소 유형</Text>
                                                    <Text style={styles.modernInfoValue}>{selectedPlaceDetail.category}</Text>
                                                </View>
                                            </View>
                                        )}

                                        {selectedPlaceDetail.address && (
                                            <View style={styles.modernInfoRow}>
                                                <View style={styles.modernInfoIconBox}>
                                                    <Image source={require('../../data/PIN Icon.png')} style={styles.modernInfoIcon} />
                                                </View>
                                                <View style={styles.modernInfoContent}>
                                                    <Text style={styles.modernInfoLabel}>주소</Text>
                                                    <Text style={styles.modernInfoValue}>{selectedPlaceDetail.address}</Text>
                                                </View>
                                            </View>
                                        )}

                                        {selectedPlaceDetail.is_festival && selectedPlaceDetail.event_start_date && (
                                            <View style={styles.modernInfoRow}>
                                                <View style={styles.modernInfoIconBox}>
                                                    <Text style={styles.modernInfoEmoji}>🎉</Text>
                                                </View>
                                                <View style={styles.modernInfoContent}>
                                                    <Text style={styles.modernInfoLabel}>축제기간</Text>
                                                    <Text style={styles.modernInfoValue}>
                                                        {selectedPlaceDetail.event_start_date} ~ {selectedPlaceDetail.event_end_date || '미정'}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        {selectedPlaceDetail.operating_hours && (
                                            <View style={styles.modernInfoRow}>
                                                <View style={styles.modernInfoIconBox}>
                                                    <Text style={styles.modernInfoEmoji}>🕒</Text>
                                                </View>
                                                <View style={styles.modernInfoContent}>
                                                    <Text style={styles.modernInfoLabel}>운영시간</Text>
                                                    <Text style={styles.modernInfoValue}>{selectedPlaceDetail.operating_hours}</Text>
                                                </View>
                                            </View>
                                        )}

                                        {selectedPlaceDetail.closed_days && (
                                            <View style={styles.modernInfoRow}>
                                                <View style={styles.modernInfoIconBox}>
                                                    <Text style={styles.modernInfoEmoji}>🗓️</Text>
                                                </View>
                                                <View style={styles.modernInfoContent}>
                                                    <Text style={styles.modernInfoLabel}>휴무일</Text>
                                                    <Text style={styles.modernInfoValue}>{selectedPlaceDetail.closed_days}</Text>
                                                </View>
                                            </View>
                                        )}

                                        <View style={styles.modernInfoRow}>
                                            <View style={styles.modernInfoIconBox}>
                                                <Text style={styles.modernInfoEmoji}>💰</Text>
                                            </View>
                                            <View style={styles.modernInfoContent}>
                                                <Text style={styles.modernInfoLabel}>이용요금</Text>
                                                <Text style={styles.modernInfoValue}>
                                                    {!selectedPlaceDetail.mergedFeeInfo || selectedPlaceDetail.mergedFeeInfo === '불가능' || selectedPlaceDetail.mergedFeeInfo === 'null'
                                                        ? '없음'
                                                        : selectedPlaceDetail.mergedFeeInfo}
                                                </Text>
                                            </View>
                                        </View>

                                        {selectedPlaceDetail.homepage && (
                                            <TouchableOpacity
                                                style={styles.modernInfoRow}
                                                onPress={() => Linking.openURL(selectedPlaceDetail.homepage)}
                                            >
                                                <View style={styles.modernInfoIconBox}>
                                                    <Text style={styles.modernInfoEmoji}>🌐</Text>
                                                </View>
                                                <View style={styles.modernInfoContent}>
                                                    <Text style={styles.modernInfoLabel}>홈페이지</Text>
                                                    <Text style={[styles.modernInfoValue, styles.modernLinkText]}>
                                                        홈페이지 방문하기
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}

                                        {selectedPlaceDetail.tel && (
                                            <View style={styles.modernInfoRow}>
                                                <View style={styles.modernInfoIconBox}>
                                                    <Text style={styles.modernInfoEmoji}>📞</Text>
                                                </View>
                                                <View style={styles.modernInfoContent}>
                                                    <Text style={styles.modernInfoLabel}>전화번호</Text>
                                                    <Text style={styles.modernInfoValue}>{selectedPlaceDetail.tel}</Text>
                                                </View>
                                            </View>
                                        )}

                                        {selectedPlaceDetail.tags && selectedPlaceDetail.tags.length > 0 && (
                                            <View style={[styles.modernInfoRow, { borderBottomWidth: 0 }]}>
                                                <View style={styles.modernInfoIconBox}>
                                                    <Text style={styles.modernInfoEmoji}>🏷️</Text>
                                                </View>
                                                <View style={styles.modernInfoContent}>
                                                    <Text style={styles.modernInfoLabel}>태그</Text>
                                                    <View style={styles.tagContainer}>
                                                        {selectedPlaceDetail.tags.map((tag: string, index: number) => (
                                                            <View key={index} style={styles.tagBadge}>
                                                                <Text style={styles.tagText}>#{tag}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </ScrollView>
                        ) : (
                            <View style={[styles.center, { flex: 1, backgroundColor: '#FFFFFF' }]}>
                                <ActivityIndicator size="large" color="#5B67CA" />
                                <Text style={{ marginTop: 12, color: '#666' }}>장소 정보를 불러오는 중...</Text>
                            </View>
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
    accordionWrapper: {
        marginBottom: 14,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    accordionChevron: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
        marginLeft: 6,
        letterSpacing: 1,
    },
    accordionDetail: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 14,
        gap: 9,
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: '#E0E3F5',
    },
    accordionTagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 4,
    },
    accordionTag: {
        backgroundColor: '#EEF0FD',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    accordionTagText: {
        color: '#5B67CA',
        fontSize: 12,
        fontWeight: '600',
    },
    accordionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    accordionIcon: {
        fontSize: 13,
        marginTop: 2,
    },
    accordionPinIcon: {
        width: 14,
        height: 14,
        marginTop: 4,
        resizeMode: 'contain',
        tintColor: '#FF4B4B',
    },
    accordionText: {
        flex: 1,
        fontSize: 13,
        color: '#555',
        lineHeight: 19,
    },
    accordionDetailBtn: {
        marginTop: 4,
        alignSelf: 'flex-end',
        backgroundColor: '#5B67CA',
        borderRadius: 20,
        paddingVertical: 7,
        paddingHorizontal: 16,
    },
    accordionDetailBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    dayLabel: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    scheduleItem: {
        height: 120,
        borderRadius: 14,
        marginBottom: 0,
        overflow: 'hidden',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    scheduleItemOpen: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
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
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        alignItems: 'center',
        overflow: 'hidden',
    },
    modernHeroContainer: {
        width: '100%',
        height: 380,
        position: 'relative',
        backgroundColor: '#F5F5F5',
    },
    modernHeroImage: {
        width: '100%',
        height: '100%',
    },
    modernHeroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
    modernHeroHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    modernRoundButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modernBackIcon: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: -3,
    },
    modernHeaderActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modernHeartIcon: {
        width: 20,
        height: 20,
        tintColor: '#FFF',
    },
    modernShareIcon: {
        color: '#FFF',
        fontSize: 18,
    },
    modernHeroInfo: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
    },
    modernHeroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    modernRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    modernRatingStars: {
        fontSize: 16,
        color: '#FFD700',
        marginRight: 8,
    },
    modernRatingText: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '500',
    },
    modernHeroTagline: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400',
    },
    modernTabRow: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFF',
    },
    modernTab: {
        paddingVertical: 15,
        marginRight: 25,
        position: 'relative',
    },
    modernTabActive: {
    },
    modernTabText: {
        fontSize: 16,
        color: '#888',
        fontWeight: '500',
    },
    modernTabTextActive: {
        color: '#5B67CA',
        fontWeight: '700',
    },
    modernTabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#5B67CA',
        borderRadius: 2,
    },
    modernBodyContent: {
        padding: 20,
    },
    modernAiTipBox: {
        backgroundColor: '#F0F7FF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#E6F0FF',
    },
    modernAiTipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    modernAiTipIcon: {
        width: 22,
        height: 22,
        marginRight: 8,
        resizeMode: 'contain',
    },
    modernAiTipTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    modernAiTipContent: {
        fontSize: 15,
        color: '#555',
        lineHeight: 22,
    },
    modernSection: {
        marginBottom: 30,
    },
    modernSectionTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 12,
    },
    modernSectionContent: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24,
    },
    modernInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    modernInfoIconBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#F0F2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    modernInfoIcon: {
        width: 16,
        height: 16,
        tintColor: '#5B67CA',
    },
    modernInfoEmoji: {
        fontSize: 16,
    },
    modernInfoText: {
        fontSize: 15,
        color: '#555',
        flex: 1,
    },
    modernLinkText: {
        color: '#5B67CA',
        textDecorationLine: 'underline',
        fontWeight: '600',
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
        marginRight: 8,
        color: '#555',
        width: 22,
        textAlign: 'center',
    },
    modalDetailLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#444',
        width: 70,
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
        lineHeight: 20,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 8,
    },
    tagBadge: {
        backgroundColor: '#F0F2FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E4FF',
    },
    tagText: {
        fontSize: 12,
        color: '#5B67CA',
        fontWeight: '600',
    },
    modernInfoContent: {
        flex: 1,
    },
    modernInfoLabel: {
        fontSize: 14,
        color: '#5B67CA',
        marginBottom: 4,
        fontWeight: '700',
    },
    modernInfoValue: {
        fontSize: 15,
        color: '#333333',
        lineHeight: 22,
        fontWeight: '400',
    },
    linkText: {
        color: '#5B67CA',
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
});

export default ScheduleDetailScreen;

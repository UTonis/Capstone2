import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CityDetailScreenProps {
    city: {
        id: number;
        name: string;
        image: string;
    };
    onBack: () => void;
}

const CityDetailScreen = ({ city, onBack }: CityDetailScreenProps) => {
    // 도시별 추천 장소 목업 데이터
    const attractions = [
        {
            id: 1,
            name: '한라산 국립공원',
            category: '자연',
            image: 'https://picsum.photos/400/300?random=10',
            rating: 4.8,
            description: '제주도의 상징, 아름다운 등산 코스',
        },
        {
            id: 2,
            name: '성산 일출봉',
            category: '자연',
            image: 'https://picsum.photos/400/300?random=11',
            rating: 4.9,
            description: '유네스코 세계자연유산, 일출 명소',
        },
        {
            id: 3,
            name: '협재 해수욕장',
            category: '해변',
            image: 'https://picsum.photos/400/300?random=12',
            rating: 4.7,
            description: '에메랄드빛 바다와 백사장',
        },
        {
            id: 4,
            name: '동문시장',
            category: '맛집',
            image: 'https://picsum.photos/400/300?random=13',
            rating: 4.6,
            description: '제주 전통 시장, 다양한 먹거리',
        },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 뒤로</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{city.name}</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 도시 메인 이미지 */}
                <Image
                    source={{ uri: city.image }}
                    style={styles.cityImage}
                    resizeMode="cover"
                />

                {/* 도시 소개 */}
                <View style={styles.introSection}>
                    <Text style={styles.cityName}>{city.name}</Text>
                    <Text style={styles.cityDescription}>
                        아름다운 자연과 독특한 문화가 어우러진 {city.name}에서
                        특별한 여행을 즐겨보세요.
                    </Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>50+</Text>
                            <Text style={styles.statLabel}>관광지</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>100+</Text>
                            <Text style={styles.statLabel}>맛집</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>4.8</Text>
                            <Text style={styles.statLabel}>평점</Text>
                        </View>
                    </View>
                </View>

                {/* 추천 관광지 */}
                <View style={styles.attractionsSection}>
                    <Text style={styles.sectionTitle}>추천 관광지</Text>

                    {attractions.map((attraction) => (
                        <TouchableOpacity key={attraction.id} style={styles.attractionCard}>
                            <Image
                                source={{ uri: attraction.image }}
                                style={styles.attractionImage}
                                resizeMode="cover"
                            />
                            <View style={styles.attractionInfo}>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{attraction.category}</Text>
                                </View>
                                <Text style={styles.attractionName}>{attraction.name}</Text>
                                <Text style={styles.attractionDescription}>
                                    {attraction.description}
                                </Text>
                                <View style={styles.ratingContainer}>
                                    <Text style={styles.rating}>⭐ {attraction.rating}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 여행 팁 */}
                <View style={styles.tipsSection}>
                    <Text style={styles.sectionTitle}>여행 팁</Text>

                    <View style={styles.tipCard}>
                        <Text style={styles.tipIcon}>🚗</Text>
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>교통</Text>
                            <Text style={styles.tipText}>
                                렌터카 이용을 추천합니다. 대중교통이 불편할 수 있어요.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipCard}>
                        <Text style={styles.tipIcon}>🌤️</Text>
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>날씨</Text>
                            <Text style={styles.tipText}>
                                바람이 많이 부니 겉옷을 꼭 챙기세요.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tipCard}>
                        <Text style={styles.tipIcon}>🍊</Text>
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>특산물</Text>
                            <Text style={styles.tipText}>
                                감귤, 흑돼지, 해산물이 유명해요.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* 하단 액션 버튼 */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.planButton}>
                    <Text style={styles.planButtonText}>일정 만들기</Text>
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    placeholder: {
        width: 60,
    },
    content: {
        flex: 1,
    },
    cityImage: {
        width: '100%',
        height: 250,
        backgroundColor: '#F5F5F5',
    },
    introSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginBottom: 12,
    },
    cityName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 12,
    },
    cityDescription: {
        fontSize: 15,
        color: '#666666',
        lineHeight: 22,
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5B67CA',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#888888',
    },
    attractionsSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 16,
    },
    attractionCard: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
    },
    attractionImage: {
        width: 120,
        height: 120,
        backgroundColor: '#E0E0E0',
    },
    attractionInfo: {
        flex: 1,
        padding: 12,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 6,
    },
    categoryText: {
        fontSize: 11,
        color: '#4CAF50',
        fontWeight: '600',
    },
    attractionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    attractionDescription: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2B2B2B',
    },
    tipsSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginBottom: 20,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    tipIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    tipText: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
    },
    bottomActions: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    planButton: {
        backgroundColor: '#5B67CA',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    planButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CityDetailScreen;

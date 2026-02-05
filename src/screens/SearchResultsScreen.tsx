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

interface SearchResultsScreenProps {
    searchQuery: string;
    onBack: () => void;
    onSelectResult: (result: any) => void;
}

const SearchResultsScreen = ({ searchQuery, onBack, onSelectResult }: SearchResultsScreenProps) => {
    // 검색 결과 목업 데이터
    const searchResults = [
        {
            id: 1,
            title: '제주도 한라산',
            location: '제주특별자치도',
            category: '자연',
            image: 'https://picsum.photos/400/300?random=1',
            rating: 4.8,
            reviews: 1234,
        },
        {
            id: 2,
            title: '부산 해운대',
            location: '부산광역시',
            category: '해변',
            image: 'https://picsum.photos/400/300?random=2',
            rating: 4.7,
            reviews: 892,
        },
        {
            id: 3,
            title: '경주 불국사',
            location: '경상북도 경주시',
            category: '역사',
            image: 'https://picsum.photos/400/300?random=3',
            rating: 4.9,
            reviews: 567,
        },
        {
            id: 4,
            title: '강원도 설악산',
            location: '강원도 속초시',
            category: '자연',
            image: 'https://picsum.photos/400/300?random=4',
            rating: 4.6,
            reviews: 432,
        },
    ];

    // 검색어로 필터링
    const filteredResults = searchResults.filter(
        (result) =>
            result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 뒤로</Text>
                </TouchableOpacity>
                <View style={styles.searchInfo}>
                    <Text style={styles.searchQuery}>"{searchQuery}"</Text>
                    <Text style={styles.resultCount}>
                        {filteredResults.length}개의 결과
                    </Text>
                </View>
            </View>

            {/* 검색 결과 */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {filteredResults.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
                        <Text style={styles.emptyText}>
                            다른 키워드로 검색해보세요
                        </Text>
                    </View>
                ) : (
                    <View style={styles.resultsContainer}>
                        {filteredResults.map((result) => (
                            <TouchableOpacity
                                key={result.id}
                                style={styles.resultCard}
                                onPress={() => onSelectResult(result)}
                            >
                                <Image
                                    source={{ uri: result.image }}
                                    style={styles.resultImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.resultInfo}>
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryText}>{result.category}</Text>
                                    </View>
                                    <Text style={styles.resultTitle}>{result.title}</Text>
                                    <Text style={styles.resultLocation}>📍 {result.location}</Text>
                                    <View style={styles.ratingContainer}>
                                        <Text style={styles.rating}>⭐ {result.rating}</Text>
                                        <Text style={styles.reviews}>({result.reviews})</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        paddingVertical: 4,
        marginBottom: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    searchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchQuery: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
    },
    resultCount: {
        fontSize: 14,
        color: '#888888',
    },
    content: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#888888',
    },
    resultsContainer: {
        padding: 16,
    },
    resultCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    resultImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#F5F5F5',
    },
    resultInfo: {
        padding: 16,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 6,
    },
    resultLocation: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2B2B2B',
        marginRight: 4,
    },
    reviews: {
        fontSize: 14,
        color: '#888888',
    },
});

export default SearchResultsScreen;

/**
 * Recommend Screen - 유사 여행지 추천 화면
 * 카테고리 선택 기반 추천 여행지 표시
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RecommendScreenProps {
    onBack: () => void;
}

// 카테고리 데이터
const categories = [
    { id: 'nature', label: '자연' },
    { id: 'city', label: '도시' },
    { id: 'culture', label: '문화' },
    { id: 'food', label: '맛집' },
    { id: 'healing', label: '힐링' },
];

// 추천 데이터 (카테고리별)
const recommendData: Record<string, Array<{
    id: number;
    name: string;
    location: string;
    description: string;
    image: string;
}>> = {
    nature: [
        { id: 1, name: '제주 성산일출봉', location: '제주도', description: '유네스코 세계자연유산', image: 'https://picsum.photos/400/250?random=20' },
        { id: 2, name: '설악산 국립공원', location: '강원도', description: '한국의 대표 명산', image: 'https://picsum.photos/400/250?random=21' },
        { id: 3, name: '순천만 습지', location: '전라남도', description: '천연기념물 서식지', image: 'https://picsum.photos/400/250?random=22' },
    ],
    city: [
        { id: 1, name: '홍대거리', location: '서울', description: '젊음과 문화의 거리', image: 'https://picsum.photos/400/250?random=23' },
        { id: 2, name: '해운대', location: '부산', description: '대한민국 대표 해변', image: 'https://picsum.photos/400/250?random=24' },
        { id: 3, name: '동성로', location: '대구', description: '패션과 맛집의 중심', image: 'https://picsum.photos/400/250?random=25' },
    ],
    culture: [
        { id: 1, name: '경복궁', location: '서울', description: '조선왕조 대표 궁궐', image: 'https://picsum.photos/400/250?random=26' },
        { id: 2, name: '안동 하회마을', location: '경상북도', description: '유네스코 세계문화유산', image: 'https://picsum.photos/400/250?random=27' },
        { id: 3, name: '전주 한옥마을', location: '전라북도', description: '전통과 현대의 조화', image: 'https://picsum.photos/400/250?random=28' },
    ],
    food: [
        { id: 1, name: '전주 비빔밥 거리', location: '전주', description: '본고장 전주비빔밥', image: 'https://picsum.photos/400/250?random=29' },
        { id: 2, name: '부산 자갈치시장', location: '부산', description: '신선한 해산물의 천국', image: 'https://picsum.photos/400/250?random=30' },
        { id: 3, name: '속초 중앙시장', location: '강원도', description: '닭강정과 순대골목', image: 'https://picsum.photos/400/250?random=31' },
    ],
    healing: [
        { id: 1, name: '남이섬', location: '강원도', description: '자연 속 힐링 명소', image: 'https://picsum.photos/400/250?random=32' },
        { id: 2, name: '보성 녹차밭', location: '전라남도', description: '푸른 차밭의 여유', image: 'https://picsum.photos/400/250?random=33' },
        { id: 3, name: '담양 메타세쿼이아길', location: '전라남도', description: '아름다운 가로수길', image: 'https://picsum.photos/400/250?random=34' },
    ],
};

function RecommendScreen({ onBack }: RecommendScreenProps) {
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState<string>('nature');

    const recommendations = recommendData[selectedCategory] || [];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>유사 여행지 추천</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* 설명 */}
                <View style={styles.descriptionSection}>
                    <Text style={styles.description}>
                        원하는 여행 스타일을 선택하면{'\n'}비슷한 분위기의 여행지를 추천해드려요.
                    </Text>
                </View>

                {/* 카테고리 선택 */}
                <View style={styles.categorySection}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoryContainer}
                    >
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryButton,
                                    selectedCategory === cat.id && styles.categoryButtonActive,
                                ]}
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <Text
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === cat.id && styles.categoryTextActive,
                                    ]}
                                >
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* 추천 목록 */}
                <View style={styles.recommendSection}>
                    <Text style={styles.sectionTitle}>추천 여행지</Text>
                    {recommendations.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.recommendCard}>
                            <Image
                                source={{ uri: item.image }}
                                style={styles.recommendImage}
                                resizeMode="cover"
                            />
                            <View style={styles.recommendContent}>
                                <Text style={styles.recommendName}>{item.name}</Text>
                                <Text style={styles.recommendLocation}>{item.location}</Text>
                                <Text style={styles.recommendDescription}>
                                    {item.description}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 24,
        color: '#2B2B2B',
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2B2B2B',
    },
    headerPlaceholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    descriptionSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryContainer: {
        paddingHorizontal: 16,
    },
    categoryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        marginRight: 10,
    },
    categoryButtonActive: {
        backgroundColor: '#5B67CA',
    },
    categoryText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    recommendSection: {
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 16,
    },
    recommendCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    recommendImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#F0F0F0',
    },
    recommendContent: {
        padding: 16,
    },
    recommendName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 4,
    },
    recommendLocation: {
        fontSize: 13,
        color: '#5B67CA',
        marginBottom: 8,
    },
    recommendDescription: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
    },
});

export default RecommendScreen;

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

interface ReviewDetailScreenProps {
    review: {
        id: number;
        title: string;
        author: string;
        image: string;
        location?: string;
    };
    onBack: () => void;
}

const ReviewDetailScreen = ({ review, onBack }: ReviewDetailScreenProps) => {
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 뒤로</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 메인 이미지 */}
                <Image
                    source={{ uri: review.image }}
                    style={styles.mainImage}
                    resizeMode="cover"
                />

                {/* 리뷰 정보 */}
                <View style={styles.infoSection}>
                    <Text style={styles.title}>{review.title}</Text>

                    <View style={styles.authorSection}>
                        <View style={styles.authorAvatar}>
                            <Text style={styles.authorAvatarText}>
                                {review.author?.charAt(0) || '?'}
                            </Text>
                        </View>
                        <View style={styles.authorInfo}>
                            <Text style={styles.authorName}>{review.author || '여행자'}</Text>
                            <Text style={styles.reviewDate}>2024년 1월</Text>
                        </View>
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>⭐ 4.8</Text>
                        </View>
                    </View>

                    {/* 여행 정보 */}
                    <View style={styles.travelInfo}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoIcon}>📍</Text>
                            <Text style={styles.infoText}>{review.location || '제주도'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoIcon}>📅</Text>
                            <Text style={styles.infoText}>3박 4일</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoIcon}>👥</Text>
                            <Text style={styles.infoText}>가족 여행</Text>
                        </View>
                    </View>

                    {/* 리뷰 내용 */}
                    <View style={styles.reviewContent}>
                        <Text style={styles.sectionTitle}>여행 후기</Text>
                        <Text style={styles.reviewText}>
                            정말 멋진 여행이었습니다! 날씨도 좋았고 가족들과 함께 즐거운 시간을 보냈어요.
                            특히 현지 음식이 정말 맛있었고, 추천해주신 관광지들도 모두 만족스러웠습니다.
                            {'\n\n'}
                            다음에 또 방문하고 싶은 곳이에요. 특히 일몰이 정말 아름다웠습니다.
                            사진으로는 담을 수 없는 감동이 있었어요.
                        </Text>
                    </View>

                    {/* 방문한 장소 */}
                    <View style={styles.placesSection}>
                        <Text style={styles.sectionTitle}>방문한 장소</Text>
                        <View style={styles.placesList}>
                            <View style={styles.placeItem}>
                                <Text style={styles.placeEmoji}>🏖️</Text>
                                <Text style={styles.placeName}>협재 해수욕장</Text>
                            </View>
                            <View style={styles.placeItem}>
                                <Text style={styles.placeEmoji}>🌋</Text>
                                <Text style={styles.placeName}>성산 일출봉</Text>
                            </View>
                            <View style={styles.placeItem}>
                                <Text style={styles.placeEmoji}>🍊</Text>
                                <Text style={styles.placeName}>감귤 체험 농장</Text>
                            </View>
                        </View>
                    </View>

                    {/* 팁 */}
                    <View style={styles.tipsSection}>
                        <Text style={styles.sectionTitle}>여행 팁</Text>
                        <View style={styles.tipCard}>
                            <Text style={styles.tipIcon}>💡</Text>
                            <Text style={styles.tipText}>
                                렌터카를 미리 예약하면 더 저렴해요
                            </Text>
                        </View>
                        <View style={styles.tipCard}>
                            <Text style={styles.tipIcon}>💡</Text>
                            <Text style={styles.tipText}>
                                일출을 보려면 새벽 5시에 출발하세요
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* 하단 액션 버튼 */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.likeButton}>
                    <Text style={styles.likeButtonText}>❤️ 좋아요</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>📤 공유하기</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        paddingVertical: 4,
    },
    backButtonText: {
        fontSize: 16,
        color: '#5B67CA',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    mainImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#F5F5F5',
    },
    infoSection: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 16,
    },
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    authorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#5B67CA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    authorAvatarText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    authorInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2B2B2B',
        marginBottom: 2,
    },
    reviewDate: {
        fontSize: 13,
        color: '#888888',
    },
    ratingBadge: {
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2B2B2B',
    },
    travelInfo: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    infoIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#666666',
    },
    reviewContent: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2B2B2B',
        marginBottom: 12,
    },
    reviewText: {
        fontSize: 15,
        color: '#333333',
        lineHeight: 24,
    },
    placesSection: {
        marginBottom: 24,
    },
    placesList: {
        gap: 12,
    },
    placeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 8,
    },
    placeEmoji: {
        fontSize: 20,
        marginRight: 12,
    },
    placeName: {
        fontSize: 15,
        color: '#2B2B2B',
        fontWeight: '500',
    },
    tipsSection: {
        marginBottom: 20,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    tipIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#2B2B2B',
    },
    bottomActions: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        gap: 12,
    },
    likeButton: {
        flex: 1,
        backgroundColor: '#FFE5E5',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    likeButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#E74C3C',
    },
    shareButton: {
        flex: 1,
        backgroundColor: '#E8F5E9',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    shareButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4CAF50',
    },
});

export default ReviewDetailScreen;

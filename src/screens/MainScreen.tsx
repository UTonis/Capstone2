/**
 * Main Screen - Travel App Home
 * Based on TRIPLE app design
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { travelCards, recommendedCities } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import baseStyles from '../styles/MainScreenStyles';

interface MainScreenProps {
    onNavigateToFeatures?: () => void;
    onNavigateToMap?: () => void;
    onNavigateToAIPlanner?: () => void;
    onNavigateToSearch?: (query: string) => void;
    onNavigateToReviewDetail?: (review: any) => void;
    onNavigateToCityDetail?: (city: any) => void;
    onNavigateToProfile?: () => void;
    onNavigateToMyTrips?: () => void;
    onNavigateToSavedPlaces?: () => void;
    onNavigateToPhotoInput?: () => void;
    onNavigateToSchedule?: () => void;
    onNavigateToRecommend?: () => void;
}

function MainScreen({
    onNavigateToFeatures,
    onNavigateToMap,
    onNavigateToAIPlanner,
    onNavigateToSearch,
    onNavigateToReviewDetail,
    onNavigateToCityDetail,
}: MainScreenProps) {
    const insets = useSafeAreaInsets();
    const { isLoggedIn, user } = useAuth();
    const [searchText, setSearchText] = useState('');

    return (
        <View style={baseStyles.rootContainer}>
            {/* 메인 콘텐츠 */}
            <View
                style={[
                    baseStyles.mainContainer,
                    {
                        paddingTop: insets.top,
                    }
                ]}
            >
                {/* 헤더 with 검색바 */}
                <View style={styles.headerWithSearch}>
                    <Text style={styles.logoText}>PtoT</Text>
                    <View style={styles.headerSearchBar}>
                        <Text style={styles.searchIcon}>⌕</Text>
                        <TextInput
                            style={styles.headerSearchInput}
                            placeholder="여행지를 검색해보세요"
                            placeholderTextColor="#999999"
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={() => {
                                if (searchText.trim() && onNavigateToSearch) {
                                    onNavigateToSearch(searchText);
                                }
                            }}
                            returnKeyType="search"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')}>
                                <Text style={styles.clearButton}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <ScrollView
                    style={baseStyles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 인사말 섹션 */}
                    <View style={baseStyles.greetingSection}>
                        <Text style={baseStyles.greetingText}>
                            <Text style={baseStyles.userNameHighlight}>
                                {isLoggedIn ? user?.name : '게스트'}
                            </Text>님, 여행 고민 중인가요?
                        </Text>
                        <Text style={baseStyles.greetingSubtext}>어디 가면 좋을지 알려드려요</Text>
                    </View>

                    {/* 리뷰 카드 그리드 */}
                    <View style={baseStyles.reviewGridContainer}>
                        <View style={baseStyles.reviewRow}>
                            <TouchableOpacity
                                style={baseStyles.reviewCard}
                                onPress={() => onNavigateToReviewDetail && onNavigateToReviewDetail(travelCards[0])}
                            >
                                <Image
                                    source={{ uri: travelCards[0]?.image }}
                                    style={baseStyles.reviewImage}
                                    resizeMode="cover"
                                />
                                <Text style={baseStyles.reviewTitle}>{travelCards[0]?.title}</Text>
                                <Text style={baseStyles.reviewAuthor}>⭐ 4.8 · {travelCards[0]?.author || '여행자'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={baseStyles.reviewCard}
                                onPress={() => onNavigateToReviewDetail && onNavigateToReviewDetail(travelCards[1])}
                            >
                                <Image
                                    source={{ uri: travelCards[1]?.image }}
                                    style={baseStyles.reviewImage}
                                    resizeMode="cover"
                                />
                                <Text style={baseStyles.reviewTitle}>{travelCards[1]?.title}</Text>
                                <Text style={baseStyles.reviewAuthor}>⭐ 4.9 · {travelCards[1]?.author || '여행자'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={baseStyles.reviewRow}>
                            <TouchableOpacity
                                style={baseStyles.reviewCard}
                                onPress={() => onNavigateToReviewDetail && onNavigateToReviewDetail(travelCards[2])}
                            >
                                <Image
                                    source={{ uri: travelCards[2]?.image }}
                                    style={baseStyles.reviewImage}
                                    resizeMode="cover"
                                />
                                <Text style={baseStyles.reviewTitle}>{travelCards[2]?.title}</Text>
                                <Text style={baseStyles.reviewAuthor}>⭐ 4.7 · {travelCards[2]?.author || '여행자'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={baseStyles.reviewCard}
                                onPress={() => onNavigateToReviewDetail && onNavigateToReviewDetail(travelCards[3])}
                            >
                                <Image
                                    source={{ uri: travelCards[3]?.image }}
                                    style={baseStyles.reviewImage}
                                    resizeMode="cover"
                                />
                                <Text style={baseStyles.reviewTitle}>{travelCards[3]?.title}</Text>
                                <Text style={baseStyles.reviewAuthor}>⭐ 4.6 · {travelCards[3]?.author || '여행자'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* AI 플래너 CTA 버튼 */}
                    <TouchableOpacity style={baseStyles.aiPlannerCTA} onPress={onNavigateToAIPlanner}>
                        <View style={baseStyles.aiPlannerCTAContent}>
                            <Text style={baseStyles.aiPlannerCTATitle}>AI 여행 플래너</Text>
                            <Text style={baseStyles.aiPlannerCTASubtitle}>
                                AI가 맞춤 여행 일정을 만들어드려요
                            </Text>
                        </View>
                        <Text style={baseStyles.aiPlannerCTAArrow}>→</Text>
                    </TouchableOpacity>

                    {/* 프로모션 배너 */}
                    <TouchableOpacity
                        style={baseStyles.promoBanner}
                        onPress={() => console.log('프로모션 상세 - 기능 미구현')}
                    >
                        <View style={baseStyles.promoContent}>
                            <Text style={baseStyles.promoTitle}>현지 맛집 예약 걱정은 그만</Text>
                            <Text style={baseStyles.promoSubtitle}>24시간 언제든지 해외 식당 예약 완료!</Text>
                        </View>
                        <View style={baseStyles.promoImageContainer}>
                            <Text style={baseStyles.promoEmoji}>🍔</Text>
                        </View>
                    </TouchableOpacity>

                    {/* 여행 일정짜기 & 지도 버튼 */}
                    <View style={baseStyles.actionButtonsContainer}>
                        <TouchableOpacity style={baseStyles.planButton} onPress={onNavigateToFeatures}>
                            <Text style={baseStyles.planButtonText}>여행 일정짜기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={baseStyles.mapButton} onPress={onNavigateToMap}>
                            <Text style={baseStyles.mapButtonText}>지도 보기</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 추천 도시 섹션 */}
                    <View style={baseStyles.recommendSection}>
                        <Text style={baseStyles.sectionTitle}>내 취향에 맞는 추천 도시</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={baseStyles.citiesContainer}
                        >
                            {recommendedCities.map((city) => (
                                <TouchableOpacity
                                    key={city.id}
                                    style={baseStyles.cityCard}
                                    onPress={() => onNavigateToCityDetail && onNavigateToCityDetail(city)}
                                >
                                    <Image
                                        source={{ uri: city.image }}
                                        style={baseStyles.cityImage}
                                        resizeMode="cover"
                                    />
                                    <Text style={baseStyles.cityName}>{city.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 하단 여백 */}
                    <View style={{ height: 20 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerWithSearch: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#5B67CA',
        marginRight: 12,
    },
    headerSearchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    searchIcon: {
        fontSize: 18,
        color: '#999999',
        marginRight: 8,
    },
    headerSearchInput: {
        flex: 1,
        fontSize: 14,
        color: '#2B2B2B',
        padding: 0,
    },
    clearButton: {
        fontSize: 16,
        color: '#999999',
        paddingHorizontal: 4,
    },
});

export default MainScreen;

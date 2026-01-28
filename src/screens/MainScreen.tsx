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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { travelCards, recommendedCities } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import styles, { CARD_WIDTH, SIDEBAR_WIDTH } from '../styles/MainScreenStyles';

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
}

function MainScreen({
    onNavigateToFeatures,
    onNavigateToMap,
    onNavigateToAIPlanner,
    onNavigateToSearch,
    onNavigateToReviewDetail,
    onNavigateToCityDetail,
    onNavigateToProfile,
    onNavigateToMyTrips,
    onNavigateToSavedPlaces
}: MainScreenProps) {
    const insets = useSafeAreaInsets();
    const { isLoggedIn, user, login, logout } = useAuth();
    const [searchText, setSearchText] = useState('');
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const openSidebar = () => {
        setSidebarVisible(true);
    };

    const closeSidebar = () => {
        setSidebarVisible(false);
    };

    return (
        <View style={styles.rootContainer}>
            {/* 메인 콘텐츠 */}
            <View
                style={[
                    styles.mainContainer,
                    {
                        paddingTop: insets.top,
                    }
                ]}
            >
                {/* 헤더 */}
                <View style={styles.header}>
                    <Text style={styles.logo}>응애</Text>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.headerIcon}
                            onPress={openSidebar}
                        >
                            <Text style={styles.headerIconText}>☰</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 검색바 */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <Text style={styles.searchIcon}>⌕</Text>
                            <TextInput
                                style={styles.searchInput}
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

                    {/* 인사말 섹션 */}
                    <View style={styles.greetingSection}>
                        <Text style={styles.greetingText}>
                            <Text style={styles.userNameHighlight}>
                                {isLoggedIn ? user?.name : '게스트'}
                            </Text>님, 여행 고민 중인가요?
                        </Text>
                        <Text style={styles.greetingSubtext}>어디 가면 좋을지 알려드려요</Text>
                    </View>

                    {/* 리뷰 카드 그리드 */}
                    <View style={styles.reviewGridContainer}>
                        <View style={styles.reviewRow}>
                            <TouchableOpacity
                                style={styles.reviewCard}
                                onPress={() => onNavigateToReviewDetail && onNavigateToReviewDetail(travelCards[0])}
                            >
                                <Image
                                    source={{ uri: travelCards[0]?.image }}
                                    style={styles.reviewImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.reviewTitle}>{travelCards[0]?.title}</Text>
                                <Text style={styles.reviewAuthor}>⭐ 4.8 · {travelCards[0]?.author || '여행자'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.reviewCard}
                                onPress={() => onNavigateToReviewDetail && onNavigateToReviewDetail(travelCards[1])}
                            >
                                <Image
                                    source={{ uri: travelCards[1]?.image }}
                                    style={styles.reviewImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.reviewTitle}>{travelCards[1]?.title}</Text>
                                <Text style={styles.reviewAuthor}>⭐ 4.9 · {travelCards[1]?.author || '여행자'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.reviewRow}>
                            <TouchableOpacity
                                style={styles.reviewCard}
                                onPress={() => onNavigateToReviewDetail && onNavigateToReviewDetail(travelCards[2])}
                            >
                                <Image
                                    source={{ uri: travelCards[2]?.image }}
                                    style={styles.reviewImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.reviewTitle}>{travelCards[2]?.title}</Text>
                                <Text style={styles.reviewAuthor}>⭐ 4.7 · {travelCards[2]?.author || '여행자'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.reviewCard}
                                onPress={() => onNavigateToReviewDetail && onNavigateToReviewDetail(travelCards[3])}
                            >
                                <Image
                                    source={{ uri: travelCards[3]?.image }}
                                    style={styles.reviewImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.reviewTitle}>{travelCards[3]?.title}</Text>
                                <Text style={styles.reviewAuthor}>⭐ 4.6 · {travelCards[3]?.author || '여행자'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* AI 플래너 CTA 버튼 */}
                    <TouchableOpacity style={styles.aiPlannerCTA} onPress={onNavigateToAIPlanner}>
                        <View style={styles.aiPlannerCTAContent}>
                            <Text style={styles.aiPlannerCTATitle}>AI 여행 플래너</Text>
                            <Text style={styles.aiPlannerCTASubtitle}>
                                AI가 맞춤 여행 일정을 만들어드려요
                            </Text>
                        </View>
                        <Text style={styles.aiPlannerCTAArrow}>→</Text>
                    </TouchableOpacity>

                    {/* 프로모션 배너 */}
                    <TouchableOpacity
                        style={styles.promoBanner}
                        onPress={() => console.log('프로모션 상세 - 기능 미구현')}
                    >
                        <View style={styles.promoContent}>
                            <Text style={styles.promoTitle}>현지 맛집 예약 걱정은 그만</Text>
                            <Text style={styles.promoSubtitle}>24시간 언제든지 해외 식당 예약 완료!</Text>
                        </View>
                        <View style={styles.promoImageContainer}>
                            <Text style={styles.promoEmoji}>🍔</Text>
                        </View>
                    </TouchableOpacity>

                    {/* 여행 일정짜기 & 지도 버튼 */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.planButton} onPress={onNavigateToFeatures}>
                            <Text style={styles.planButtonText}>여행 일정짜기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mapButton} onPress={onNavigateToMap}>
                            <Text style={styles.mapButtonText}>지도 보기</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 추천 도시 섹션 */}
                    <View style={styles.recommendSection}>
                        <Text style={styles.sectionTitle}>내 취향에 맞는 추천 도시</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.citiesContainer}
                        >
                            {recommendedCities.map((city) => (
                                <TouchableOpacity
                                    key={city.id}
                                    style={styles.cityCard}
                                    onPress={() => onNavigateToCityDetail && onNavigateToCityDetail(city)}
                                >
                                    <Image
                                        source={{ uri: city.image }}
                                        style={styles.cityImage}
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.cityName}>{city.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 하단 여백 */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>

            {/* Sidebar 컴포넌트 사용 */}
            <Sidebar
                visible={sidebarVisible}
                onClose={closeSidebar}
                onNavigateToProfile={onNavigateToProfile}
                onNavigateToMyTrips={onNavigateToMyTrips}
                onNavigateToSavedPlaces={onNavigateToSavedPlaces}
            />
        </View>
    );
}

export default MainScreen;

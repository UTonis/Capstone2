/**
 * Main Screen - Travel App Home
 * Based on TRIPLE app design
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Animated,
    TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { travelCards, recommendedCities } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import styles, { CARD_WIDTH, SIDEBAR_WIDTH } from '../styles/MainScreenStyles';

// 메뉴 아이템 데이터
const menuItems = [
    { id: 1, icon: '🏠', label: '홈' },
    { id: 2, icon: '👤', label: '내 정보' },
    { id: 3, icon: '❤️', label: '찜한 여행지' },
    { id: 4, icon: '📅', label: '내 일정' },
    { id: 5, icon: '💬', label: '알림' },
    { id: 6, icon: '⚙️', label: '설정' },
];

interface MainScreenProps {
    onNavigateToFeatures?: () => void;
}

function MainScreen({ onNavigateToFeatures }: MainScreenProps) {
    const insets = useSafeAreaInsets();
    const { isLoggedIn, user, login, logout } = useAuth();
    const [searchText, setSearchText] = useState('');
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;

    // 테스트용 로그인 함수
    const handleLogin = () => {
        login({
            id: '1',
            name: '홍길동',
            email: 'hong@example.com',
        });
        closeSidebar();
    };

    // 로그아웃 처리
    const handleLogout = () => {
        logout();
        closeSidebar();
    };

    const openSidebar = () => {
        setSidebarVisible(true);
        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const closeSidebar = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setSidebarVisible(false);
        });
    };

    const sidebarTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [SIDEBAR_WIDTH, 0],
    });

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
                    <TouchableOpacity
                        style={styles.headerIcon}
                        onPress={openSidebar}
                    >
                        <Text style={styles.headerIconText}>☰</Text>
                    </TouchableOpacity>
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
                            />
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

                    {/* 여행 카드 섹션 */}
                    <View style={styles.cardsContainer}>
                        {travelCards.map((card) => (
                            <TouchableOpacity key={card.id} style={styles.travelCard}>
                                <Image
                                    source={{ uri: card.image }}
                                    style={styles.cardImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.cardOverlay}>
                                    {card.type === 'review' && (
                                        <View style={styles.authorBadge}>
                                            <Text style={styles.authorText}>{card.author}</Text>
                                        </View>
                                    )}
                                    {card.type === 'list' && (
                                        <View style={styles.listBadge}>
                                            <Text style={styles.listBadgeText}>🔴 {card.count}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{card.title}</Text>
                                    <Text style={styles.cardLocation}>{card.location}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 프로모션 배너 */}
                    <View style={styles.promoBanner}>
                        <View style={styles.promoContent}>
                            <Text style={styles.promoTitle}>현지 맛집 예약 걱정은 그만</Text>
                            <Text style={styles.promoSubtitle}>24시간 언제든지 해외 식당 예약 완료!</Text>
                        </View>
                        <View style={styles.promoImageContainer}>
                            <Text style={styles.promoEmoji}>🍔</Text>
                        </View>
                    </View>

                    {/* 여행 일정짜기 버튼 */}
                    <TouchableOpacity style={styles.planButton} onPress={onNavigateToFeatures}>
                        <Text style={styles.planButtonText}>여행 일정짜기</Text>
                    </TouchableOpacity>

                    {/* 추천 도시 섹션 */}
                    <View style={styles.recommendSection}>
                        <Text style={styles.sectionTitle}>내 취향에 맞는 추천 도시</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.citiesContainer}
                        >
                            {recommendedCities.map((city) => (
                                <TouchableOpacity key={city.id} style={styles.cityCard}>
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

            {/* 오버레이 (사이드바 열렸을 때) */}
            {sidebarVisible && (
                <TouchableWithoutFeedback onPress={closeSidebar}>
                    <Animated.View
                        style={[
                            styles.overlay,
                            { opacity: slideAnim }
                        ]}
                    />
                </TouchableWithoutFeedback>
            )}

            {/* 사이드바 */}
            <Animated.View
                style={[
                    styles.sidebar,
                    {
                        paddingTop: insets.top + 20,
                        transform: [{ translateX: sidebarTranslateX }],
                    }
                ]}
            >
                {/* 프로필 섹션 */}
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{isLoggedIn ? '😊' : '👤'}</Text>
                    </View>
                    {isLoggedIn ? (
                        <>
                            <Text style={styles.sidebarUserName}>{user?.name}님</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.sidebarUserName}>게스트</Text>
                            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                                <Text style={styles.loginButtonText}>로그인</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* 구분선 */}
                <View style={styles.divider} />

                {/* 메뉴 아이템들 */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={closeSidebar}
                        >
                            <Text style={styles.menuIcon}>{item.icon}</Text>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 하단 로그아웃 버튼 (로그인 시에만 표시) */}
                {isLoggedIn && (
                    <View style={styles.bottomSection}>
                        <TouchableOpacity style={styles.sidebarActionButton} onPress={handleLogout}>
                            <Text style={styles.sidebarActionButtonText}>로그아웃</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </View>
    );
}

export default MainScreen;

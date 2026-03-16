/**
 * Travel App - Main Entry Point
 * Based on TRIPLE app design
 */

import React, { useState } from 'react';
import { View, StatusBar, useColorScheme, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import CustomAlert from './src/components/CustomAlert';
import MainScreen from './src/screens/Main/MainScreen';
import FeaturesScreen from './src/screens/Explore/FeaturesScreen';
// import PhotoInputScreen from './src/screens/Photo/PhotoInputScreen';
import RecommendScreen from './src/screens/Recommend/RecommendScreen';
import ScheduleScreen from './src/screens/Schedule/ScheduleScreen';
import MapScreen from './src/screens/Explore/MapScreen';
import AIPlannerScreen from './src/screens/Photo/AIPlannerScreen';
import SearchResultsScreen from './src/screens/Explore/SearchResultsScreen';
import ReviewDetailScreen from './src/screens/Explore/ReviewDetailScreen';
import CityDetailScreen from './src/screens/Explore/CityDetailScreen';
import MyProfileScreen from './src/screens/Profile/MyProfileScreen';
import MyTripsScreen from './src/screens/Profile/MyTripsScreen';
import MySavedScreen from './src/screens/Profile/MySavedScreen';
import MyPostsScreen from './src/screens/Profile/MyPostsScreen';
import SavedPlacesScreen from './src/screens/Profile/SavedPlacesScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import BottomTabBar, { TabName } from './src/components/BottomTabBar';
import PlannerGenerateScreen from './src/screens/Schedule/PlannerGenerateScreen';
import PreferenceSurveyScreen from './src/screens/Profile/PreferenceSurveyScreen';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen';
import ChangePasswordScreen from './src/screens/Profile/ChangePasswordScreen';
import ScheduleDetailScreen from './src/screens/Schedule/ScheduleDetailScreen';
import PlannerChatScreen from './src/screens/Schedule/PlannerChatScreen';
import RecommendConditionScreen from './src/screens/Recommend/RecommendConditionScreen';
import BoardListScreen from './src/screens/Board/BoardListScreen';
import BoardDetailScreen from './src/screens/Board/BoardDetailScreen';
import BoardWriteScreen from './src/screens/Board/BoardWriteScreen';
import FestivalDetailScreen from './src/screens/Explore/FestivalDetailScreen';

type ScreenName = 'main' | 'features' | 'recommend' | 'schedule' | 'board' | 'map' | 'aiplanner' | 'search' | 'reviewDetail' | 'cityDetail' | 'profile' | 'myTrips' | 'mySaved' | 'myPosts' | 'savedPlaces' | 'register' | 'login' | 'plannerGenerate' | 'preferenceSurvey' | 'editProfile' | 'changePassword' | 'scheduleDetail' | 'plannerChat' | 'recommendCondition' | 'boardList' | 'boardDetail' | 'boardWrite' | 'festivalDetail';

// 탭 바에 해당하는 화면들
const TAB_SCREENS: ScreenName[] = ['main', 'recommend', 'aiplanner', 'board', 'profile'];

function AppMain() {
  const isDarkMode = useColorScheme() === 'dark';
  const { alertConfig, hideAlert } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabName>('home');

  // ScheduleDetail / PlannerChat 상태
  const [selectedTripId, setSelectedTripId] = useState<number>(0);
  const [selectedTripTitle, setSelectedTripTitle] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<number>(0);
  const [selectedFestival, setSelectedFestival] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedSearchPlace, setSelectedSearchPlace] = useState<any>(null);
  const [triggerCamera, setTriggerCamera] = useState(false);
  const [recommendInitialYear, setRecommendInitialYear] = useState<number | null>(null);
  const [recommendInitialMonth, setRecommendInitialMonth] = useState<number | null>(null);
  const [previousScreen, setPreviousScreen] = useState<ScreenName | null>(null);
  const [canDeletePost, setCanDeletePost] = useState(false);

  // 통합 검색 상태 유지용
  const [searchPlaces, setSearchPlaces] = useState<any[]>([]);
  const [searchFestivals, setSearchFestivals] = useState<any[]>([]);
  const [searchPosts, setSearchPosts] = useState<any[]>([]);

  // 통합 검색 상태 초기화
  const resetSearch = () => {
    setSearchQuery('');
    setSearchPlaces([]);
    setSearchFestivals([]);
    setSearchPosts([]);
  };

  const navigateTo = (screen: ScreenName) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
    // 추가: 로그인/회원가입 이동 시 탭을 '마이페이지'로 변경
    if (screen === 'login' || screen === 'register') {
      setActiveTab('profile');
    }
    // 기본적으로 삭제 권한은 false로 초기화 (필요한 경우에만 true로 설정)
    if (screen !== 'boardDetail') {
      setCanDeletePost(false);
    }
  };

  const navigateToSearch = (query: string) => {
    setPreviousScreen(currentScreen);
    if (!query) resetSearch();
    setSearchQuery(query);
    setCurrentScreen('search');
  };

  const navigateToReviewDetail = (review: any) => {
    setSelectedReview(review);
    setCurrentScreen('reviewDetail');
  };

  const navigateToCityDetail = (city: any) => {
    setSelectedCity(city);
    setCurrentScreen('cityDetail');
  };

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        navigateTo('main');
        break;
      case 'recommend':
        navigateTo('recommend');
        break;
      case 'photos':
        setTriggerCamera(true);
        navigateTo('aiplanner');
        break;
      case 'board':
        navigateTo('board');
        break;
      case 'profile':
        navigateTo('profile');
        break;
    }
  };

  // 현재 화면이 탭 바를 표시해야 하는지 확인
  const shouldShowTabBar = TAB_SCREENS.includes(currentScreen);

  // 스택 화면들 (탭이 아닌 화면 - 조건부 렌더링)
  const renderStackScreen = () => {
    switch (currentScreen) {
      case 'features':
        return (
          <FeaturesScreen
            onBack={() => navigateTo('main')}
            onNavigate={navigateTo}
          />
        );
      case 'map':
        return (
          <MapScreen
            onBack={() => {
              if (previousScreen === 'search') navigateTo('search');
              else navigateTo('main');
            }}
            scheduleItems={selectedSearchPlace ? [selectedSearchPlace] : undefined}
          />
        );
      case 'aiplanner':
        return (
          <AIPlannerScreen
            onBack={() => navigateTo('main')}
            onPlanCreated={() => handleTabPress('profile')}
            onNavigateToLogin={() => navigateTo('login')}
            onNavigateToGenerate={(data) => {
              setAnalysisData(data);
              navigateTo('plannerGenerate');
            }}
            triggerCamera={triggerCamera}
            onCameraTriggered={() => setTriggerCamera(false)}
          />
        );
      case 'search':
        return (
          <SearchResultsScreen
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            initialPlaces={searchPlaces}
            setInitialPlaces={setSearchPlaces}
            initialFestivals={searchFestivals}
            setInitialFestivals={setSearchFestivals}
            initialPosts={searchPosts}
            setInitialPosts={setSearchPosts}
            onBack={() => {
              resetSearch();
              navigateTo(previousScreen || 'main');
            }}
            onSelectPlace={(place) => {
              setSelectedSearchPlace({
                id: place.id,
                place: { name: place.name, latitude: place.latitude, longitude: place.longitude },
                latitude: place.latitude,
                longitude: place.longitude
              });
              setPreviousScreen('search');
              navigateTo('map');
            }}
            onSelectFestival={(festival) => {
              setSelectedFestival(festival);
              setPreviousScreen('search');
              navigateTo('festivalDetail');
            }}
            onSelectPost={(id) => {
              setSelectedPostId(id);
              setCanDeletePost(false);
              setPreviousScreen('search');
              navigateTo('boardDetail');
            }}
          />
        );
      case 'reviewDetail':
        return (
          <ReviewDetailScreen
            review={selectedReview}
            onBack={() => navigateTo('main')}
          />
        );
      case 'cityDetail':
        return (
          <CityDetailScreen
            city={selectedCity}
            onBack={() => navigateTo('main')}
          />
        );
      case 'myTrips':
        return (
          <MyTripsScreen
            onBack={() => handleTabPress('profile')}
            onNavigateToDetail={(id, title) => {
              setSelectedTripId(id);
              setSelectedTripTitle(title);
              navigateTo('scheduleDetail');
            }}
          />
        );
      case 'mySaved':
        return (
          <MySavedScreen
            onBack={() => handleTabPress('profile')}
            onNavigateToDetail={(postId: number) => {
              setPreviousScreen('mySaved');
              setSelectedPostId(postId);
              navigateTo('boardDetail');
            }}
          />
        );
      case 'myPosts':
        return (
          <MyPostsScreen
            onBack={() => handleTabPress('profile')}
            onNavigateToDetail={(postId: number) => {
              setPreviousScreen('myPosts');
              setSelectedPostId(postId);
              setCanDeletePost(true); // 내 게시글 관리화면이므로 삭제 허용
              navigateTo('boardDetail');
            }}
          />
        );
      case 'savedPlaces':
        return <SavedPlacesScreen onBack={() => navigateTo('main')} />;
      case 'register':
        return <RegisterScreen onBack={() => navigateTo('profile')} onRegisterSuccess={() => navigateTo('login')} onNavigateToLogin={() => navigateTo('login')} />;
      case 'login':
        return <LoginScreen onBack={() => navigateTo('profile')} onNavigateToRegister={() => navigateTo('register')} onLoginSuccess={() => handleTabPress('home')} />;
      case 'plannerGenerate':
        return (
          <PlannerGenerateScreen
            onBack={() => {
              setAnalysisData(null);
              navigateTo('aiplanner');
            }}
            onSuccess={() => navigateTo('myTrips')}
            onNavigateToDetail={(id, title) => {
              setSelectedTripId(id);
              setSelectedTripTitle(title);
              navigateTo('scheduleDetail');
            }}
            initialData={analysisData}
            onNavigateToLogin={() => navigateTo('login')}
          />
        );
      case 'preferenceSurvey':
        return <PreferenceSurveyScreen onBack={() => navigateTo('profile')} onNavigateToLogin={() => navigateTo('login')} />;
      case 'editProfile':
        return <EditProfileScreen onBack={() => navigateTo('profile')} onNavigateToChangePassword={() => navigateTo('changePassword')} onNavigateToLogin={() => navigateTo('login')} />;
      case 'changePassword':
        return <ChangePasswordScreen onBack={() => navigateTo('editProfile')} onNavigateToLogin={() => navigateTo('login')} />;
      case 'scheduleDetail':
        return (
          <ScheduleDetailScreen
            tripId={selectedTripId}
            tripTitle={selectedTripTitle}
            onBack={() => navigateTo('myTrips')}
            onNavigateToChat={(id, title) => {
              setSelectedTripId(id);
              setSelectedTripTitle(title);
              navigateTo('plannerChat');
            }}
          />
        );
      case 'plannerChat':
        return (
          <PlannerChatScreen
            tripId={selectedTripId}
            tripTitle={selectedTripTitle}
            onBack={() => navigateTo('scheduleDetail')}
          />
        );
      case 'recommendCondition':
        return <RecommendConditionScreen onBack={() => navigateTo('recommend')} onNavigateToLogin={() => navigateTo('login')} />;
      case 'boardList':
        return (
          <BoardListScreen
            showBackButton={true}
            onBack={() => handleTabPress('home')}
            onNavigateToDetail={(postId: number) => {
              setSelectedPostId(postId);
              setCanDeletePost(false);
              navigateTo('boardDetail');
            }}
            onNavigateToWrite={() => navigateTo('boardWrite')}
            onNavigateToLogin={() => navigateTo('login')}
          />
        );
      case 'boardDetail':
        return (
          <BoardDetailScreen
            postId={selectedPostId}
            onBack={() => {
              if (previousScreen === 'mySaved') navigateTo('mySaved');
              else if (previousScreen === 'myPosts') navigateTo('myPosts');
              else if (previousScreen === 'profile') navigateTo('profile');
              else if (previousScreen === 'search') navigateTo('search');
              else if (previousScreen === 'main') navigateTo('main');
              else navigateTo('board');
            }}
            canDeletePost={canDeletePost}
            onNavigateToLogin={() => navigateTo('login')}
          />
        );
      case 'boardWrite':
        return <BoardWriteScreen onBack={() => navigateTo('board')} onSuccess={() => navigateTo('board')} onNavigateToLogin={() => navigateTo('login')} />;
      case 'festivalDetail':
        return (
          <FestivalDetailScreen
            festival={selectedFestival}
            onBack={() => {
              if (previousScreen === 'search') navigateTo('search');
              else if (previousScreen === 'recommend') navigateTo('recommend');
              else navigateTo('main');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} hidden={true} translucent={true} />
      {shouldShowTabBar ? (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={[styles.tabScreen, currentScreen === 'main' && styles.tabScreenActive]}>
              <MainScreen
                onNavigateToFeatures={() => navigateTo('features')}
                onNavigateToMap={() => navigateTo('map')}
                onNavigateToAIPlanner={() => navigateTo('aiplanner')}
                onNavigateToSearch={() => navigateToSearch('')}
                onNavigateToReviewDetail={navigateToReviewDetail}
                onNavigateToCityDetail={navigateToCityDetail}
                onNavigateToProfile={() => handleTabPress('profile')}
                onNavigateToMyTrips={() => navigateTo('myTrips')}
                onNavigateToSavedPlaces={() => navigateTo('savedPlaces')}
                onNavigateToPhotoInput={() => handleTabPress('photos')}
                onNavigateToSchedule={() => navigateTo('myTrips')}
                onNavigateToRecommend={() => handleTabPress('recommend')}
                onNavigateToRecommendWithMonth={(year: number, month: number) => {
                  setRecommendInitialYear(year);
                  setRecommendInitialMonth(month);
                  handleTabPress('recommend');
                }}
                onNavigateToBoard={() => handleTabPress('board')}
                onNavigateToBoardDetail={(postId: number) => {
                  setPreviousScreen('main');
                  setSelectedPostId(postId);
                  setCanDeletePost(false);
                  navigateTo('boardDetail');
                }}
              />
            </View>
            <View style={[styles.tabScreen, currentScreen === 'recommend' && styles.tabScreenActive]}>
              <RecommendScreen
                onBack={() => handleTabPress('home')}
                onNavigateToCondition={() => navigateTo('recommendCondition')}
                initialYear={recommendInitialYear}
                initialMonth={recommendInitialMonth}
                onInitialMonthConsumed={() => {
                  setRecommendInitialYear(null);
                  setRecommendInitialMonth(null);
                }}
                onNavigateToSearch={() => navigateToSearch('')}
              />
            </View>
            <View style={[styles.tabScreen, currentScreen === 'aiplanner' && styles.tabScreenActive]}>
              <AIPlannerScreen
                onBack={() => handleTabPress('home')}
                onPlanCreated={() => handleTabPress('profile')}
                onNavigateToLogin={() => navigateTo('login')}
                onNavigateToGenerate={(data) => {
                  setAnalysisData(data);
                  navigateTo('plannerGenerate');
                }}
                triggerCamera={triggerCamera}
                onCameraTriggered={() => setTriggerCamera(false)}
              />
            </View>
            <View style={[styles.tabScreen, currentScreen === 'board' && styles.tabScreenActive]}>
              <BoardListScreen
                onBack={() => handleTabPress('home')}
                onNavigateToDetail={(postId: number) => {
                  setPreviousScreen('board');
                  setSelectedPostId(postId);
                  setCanDeletePost(false);
                  navigateTo('boardDetail');
                }}
                onNavigateToWrite={() => navigateTo('boardWrite')}
                onNavigateToLogin={() => navigateTo('login')}
                onNavigateToSearch={() => navigateToSearch('')}
              />
            </View>
            <View style={[styles.tabScreen, currentScreen === 'profile' && styles.tabScreenActive]}>
              <MyProfileScreen
                onBack={() => handleTabPress('home')}
                onNavigateToRegister={() => navigateTo('register')}
                onNavigateToLogin={() => navigateTo('login')}
                onNavigateToPreference={() => navigateTo('preferenceSurvey')}
                onNavigateToEditProfile={() => navigateTo('editProfile')}
                onNavigateToChangePassword={() => navigateTo('changePassword')}
                onNavigateToMyTrips={() => navigateTo('myTrips')}
                onNavigateToPlannerGenerate={() => navigateTo('plannerGenerate')}
                onNavigateToMyPost={(postId: number) => {
                  setPreviousScreen('profile');
                  setSelectedPostId(postId);
                  setCanDeletePost(true);
                  navigateTo('boardDetail');
                }}
                onNavigateToMySaved={() => navigateTo('mySaved')}
                onNavigateToMyPosts={() => navigateTo('myPosts')}
              />
            </View>
          </View>
          <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
      ) : (
        renderStackScreen()
      )}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppMain />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabScreen: {
    flex: 1,
    display: 'none' as const,
  },
  tabScreenActive: {
    display: 'flex' as const,
  },
});

export default App;

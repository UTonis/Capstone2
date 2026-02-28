/**
 * Travel App - Main Entry Point
 * Based on TRIPLE app design
 */

import React, { useState } from 'react';
import { View, StatusBar, useColorScheme, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
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

type ScreenName = 'main' | 'features' | 'recommend' | 'schedule' | 'map' | 'aiplanner' | 'search' | 'reviewDetail' | 'cityDetail' | 'profile' | 'myTrips' | 'savedPlaces' | 'register' | 'login' | 'plannerGenerate' | 'preferenceSurvey' | 'editProfile' | 'changePassword' | 'scheduleDetail' | 'plannerChat' | 'recommendCondition' | 'boardList' | 'boardDetail' | 'boardWrite' | 'festivalDetail';

// 탭 바에 해당하는 화면들
const TAB_SCREENS: ScreenName[] = ['main', 'recommend', 'aiplanner', 'schedule', 'profile'];

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  // ScheduleDetail / PlannerChat 상태
  const [selectedTripId, setSelectedTripId] = useState<number>(0);
  const [selectedTripTitle, setSelectedTripTitle] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<number>(0);
  const [selectedFestivalId, setSelectedFestivalId] = useState<number>(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedSearchPlace, setSelectedSearchPlace] = useState<any>(null);
  const [triggerCamera, setTriggerCamera] = useState(false);
  const [recommendInitialYear, setRecommendInitialYear] = useState<number | null>(null);
  const [recommendInitialMonth, setRecommendInitialMonth] = useState<number | null>(null);

  const navigateTo = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

  const navigateToSearch = (query: string) => {
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
      case 'schedule':
        navigateTo('schedule');
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
            onBack={() => navigateTo('main')}
            scheduleItems={selectedSearchPlace ? [selectedSearchPlace] : undefined}
          />
        );
      case 'aiplanner':
        return (
          <AIPlannerScreen
            onBack={() => navigateTo('main')}
            onPlanCreated={() => handleTabPress('schedule')}
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
            onBack={() => navigateTo('main')}
            onSelectPlace={(place) => {
              setSelectedSearchPlace({
                id: place.id,
                place: { name: place.name, latitude: place.latitude, longitude: place.longitude },
                latitude: place.latitude,
                longitude: place.longitude
              });
              navigateTo('map');
            }}
            onSelectFestival={(festival) => {
              setSelectedSearchPlace({
                id: festival.id,
                place: { name: festival.name, latitude: festival.latitude, longitude: festival.longitude },
                latitude: festival.latitude,
                longitude: festival.longitude
              });
              navigateTo('map');
            }}
            onSelectPost={(id) => {
              setSelectedPostId(id);
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
            onBack={() => navigateTo('main')}
            onNavigateToDetail={(id, title) => {
              setSelectedTripId(id);
              setSelectedTripTitle(title);
              navigateTo('scheduleDetail');
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
            onBack={() => navigateTo('schedule')}
            onSuccess={() => navigateTo('schedule')}
            onNavigateToDetail={(id, title) => {
              setSelectedTripId(id);
              setSelectedTripTitle(title);
              navigateTo('scheduleDetail');
            }}
            initialData={analysisData}
          />
        );
      case 'preferenceSurvey':
        return <PreferenceSurveyScreen onBack={() => navigateTo('profile')} />;
      case 'editProfile':
        return <EditProfileScreen onBack={() => navigateTo('profile')} />;
      case 'changePassword':
        return <ChangePasswordScreen onBack={() => navigateTo('profile')} />;
      case 'scheduleDetail':
        return (
          <ScheduleDetailScreen
            tripId={selectedTripId}
            tripTitle={selectedTripTitle}
            onBack={() => navigateTo('schedule')}
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
        return <RecommendConditionScreen onBack={() => navigateTo('recommend')} />;
      case 'boardList':
        return (
          <BoardListScreen
            onBack={() => navigateTo('main')}
            onNavigateToDetail={(postId: number) => {
              setSelectedPostId(postId);
              navigateTo('boardDetail');
            }}
            onNavigateToWrite={() => navigateTo('boardWrite')}
          />
        );
      case 'boardDetail':
        return (
          <BoardDetailScreen
            postId={selectedPostId}
            onBack={() => navigateTo('boardList')}
          />
        );
      case 'boardWrite':
        return <BoardWriteScreen onBack={() => navigateTo('boardList')} onSuccess={() => navigateTo('boardList')} />;
      case 'festivalDetail':
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>축제 상세 화면 (준비 중: ID {selectedFestivalId})</Text><TouchableOpacity onPress={() => navigateTo('search')}><Text style={{ color: '#5B67CA', marginTop: 20 }}>뒤로가기</Text></TouchableOpacity></View>;
      default:
        return null;
    }
  };

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} hidden={true} translucent={true} />
        {shouldShowTabBar ? (
          <View style={styles.container}>
            <View style={styles.content}>
              {/* 모든 탭 화면을 항상 마운트, 비활성 화면은 숨김 */}
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
                  onNavigateToSchedule={() => handleTabPress('schedule')}
                  onNavigateToRecommend={() => handleTabPress('recommend')}
                  onNavigateToRecommendWithMonth={(year: number, month: number) => {
                    setRecommendInitialYear(year);
                    setRecommendInitialMonth(month);
                    handleTabPress('recommend');
                  }}
                  onNavigateToBoard={() => navigateTo('boardList')}
                  onNavigateToBoardDetail={(postId: number) => {
                    setSelectedPostId(postId);
                    navigateTo('boardDetail');
                  }}
                />
              </View>
              <View style={[styles.tabScreen, currentScreen === 'recommend' && styles.tabScreenActive]}>
                <RecommendScreen
                  onBack={() => navigateTo('main')}
                  onNavigateToCondition={() => navigateTo('recommendCondition')}
                  initialYear={recommendInitialYear}
                  initialMonth={recommendInitialMonth}
                  onInitialMonthConsumed={() => {
                    setRecommendInitialYear(null);
                    setRecommendInitialMonth(null);
                  }}
                />
              </View>
              <View style={[styles.tabScreen, currentScreen === 'aiplanner' && styles.tabScreenActive]}>
                <AIPlannerScreen
                  onBack={() => navigateTo('main')}
                  onPlanCreated={() => handleTabPress('schedule')}
                  onNavigateToGenerate={(data) => {
                    setAnalysisData(data);
                    navigateTo('plannerGenerate');
                  }}
                  triggerCamera={triggerCamera}
                  onCameraTriggered={() => setTriggerCamera(false)}
                />
              </View>
              <View style={[styles.tabScreen, currentScreen === 'schedule' && styles.tabScreenActive]}>
                <ScheduleScreen
                  onBack={() => navigateTo('main')}
                  onNavigateToPlannerGenerate={() => navigateTo('plannerGenerate')}
                  onNavigateToScheduleDetail={(id: number, title: string) => {
                    setSelectedTripId(id);
                    setSelectedTripTitle(title);
                    navigateTo('scheduleDetail');
                  }}
                />
              </View>
              <View style={[styles.tabScreen, currentScreen === 'profile' && styles.tabScreenActive]}>
                <MyProfileScreen
                  onBack={() => navigateTo('main')}
                  onNavigateToRegister={() => navigateTo('register')}
                  onNavigateToLogin={() => navigateTo('login')}
                  onNavigateToPreference={() => navigateTo('preferenceSurvey')}
                  onNavigateToEditProfile={() => navigateTo('editProfile')}
                  onNavigateToChangePassword={() => navigateTo('changePassword')}
                />
              </View>
            </View>
            <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
          </View>
        ) : (
          renderStackScreen()
        )}
      </SafeAreaProvider>
    </AuthProvider >
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

/**
 * Travel App - Main Entry Point
 * Based on TRIPLE app design
 */

import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import MainScreen from './src/screens/MainScreen';
import FeaturesScreen from './src/screens/FeaturesScreen';
import PhotoInputScreen from './src/screens/PhotoInputScreen';
import RecommendScreen from './src/screens/RecommendScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import MapScreen from './src/screens/MapScreen';
import AIPlannerScreen from './src/screens/AIPlannerScreen';
import SearchResultsScreen from './src/screens/SearchResultsScreen';
import ReviewDetailScreen from './src/screens/ReviewDetailScreen';
import CityDetailScreen from './src/screens/CityDetailScreen';
import MyProfileScreen from './src/screens/MyProfileScreen';
import MyTripsScreen from './src/screens/MyTripsScreen';
import SavedPlacesScreen from './src/screens/SavedPlacesScreen';

type ScreenName = 'main' | 'features' | 'photoInput' | 'recommend' | 'schedule' | 'map' | 'aiplanner' | 'search' | 'reviewDetail' | 'cityDetail' | 'profile' | 'myTrips' | 'savedPlaces';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);

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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'features':
        return (
          <FeaturesScreen
            onBack={() => navigateTo('main')}
            onNavigate={navigateTo}
          />
        );
      case 'photoInput':
        return <PhotoInputScreen onBack={() => navigateTo('features')} />;
      case 'recommend':
        return <RecommendScreen onBack={() => navigateTo('features')} />;
      case 'schedule':
        return <ScheduleScreen onBack={() => navigateTo('features')} />;
      case 'map':
        return <MapScreen onBack={() => navigateTo('main')} />;
      case 'aiplanner':
        return <AIPlannerScreen onBack={() => navigateTo('main')} />;
      case 'search':
        return (
          <SearchResultsScreen
            searchQuery={searchQuery}
            onBack={() => navigateTo('main')}
            onSelectResult={(result) => navigateToReviewDetail(result)}
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
        return <MyTripsScreen onBack={() => navigateTo('main')} />;
      case 'savedPlaces':
        return <SavedPlacesScreen onBack={() => navigateTo('main')} />;
      case 'profile':
        return <MyProfileScreen onBack={() => navigateTo('main')} />;
      case 'main':
      default:
        return (
          <MainScreen
            onNavigateToFeatures={() => navigateTo('features')}
            onNavigateToMap={() => navigateTo('map')}
            onNavigateToAIPlanner={() => navigateTo('aiplanner')}
            onNavigateToSearch={navigateToSearch}
            onNavigateToReviewDetail={navigateToReviewDetail}
            onNavigateToCityDetail={navigateToCityDetail}
            onNavigateToProfile={() => navigateTo('profile')}
            onNavigateToMyTrips={() => navigateTo('myTrips')}
            onNavigateToSavedPlaces={() => navigateTo('savedPlaces')}
          />
        );
    }
  };

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {renderScreen()}
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;

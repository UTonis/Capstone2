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

type ScreenName = 'main' | 'features' | 'photoInput' | 'recommend' | 'schedule';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('main');

  const navigateTo = (screen: ScreenName) => {
    setCurrentScreen(screen);
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
      case 'main':
      default:
        return <MainScreen onNavigateToFeatures={() => navigateTo('features')} />;
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

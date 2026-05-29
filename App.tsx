import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/pages/SplashScreen';
import ServiceIntroScreen from './src/pages/ServiceIntroScreen';
import Login from './src/pages/Login';
import QuotePage from './src/pages/QuotePage';
import CalendarPage from './src/pages/CalendarPage';
import LocationPage from './src/pages/LocationPage';
import AdminDashboard from './src/pages/AdminDashboard';
import { StatusBar } from 'expo-status-bar';

enum AppState {
  SPLASH,
  INTRO,
  LOGIN,
  QUOTE,
  CALENDAR,
  LOCATION,
  ADMIN
}

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppState>(AppState.SPLASH);
  const [userData, setUserData] = useState<{ name: string; address: string } | null>(null);
  
  // Shared state for business logic
  const [aiEstimate, setAiEstimate] = useState<any>(null);
  const [workshopSettings, setWorkshopSettings] = useState({
    capacity: 12,
    latitude: 43.6532,
    longitude: -79.3832
  });

  const handleSplashFinish = () => setCurrentStep(AppState.INTRO);
  
  const handleAdminLogin = (data: { name: string; address: string }) => {
    setUserData(data);
    setCurrentStep(AppState.ADMIN);
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentStep(AppState.QUOTE);
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />

        {currentStep === AppState.SPLASH && <SplashScreen onFinish={handleSplashFinish} />}

        {currentStep === AppState.INTRO && <ServiceIntroScreen onFinish={() => setCurrentStep(AppState.QUOTE)} />}

        {currentStep === AppState.LOGIN && <Login onLogin={handleAdminLogin} />}

        {currentStep === AppState.QUOTE && (
          <QuotePage
            onNext={(estimate) => {
              setAiEstimate(estimate);
              setCurrentStep(AppState.CALENDAR);
            }}
            onAdminTrigger={() => setCurrentStep(AppState.LOGIN)}
          />
        )}

        {currentStep === AppState.ADMIN && (
          <AdminDashboard 
            onLogout={handleLogout} 
            onUpdateSettings={(settings) => setWorkshopSettings({...workshopSettings, ...settings})}
          />
        )}

        {currentStep === AppState.CALENDAR && (
          <CalendarPage
            aiEstimate={aiEstimate}
            workshopSettings={workshopSettings}
            onNext={() => setCurrentStep(AppState.LOCATION)}
            onBack={() => setCurrentStep(AppState.QUOTE)}
          />
        )}
        {currentStep === AppState.LOCATION && (
          <LocationPage 
            workshopSettings={workshopSettings}
            onBack={() => setCurrentStep(AppState.CALENDAR)} 
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

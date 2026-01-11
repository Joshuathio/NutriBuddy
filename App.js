import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import GrowthScreen from './src/screens/GrowthScreen';
import ScanScreen from './src/screens/ScanScreen';
import ChatScreen from './src/screens/ChatScreen';
import ArticlesScreen from './src/screens/ArticlesScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ChildInfoScreen from './src/screens/FillChildScreen';

// Import context providers
import { ChildDataProvider, useChildData } from './src/context/ChildDataContext';
import { MeasurementProvider } from './src/context/MeasurementContext';

const Tab = createBottomTabNavigator();

// Custom theme
const theme = {
  colors: {
    primary: '#4CAF50',
    accent: '#81C784',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    error: '#FF5252',
    warning: '#FFA726',
    success: '#42A5F5',
    text: '#212121',
    disabled: '#757575',
    placeholder: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  roundness: 8,
};

const ONBOARDING_KEY = '@malnutrition_tracker_onboarding_completed';

// Main app navigation component
const MainApp = () => {
  return (
    <NavigationContainer>
      <StatusBar style="auto" backgroundColor="#4CAF50" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#757575',
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" color={color} size={size} />
            ),
            headerTitle: 'Malnutrition Tracker',
          }}
        />
        <Tab.Screen
          name="Growth"
          component={GrowthScreen}
          options={{
            tabBarLabel: 'Growth',
            tabBarIcon: ({ color, size }) => (
              <Icon name="chart-line" color={color} size={size} />
            ),
            headerTitle: 'Growth Tracking',
          }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            tabBarLabel: 'Scan',
            tabBarIcon: ({ color, size }) => (
              <Icon name="camera" color={color} size={size} />
            ),
            headerTitle: 'Photo Screening',
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarLabel: 'Chat',
            tabBarIcon: ({ color, size }) => (
              <Icon name="message-text" color={color} size={size} />
            ),
            headerTitle: 'Ai Healt Assistant',
          }}
        />
        <Tab.Screen
          name="More"
          component={ArticlesScreen}
          options={{
            tabBarLabel: 'More',
            tabBarIcon: ({ color, size }) => (
              <Icon name="book-open-variant" color={color} size={size} />
            ),
            headerTitle: 'Health Articles',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// App content component that uses ChildDataContext
const AppContent = () => {
  const { childData, isLoading: childDataLoading, saveChildData } = useChildData();
  const [isFirstTime, setIsFirstTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChildInfo, setShowChildInfo] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    // Check if child data exists after loading
    if (!childDataLoading && !isLoading) {
      const hasChildData = childData.name && childData.dateOfBirth && childData.gender;
      setShowChildInfo(!hasChildData && !isFirstTime);
    }
  }, [childDataLoading, isLoading, childData, isFirstTime]);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setIsFirstTime(value === null);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsFirstTime(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setIsFirstTime(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleChildInfoComplete = async (data) => {
    const success = await saveChildData(data);
    if (success) {
      setShowChildInfo(false);
    }
  };

  // Loading state
  if (isLoading || childDataLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Show onboarding for first-time users
  if (isFirstTime) {
    return (
      <>
        <StatusBar style="light" backgroundColor="#4CAF50" />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </>
    );
  }

  // Show child info screen if no child data exists
  if (showChildInfo) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <ChildInfoScreen onComplete={handleChildInfoComplete} />
      </>
    );
  }

  // Main app
  return <MainApp />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ChildDataProvider>
          <MeasurementProvider>
            <AppContent />
          </MeasurementProvider>
        </ChildDataProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
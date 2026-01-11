import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onComplete }) => {
  const features = [
    {
      icon: 'chart-line',
      title: 'Growth Tracking',
      description: 'Track weight and height against WHO standards',
    },
    {
      icon: 'camera',
      title: 'Photo Screening',
      description: 'AI-powered visual health assessment',
    },
    {
      icon: 'message-text',
      title: 'AI Health Assistant',
      description: 'Get instant answers to nutrition questions',
    },
    {
      icon: 'shield-check',
      title: 'Privacy First',
      description: 'Your data stays secure and private',
    },
  ];

  return (
    <LinearGradient
      colors={['#4CAF50', '#66BB6A', '#81C784']}
      style={styles.container}
    >
      {/* Logo/Icon */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Icon name="chart-line-variant" size={80} color="#4CAF50" />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Malnutrition Tracker</Text>
      <Text style={styles.subtitle}>
        Monitor your child's growth and health{'\n'}with AI-powered insights
      </Text>

      {/* Features */}
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <Icon name={feature.icon} size={32} color="#FFFFFF" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={onComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    opacity: 0.95,
  },
  featuresContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default OnboardingScreen;
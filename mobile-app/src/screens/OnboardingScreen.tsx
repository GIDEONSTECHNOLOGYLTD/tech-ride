import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    icon: '🚗',
    title: 'Better Rides, Lower Prices',
    description: 'Save up to 25% compared to other ride-hailing apps. Only 15% commission!',
  },
  {
    id: 2,
    icon: '📍',
    title: 'Real-Time Tracking',
    description: 'Track your ride in real-time and share your trip with friends and family for safety.',
  },
  {
    id: 3,
    icon: '💳',
    title: 'Multiple Payment Options',
    description: 'Pay with card, wallet, or cash. Add promo codes for extra savings!',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      navigation.navigate('Login' as never);
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.navigate('Login' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{SLIDES[currentSlide].icon}</Text>
        <Text style={styles.title}>{SLIDES[currentSlide].title}</Text>
        <Text style={styles.description}>{SLIDES[currentSlide].description}</Text>
      </View>

      <View style={styles.pagination}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[styles.paginationDot, currentSlide === index && styles.paginationDotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        {currentSlide < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 120,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  paginationDotActive: {
    backgroundColor: '#4F46E5',
    width: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

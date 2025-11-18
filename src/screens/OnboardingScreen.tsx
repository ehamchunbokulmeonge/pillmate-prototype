import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const features = [
    {
      icon: 'camera-alt',
      title: 'OCR 약 인식',
      description: '포장지나 낱알 사진만으로\n빠르게 약을 등록하세요',
    },
    {
      icon: 'warning',
      title: '중복 감지',
      description: '성분이 중복되는 약을\n자동으로 경고해드려요',
    },
    {
      icon: 'notifications',
      title: '복용 알림',
      description: '복용 시간을 놓치지 않도록\n알림을 받으세요',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="medication" size={60} color={Colors.primary} />
          </View>
          <Text style={styles.title}>PillMate</Text>
          <Text style={styles.subtitle}>약 복용을 안전하고 쉽게</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <MaterialIcons name={feature.icon as any} size={48} color={Colors.primary} style={styles.featureIcon} />
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <Button title="시작하기" onPress={() => {}} variant="primary" size="large" />
        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  featuresContainer: {
    gap: 24,
  },
  featureCard: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  featureIcon: {
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

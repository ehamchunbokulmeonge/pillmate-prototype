import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Shadows } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  // Mock data
  const todayMedications = [
    { id: '1', name: '타이레놀', time: '아침', taken: false, remaining: 2 },
    { id: '2', name: '게보린', time: '점심', taken: false, remaining: 1 },
    { id: '3', name: '비타민C', time: '저녁', taken: true, remaining: 0 },
  ];

  const recentMedications = [
    { id: '1', name: '타이레놀', addedDate: '오늘', risk: 'safe' as const },
    { id: '2', name: '게보린', addedDate: '오늘', risk: 'danger' as const },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Info */}
        <View style={styles.dateInfo}>
          <Text style={styles.date}>2025년 11월 18일</Text>
          <Text style={styles.greeting}>좋은 하루 되세요! 👋</Text>
        </View>

        {/* Warning Alert */}
        <Card style={styles.warningCard} elevation="medium">
          <View style={styles.warningHeader}>
            <MaterialIcons name="warning" size={24} color={Colors.primary} style={styles.warningIcon} />
            <Text style={styles.warningTitle}>중복 성분 감지</Text>
          </View>
          <Text style={styles.warningText}>
            타이레놀과 게보린의 성분이 중복됩니다.{'\n'}
            함께 복용 시 주의가 필요합니다.
          </Text>
        </Card>

        {/* Today's Medications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘 복용할 약</Text>
          {todayMedications.map((med) => (
            <Card key={med.id} style={styles.medicationCard}>
              <View style={styles.medicationRow}>
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <Text style={styles.medicationTime}>{med.time} 복용</Text>
                </View>
                <View style={styles.medicationRight}>
                  {med.taken ? (
                    <Text style={styles.takenBadge}>✓ 복용완료</Text>
                  ) : (
                    <>
                      <Text style={styles.remainingText}>남은 횟수: {med.remaining}회</Text>
                      <TouchableOpacity style={styles.checkButton}>
                        <Text style={styles.checkButtonText}>복용</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Recently Added */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 등록된 약</Text>
          {recentMedications.map((med) => (
            <Card key={med.id} style={styles.recentCard}>
              <View style={styles.recentRow}>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{med.name}</Text>
                  <Text style={styles.recentDate}>{med.addedDate} 등록</Text>
                </View>
                <Badge
                  text={med.risk === 'safe' ? '안전' : '위험'}
                  variant={med.risk}
                />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={32} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  dateInfo: {
    marginBottom: 24,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  warningCard: {
    backgroundColor: Colors.primaryLight + '15',
    borderColor: Colors.primary,
    borderWidth: 1,
    marginBottom: 24,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  medicationCard: {
    marginBottom: 12,
  },
  medicationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  medicationTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  medicationRight: {
    alignItems: 'flex-end',
  },
  remainingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  checkButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  checkButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  takenBadge: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  recentCard: {
    marginBottom: 12,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  recentDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.large,
  },
});

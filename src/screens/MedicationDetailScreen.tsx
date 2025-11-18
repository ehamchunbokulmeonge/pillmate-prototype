import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Colors } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MaterialIcons } from '@expo/vector-icons';

export default function MedicationDetailScreen() {
  const [schedule, setSchedule] = useState({
    morning: true,
    afternoon: false,
    evening: true,
    notification: true,
  });

  // Mock data
  const medication = {
    name: '타이레놀 8시간 이알서방정',
    ingredients: ['아세트아미노펜 650mg'],
    efficacy: '해열, 진통',
    dosage: '1일 3회, 1회 1정\n식후 30분에 복용\n8시간 간격 유지',
    sideEffects: ['구역', '구토', '식욕부진', '발진'],
    warning: '이 약은 현재 복용 중인 게보린과 주성분(아세트아미노펜)이 중복됩니다. 동시 복용 시 일일 권장량을 초과할 수 있습니다.',
    riskLevel: 'danger' as const,
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="medication" size={60} color={Colors.primary} />
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{medication.name}</Text>
            <Badge
              text={medication.riskLevel === 'danger' ? '위험' : '안전'}
              variant={medication.riskLevel}
            />
          </View>
          <Text style={styles.ingredients}>주성분: {medication.ingredients.join(', ')}</Text>
        </View>

        {/* Warning */}
        {medication.warning && (
          <Card style={styles.warningCard} elevation="medium">
            <View style={styles.warningHeader}>
              <MaterialIcons name="warning" size={24} color={Colors.primary} style={styles.warningIcon} />
              <Text style={styles.warningTitle}>복용 주의</Text>
            </View>
            <Text style={styles.warningText}>{medication.warning}</Text>
          </Card>
        )}

        {/* Details */}
        <Card style={styles.detailCard}>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>효능</Text>
            <Text style={styles.detailValue}>{medication.efficacy}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>복용법</Text>
            <Text style={styles.detailValue}>{medication.dosage}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>부작용</Text>
            <View style={styles.sideEffectsContainer}>
              {medication.sideEffects.map((effect, index) => (
                <View key={index} style={styles.sideEffectBadge}>
                  <Text style={styles.sideEffectText}>{effect}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Schedule Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>복용 일정 설정</Text>

          <Card>
            <Text style={styles.scheduleLabel}>복용 시간</Text>
            <View style={styles.timeButtons}>
              <TouchableOpacity
                style={[styles.timeButton, schedule.morning && styles.timeButtonActive]}
                onPress={() => setSchedule({ ...schedule, morning: !schedule.morning })}
              >
                <MaterialIcons 
                  name="wb-sunny" 
                  size={20} 
                  color={schedule.morning ? Colors.white : Colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[styles.timeButtonText, schedule.morning && styles.timeButtonTextActive]}
                >
                  아침
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timeButton, schedule.afternoon && styles.timeButtonActive]}
                onPress={() => setSchedule({ ...schedule, afternoon: !schedule.afternoon })}
              >
                <MaterialIcons 
                  name="light-mode" 
                  size={20} 
                  color={schedule.afternoon ? Colors.white : Colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.timeButtonText,
                    schedule.afternoon && styles.timeButtonTextActive,
                  ]}
                >
                  점심
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.timeButton, schedule.evening && styles.timeButtonActive]}
                onPress={() => setSchedule({ ...schedule, evening: !schedule.evening })}
              >
                <MaterialIcons 
                  name="nights-stay" 
                  size={20} 
                  color={schedule.evening ? Colors.white : Colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[styles.timeButtonText, schedule.evening && styles.timeButtonTextActive]}
                >
                  저녁
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.notificationRow}>
              <View>
                <Text style={styles.notificationLabel}>복용 알림</Text>
                <Text style={styles.notificationDescription}>설정한 시간에 알림을 받습니다</Text>
              </View>
              <Switch
                value={schedule.notification}
                onValueChange={(value) => setSchedule({ ...schedule, notification: value })}
                trackColor={{ false: Colors.gray300, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <Button title="취소" onPress={() => {}} variant="outline" style={{ flex: 1 }} />
        <Button title="등록하기" onPress={() => {}} variant="primary" style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 40,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary + '30',
  },
  section: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  ingredients: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  warningCard: {
    backgroundColor: Colors.primaryLight + '15',
    borderColor: Colors.primary,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 20,
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
  detailCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  detailSection: {
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  sideEffectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sideEffectBadge: {
    backgroundColor: Colors.gray100,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sideEffectText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  timeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  timeButtonTextActive: {
    color: Colors.white,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});

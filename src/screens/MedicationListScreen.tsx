import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MaterialIcons } from '@expo/vector-icons';

type FilterType = 'all' | 'danger' | 'morning' | 'afternoon' | 'evening';
type SortType = 'name' | 'risk';

export default function MedicationListScreen() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('name');

  // Mock data
  const medications = [
    {
      id: '1',
      name: '타이레놀 8시간 이알서방정',
      ingredients: ['아세트아미노펜'],
      schedule: ['아침', '저녁'],
      riskLevel: 'danger' as const,
    },
    {
      id: '2',
      name: '게보린',
      ingredients: ['아세트아미노펜', '카페인'],
      schedule: ['점심'],
      riskLevel: 'danger' as const,
    },
    {
      id: '3',
      name: '비타민C 1000mg',
      ingredients: ['아스코르브산'],
      schedule: ['아침', '저녁'],
      riskLevel: 'safe' as const,
    },
    {
      id: '4',
      name: '오메가3',
      ingredients: ['EPA', 'DHA'],
      schedule: ['아침'],
      riskLevel: 'safe' as const,
    },
    {
      id: '5',
      name: '종근당 락토핏',
      ingredients: ['유산균'],
      schedule: ['아침', '점심', '저녁'],
      riskLevel: 'safe' as const,
    },
  ];

  const filterOptions: { key: FilterType; label: string; icon: any }[] = [
    { key: 'all', label: '전체', icon: 'view-list' },
    { key: 'danger', label: '위험 약만', icon: 'warning' },
    { key: 'morning', label: '아침 약', icon: 'wb-sunny' },
    { key: 'afternoon', label: '점심 약', icon: 'light-mode' },
    { key: 'evening', label: '저녁 약', icon: 'nights-stay' },
  ];

  const sortOptions: { key: SortType; label: string }[] = [
    { key: 'name', label: '이름순' },
    { key: 'risk', label: '위험도순' },
  ];

  const filteredMedications = medications.filter((med) => {
    if (filter === 'all') return true;
    if (filter === 'danger') return med.riskLevel === 'danger';
    if (filter === 'morning') return med.schedule.includes('아침');
    if (filter === 'afternoon') return med.schedule.includes('점심');
    if (filter === 'evening') return med.schedule.includes('저녁');
    return true;
  });

  const sortedMedications = [...filteredMedications].sort((a, b) => {
    if (sort === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sort === 'risk') {
      const riskOrder = { danger: 0, caution: 1, safe: 2 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return 0;
  });

  return (
    <View style={styles.container}>
      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>{medications.length}개의 약을 복용 중입니다</Text>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.filterChip, filter === option.key && styles.filterChipActive]}
              onPress={() => setFilter(option.key)}
            >
              <MaterialIcons 
                name={option.icon} 
                size={16} 
                color={filter === option.key ? Colors.white : Colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.filterText, filter === option.key && styles.filterTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>정렬:</Text>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.sortOption, sort === option.key && styles.sortOptionActive]}
            onPress={() => setSort(option.key)}
          >
            <Text style={[styles.sortText, sort === option.key && styles.sortTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Medication List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sortedMedications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="medication" size={60} color={Colors.gray300} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>해당하는 약이 없습니다</Text>
          </View>
        ) : (
          sortedMedications.map((med) => (
            <TouchableOpacity key={med.id}>
              <Card style={styles.medicationCard} elevation="small">
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.medicationIngredients}>
                      {med.ingredients.join(', ')}
                    </Text>
                  </View>
                  <Badge
                    text={med.riskLevel === 'danger' ? '위험' : '안전'}
                    variant={med.riskLevel}
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>복용 시간:</Text>
                  <View style={styles.scheduleBadges}>
                    {med.schedule.map((time, index) => (
                      <View key={index} style={styles.scheduleBadge}>
                        <Text style={styles.scheduleText}>{time}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailButtonText}>상세보기</Text>
                  <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  statsBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterBar: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    gap: 12,
  },
  sortLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sortOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: Colors.gray100,
  },
  sortText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sortTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  medicationCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  medicationIngredients: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  scheduleBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  scheduleBadge: {
    backgroundColor: Colors.gray100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  scheduleText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  detailButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

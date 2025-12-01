import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pillmate</Text>
        <Text style={styles.subtitle}>약물 안전 관리 앱</Text>
      </View>

      <View style={styles.menuContainer}>
        <Link href="/drug-risk-analysis" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={32} color="#FF6249" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>약물 위험 분석</Text>
              <Text style={styles.menuDescription}>
                종합 안전성 평가
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE8E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

import { Tabs } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

function LogoIcon() {
  return (
    <View style={styles.logoIconContainer}>
      <MaterialIcons name="medication" size={24} color={Colors.primary} />
    </View>
  );
}

function LogoTitle() {
  return (
    <View style={styles.logoContainer}>
      <LogoIcon />
      <Text style={styles.logoText}>PillMate</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleAlign: 'left',
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: Colors.textPrimary,
          marginLeft: -12,
        },
        headerLeftContainerStyle: {
          paddingLeft: 20,
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 88 : 68,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          headerTitle: () => <LogoTitle />,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '약 추가',
          headerTitle: '약 추가하기',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-circle" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: '약 목록',
          headerTitle: '복용 중인 약',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="medication" size={size || 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

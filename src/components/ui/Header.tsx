import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '@/constants/colors';

interface HeaderProps {
  showLogo?: boolean;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ showLogo = true, title }) => {
  return (
    <View style={styles.header}>
      {showLogo ? (
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo.svg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>PillMate</Text>
        </View>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
});

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Shadows } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({ children, style, elevation = 'small' }) => {
  return (
    <View style={[styles.card, Shadows[elevation], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

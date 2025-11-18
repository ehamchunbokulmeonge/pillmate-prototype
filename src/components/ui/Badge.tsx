import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface BadgeProps {
  text: string;
  variant: 'safe' | 'caution' | 'danger';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ text, variant, style }) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  safe: {
    backgroundColor: Colors.successLight,
  },
  caution: {
    backgroundColor: Colors.warningLight,
  },
  danger: {
    backgroundColor: Colors.dangerLight,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  safeText: {
    color: Colors.success,
  },
  cautionText: {
    color: Colors.warning,
  },
  dangerText: {
    color: Colors.danger,
  },
});

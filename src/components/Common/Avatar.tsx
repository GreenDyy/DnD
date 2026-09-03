import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface AvatarProps {
  source: any;
  size?: number;
  showStatus?: boolean;
  statusColor?: string;
}

function Avatar({ source, size = 48, showStatus = false, statusColor }: AvatarProps) {
  return (
    <View style={styles.container}>
      <Image
        source={source}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
      {showStatus && statusColor && (
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: statusColor,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: (size * 0.3) / 2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {},
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.white,
  },
});

export default Avatar;

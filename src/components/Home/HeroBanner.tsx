import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { images } from '../../assets';
import { AI_NAME } from '../../constants';

interface HeroBannerProps {
  onPress: () => void;
}

function HeroBanner({ onPress }: HeroBannerProps) {
  return (
    <View style={styles.container}>
      <Image source={images.mori} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.title}>Trợ lý AI</Text>
        <Text style={styles.desc}>{AI_NAME}</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.btnText}>Hỏi ngay</Text>
        <ChevronRight size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#22C55E',
    overflow: 'hidden',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.3,
  },
  overlay: {
    padding: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  desc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  btn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});

export default HeroBanner;

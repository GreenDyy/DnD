import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Brain, Headphones, Radio, Camera } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const features = [
  {
    title: 'AI Model',
    desc: 'Test useLocalAI & KnowledgeService',
    icon: Brain,
    color: '#F0FDF4',
    screen: 'AIPlaygroundScreen',
  },
  {
    title: 'Audio',
    desc: 'Test Morse audio player',
    icon: Headphones,
    color: '#EAFBF0',
    screen: 'AudioPlaygroundScreen',
  },
  {
    title: 'MQTT',
    desc: 'Test MQTT connection',
    icon: Radio,
    color: '#F3E8FF',
    screen: 'MQTTPlaygroundScreen',
  },
  {
    title: 'Camera',
    desc: 'Test camera features',
    icon: Camera,
    color: '#FFF4E5',
    screen: 'CameraPlaygroundScreen',
  },
];

function PlayGroundScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Playground</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subTitle}>Chọn module để test</Text>

      <View style={styles.grid}>
        {features.map((item, index) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: item.color }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(item.screen)}>
              <View style={styles.iconWrap}>
                <Icon size={28} color="#111827" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  subTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    minHeight: 160,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4B5563',
  },
});

export default PlayGroundScreen;

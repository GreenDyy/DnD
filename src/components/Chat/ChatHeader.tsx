import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { Avatar } from '../Common';
import { images } from '../../assets';
import { AI_NAME } from '../../constants';

interface ChatHeaderProps {
  statusText: string;
  statusColor: string;
  onBack: () => void;
}

function ChatHeader({ statusText, statusColor, onBack }: ChatHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <ArrowLeft size={22} color="#0F172A" />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <Avatar source={images.mori} size={48} showStatus statusColor={statusColor} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{AI_NAME}</Text>
          <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.menuBtn}>
        <MoreVertical size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  status: {
    fontSize: 13,
    marginTop: 2,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatHeader;

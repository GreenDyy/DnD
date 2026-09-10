import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Pause, Play, RotateCcw } from 'lucide-react-native';

interface AudioPlaybackControlsProps {
  styles: any;
  isPlaying: boolean;
  isPaused: boolean;
  hasPlayed: boolean;
  isLoading: boolean;
  onTogglePlay: () => void;
  onResetPlay: () => void;
}

// Thanh công cụ phát âm thanh Morse chính
export const AudioPlaybackControls: React.FC<AudioPlaybackControlsProps> = ({
  styles,
  isPlaying,
  isPaused,
  hasPlayed,
  isLoading,
  onTogglePlay,
  onResetPlay,
}) => {
  return (
    <View style={styles.audioActionCard}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.playBtn,
          isPlaying && !isPaused && styles.playBtnActive,
          isPaused && { backgroundColor: '#D97706' },
        ]}
        onPress={onTogglePlay}
      >
        {isPlaying && !isPaused ? (
          <Pause size={18} color="#FFFFFF" />
        ) : (
          <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
        )}
        <Text style={styles.playBtnText}>
          {isPlaying && !isPaused
            ? 'Tạm dừng phát'
            : isPaused
            ? 'Tiếp tục phát'
            : 'Bắt đầu phát điện'}
        </Text>
      </TouchableOpacity>

      {hasPlayed && (
        <TouchableOpacity
          accessibilityLabel="Đặt lại bài phát"
          activeOpacity={0.8}
          disabled={isLoading}
          style={[styles.iconButton, isLoading && { opacity: 0.5 }]}
          onPress={onResetPlay}
        >
          <RotateCcw size={18} color="#475569" />
        </TouchableOpacity>
      )}
    </View>
  );
};
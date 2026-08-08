import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';

import MorsePlayer from '../../services/MorsePlayer';

type PracticeRouteParams = {
  text: string;
  wpm: number;
  groups: number;
  groupLength: number;
  mode: 'letters' | 'numbers' | 'mixed';
};

function PracticeScreen() {
  const route =
    useRoute<RouteProp<
      Record<string, PracticeRouteParams>,
      string
    >>();

  const {
    text,
    wpm,
    groups,
    groupLength,
    mode,
  } = route.params;

  const [showAnswer, setShowAnswer] = useState(false);

  const playMorse = async () => {
    MorsePlayer.setWpm(wpm);
    await MorsePlayer.playText(text);
  };

    const handleCompare = () => {
        setShowAnswer(prev => !prev);
    };

  const getModeLabel = () => {
    switch (mode) {
      case 'letters':
        return 'Điện chữ';

      case 'numbers':
        return 'Điện số';

      case 'mixed':
        return 'Điện hỗn hợp';

      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        LUYỆN NGHE MORSE
      </Text>

      <View style={styles.card}>
        <Text style={styles.info}>
          Loại: {getModeLabel()}
        </Text>

        <Text style={styles.info}>
          Số nhóm: {groups}
        </Text>

        <Text style={styles.info}>
          Ký tự / nhóm: {groupLength}
        </Text>

        <Text style={styles.info}>
          Tốc độ: {wpm} WPM
        </Text>
      </View>

        {showAnswer === false ? (
            <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Nội dung bảng điện đang được ẩn
        </Text>

        <Text style={styles.placeholderSubText}>
          Hãy nghe và ghi lại vào sổ điện
        </Text>
      </View>
         ): (
        <View style={styles.answerContainer}>
            <Text style={styles.answerTitle}>
            BẢNG ĐIỆN GỐC
            </Text>

            <Text style={styles.answerText}>
            {text}
            </Text>
        </View>
        )}
      {/*  */}

      <View style={styles.space} />

      <Button
        title="Phát Morse"
        onPress={playMorse}
      />

      <View style={styles.space} />

      <Button
        title="Dừng"
        onPress={() => MorsePlayer.stop()}
      />

      <View style={styles.space} />

      <Button
        title={
            showAnswer
            ? 'Ẩn đối chiếu'
            : 'Đối chiếu'
        }
        onPress={handleCompare}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },

  card: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 16,
  },

  info: {
    fontSize: 16,
    marginBottom: 8,
  },

  placeholder: {
    marginTop: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#AAA',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },

  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
  },

  placeholderSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },

  space: {
    height: 16,
  },

  answerContainer: {
  marginTop: 24,
  borderWidth: 1,
  borderColor: '#DDD',
  borderRadius: 12,
  padding: 16,
},

answerTitle: {
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 12,
},

answerText: {
  fontSize: 18,
  lineHeight: 28,
  letterSpacing: 1,
},

});

export default PracticeScreen;
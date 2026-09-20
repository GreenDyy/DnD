import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle2, XCircle, AlertCircle, RotateCcw } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import {
  evaluateMorseReception,
  BoardCheckReport,
} from '../../services/morseCheckService';

interface MorseCheckModalProps {
  visible: boolean;
  onClose: () => void;
  originalGroups: string[];
  initialText?: string;
}

export const MorseCheckModal: React.FC<MorseCheckModalProps> = ({
  visible,
  onClose,
  originalGroups,
  initialText = '',
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [report, setReport] = useState<BoardCheckReport | null>(null);

  useEffect(() => {
    if (visible && initialText) {
      setInputText(initialText);
      // Tự động chấm điểm ngay nếu có dữ liệu từ camera
      setReport(evaluateMorseReception(originalGroups, initialText));
    } else if (!visible) {
      setReport(null);
      setInputText('');
    }
  }, [visible, initialText, originalGroups]);

  const handleCheck = () => {
    const result = evaluateMorseReception(originalGroups, inputText);
    setReport(result);
  };

  const handleReset = () => {
    setReport(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kết Quả Rà Soát Bản Thu</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {!report ? (
              <View>
                <Text style={styles.guideText}>
                  Kiểm tra lại nội dung quét từ camera (ngăn cách bằng khoảng trắng):
                </Text>
                <TextInput
                  style={styles.textInputArea}
                  multiline
                  numberOfLines={6}
                  placeholder="Ví dụ: ASDFG QWERT ZXCVB ..."
                  placeholderTextColor={Colors.neutral.textMuted}
                  value={inputText}
                  onChangeText={setInputText}
                  autoCapitalize="characters"
                />

                <TouchableOpacity
                  style={[styles.checkButton, !inputText.trim() && styles.disabledBtn]}
                  disabled={!inputText.trim()}
                  onPress={handleCheck}
                >
                  <Text style={styles.checkButtonText}>Chấm điểm</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Banner điểm số */}
                <View style={styles.scoreBanner}>
                  <Text style={styles.scoreNumber}>{report.accuracyRate}%</Text>
                  <Text style={styles.scoreDesc}>Tỷ lệ chính xác</Text>

                  <View style={styles.statGrid}>
                    <View style={styles.statItem}>
                      <CheckCircle2 size={14} color={Colors.primary[600]} />
                      <Text style={styles.statText}>Đúng: {report.correctChars}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <XCircle size={14} color={Colors.accent.red} />
                      <Text style={styles.statText}>Sai: {report.wrongChars}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <AlertCircle size={14} color={Colors.accent.amber} />
                      <Text style={styles.statText}>
                        Lệch: {report.missingChars + report.extraChars}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bảng so sánh từng nhóm */}
                <Text style={styles.detailTitle}>Chi tiết đối chiếu từng nhóm:</Text>
                <View style={styles.groupList}>
                  {report.groupResults.map((group) => (
                    <View
                      key={group.groupIndex}
                      style={[styles.groupRow, !group.isPerfect && styles.groupRowError]}
                    >
                      <Text style={styles.groupIndexText}>Nhóm {group.groupIndex}</Text>

                      <View style={styles.charComparisonRow}>
                        {group.chars.map((item, idx) => (
                          <View key={idx} style={styles.charBox}>
                            <Text
                              style={[
                                styles.charActual,
                                item.status === 'correct' && styles.charCorrect,
                                item.status === 'wrong' && styles.charWrong,
                                item.status === 'missing' && styles.charMissing,
                              ]}
                            >
                              {item.actualChar}
                            </Text>
                            {item.status !== 'correct' && (
                              <Text style={styles.charExpected}>{item.expectedChar}</Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.retestButton} onPress={handleReset}>
                  <RotateCcw size={16} color={Colors.neutral.white} />
                  <Text style={styles.retestButtonText}>Chỉnh sửa lại bản quét</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
  },
  closeText: {
    fontSize: 14,
    color: Colors.neutral.textSecondary,
    fontWeight: '600',
  },
  guideText: {
    fontSize: 13,
    color: Colors.neutral.textSecondary,
    marginBottom: 12,
  },
  textInputArea: {
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.neutral.textPrimary,
    backgroundColor: Colors.neutral.background,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  checkButton: {
    backgroundColor: Colors.primary[600],
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  checkButtonText: {
    color: Colors.neutral.white,
    fontSize: 15,
    fontWeight: '700',
  },
  scoreBanner: {
    backgroundColor: Colors.primary[50],
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary[700],
  },
  scoreDesc: {
    fontSize: 12,
    color: Colors.primary[800],
    fontWeight: '600',
    marginBottom: 10,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    marginBottom: 10,
  },
  groupList: {
    gap: 8,
    marginBottom: 20,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  groupRowError: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  groupIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral.textSecondary,
    width: 65,
  },
  charComparisonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  charBox: {
    alignItems: 'center',
    minWidth: 20,
  },
  charActual: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  charCorrect: {
    color: Colors.primary[600],
  },
  charWrong: {
    color: Colors.accent.red,
  },
  charMissing: {
    color: Colors.accent.amber,
  },
  charExpected: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary[700],
  },
  retestButton: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.textPrimary,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  retestButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

interface AppAlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
}

export const AppAlertModal: React.FC<AppAlertModalProps> = ({
  visible,
  title,
  message,
  type = 'error',
  onClose,
  onConfirm,
  confirmText = 'Đồng ý',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            {type === 'error' && <AlertCircle size={32} color={Colors.accent.red} />}
            {type === 'warning' && <AlertCircle size={32} color={Colors.accent.amber} />}
            {type === 'info' && <CheckCircle2 size={32} color={Colors.primary[600]} />}
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {onConfirm && (
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={onClose}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.btn, styles.confirmBtn]}
              onPress={() => {
                if (onConfirm) onConfirm();
                else onClose();
              }}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.neutral.white,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    elevation: 8,
  },
  iconRow: {
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: Colors.neutral.surfaceSubtle,
  },
  confirmBtn: {
    backgroundColor: Colors.primary[600],
  },
  cancelText: {
    color: Colors.neutral.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  confirmText: {
    color: Colors.neutral.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
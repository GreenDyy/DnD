import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { colors } from '../../theme';

export interface DropdownOption<T extends string | number> {
  label: string;
  value: T;
}

interface DropdownProps<T extends string | number> {
  label: string;
  options: DropdownOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
}

function Dropdown<T extends string | number>({
  label,
  options,
  selectedValue,
  onSelect,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen(true)}
        style={styles.trigger}
      >
        <Text style={styles.triggerLabel}>{label}</Text>
        <ChevronDown size={19} color={colors.primary} strokeWidth={2.2} />
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng danh sách tần số"
            onPress={() => setIsOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.optionPanel}>
            <Text style={styles.panelTitle}>Chọn tần số</Text>
            <ScrollView style={styles.optionList}>
              {options.map(option => {
                const isSelected = option.value === selectedValue;

                return (
                  <Pressable
                    key={String(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      onSelect(option.value);
                      setIsOpen(false);
                    }}
                    style={[
                      styles.option,
                      isSelected && styles.selectedOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.selectedOptionLabel,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Check
                        size={18}
                        color={colors.primary}
                        strokeWidth={2.5}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingVertical: 4,
  },
  triggerLabel: {
    flex: 1,
    fontSize: 14,
    color: '#638B84',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: 'rgba(15, 35, 31, 0.35)',
  },
  optionPanel: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '75%',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    elevation: 8,
  },
  panelTitle: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '800',
    color: '#145C50',
  },
  optionList: {
    flexGrow: 0,
  },
  option: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    backgroundColor: '#E9F8F2',
  },
  optionLabel: {
    fontSize: 15,
    color: '#315C55',
  },
  selectedOptionLabel: {
    fontWeight: '700',
    color: '#145C50',
  },
});

export default Dropdown;

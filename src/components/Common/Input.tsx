import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  charCount?: boolean;
  maxLength?: number;
};

function Input({ label, error, charCount, maxLength, value, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        value={value}
        maxLength={maxLength}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      <View style={styles.footer}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View />
        )}
        {charCount && maxLength && (
          <Text style={styles.charCount}>{value?.length || 0}/{maxLength}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    fontSize: 15,
    color: colors.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  error: {
    fontSize: 12,
    color: colors.error,
  },
  charCount: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});

export default Input;

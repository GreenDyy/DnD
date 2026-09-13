import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const electroStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  /* Top Navigation */
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.neutral.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Header Section */
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary[700],
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.neutral.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },

  /* Setup Card */
  card: {
    backgroundColor: Colors.neutral.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutral.textPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  fieldGroup: {
    marginVertical: 4,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  fieldBadge: {
    fontSize: 12,
    color: Colors.neutral.textSecondary,
    backgroundColor: Colors.neutral.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  /* Text Input */
  input: {
    height: 52,
    backgroundColor: Colors.neutral.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  inputFocused: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.neutral.card,
  },
  inputDisabled: {
    backgroundColor: Colors.neutral.border,
    color: Colors.neutral.textMuted,
  },

  /* Preset Chips */
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.neutral.surfaceSubtle,
    alignItems: 'center',
  },
  presetChipActive: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.textSecondary,
  },
  presetChipTextActive: {
    color: Colors.primary[700],
  },

  divider: {
    height: 1,
    backgroundColor: Colors.neutral.divider,
    marginVertical: 18,
  },

  /* 2x2 Options Grid */
  gridOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  optionCard: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    backgroundColor: Colors.neutral.background,
  },
  optionCardActive: {
    borderColor: Colors.primary[600],
    backgroundColor: Colors.primary[50],
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  radioIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.neutral.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[600],
  },
  optionTextWrapper: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionTitleActive: {
    color: Colors.primary[700],
  },
  optionDesc: {
    fontSize: 12,
    color: Colors.neutral.textSecondary,
    marginTop: 1,
  },

  /* Bottom Submit Area */
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 20,
    backgroundColor: Colors.neutral.background,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.divider,
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary[600],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    backgroundColor: Colors.neutral.textMuted,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

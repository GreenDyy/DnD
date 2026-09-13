import { Platform, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export const createElectricBoardStyles = (
  screenWidth: number,
  screenHeight: number,
  groupsPerRow: number,
) => {
  const isSmallDevice = screenWidth < 375;
  const paddingH = isSmallDevice ? 14 : 18;
  const cardPadding = 14;
  const counterColWidth = 36;
  const cellGap = 8;

  // Tính chính xác bề rộng mỗi ô nhóm ký tự:
  const innerGridWidth =
    screenWidth - paddingH * 2 - cardPadding * 2 - counterColWidth - 10;
  const cellWidth = Math.floor(
    (innerGridWidth - (groupsPerRow - 1) * cellGap) / groupsPerRow,
  );

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.neutral.background,
    },
    scrollContent: {
      paddingHorizontal: paddingH,
      paddingBottom: 40,
    },

    /* Navigation Bar */
    navBar: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: paddingH,
      borderBottomWidth: 1,
      borderBottomColor: Colors.neutral.divider,
      backgroundColor: Colors.neutral.background,
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: Colors.neutral.white,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: Colors.neutral.border,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    navTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: Colors.neutral.textPrimary,
      letterSpacing: 0.4,
    },
    navSpacer: {
      width: 38,
    },

    /* Hero Banner */
    heroCard: {
      backgroundColor: Colors.neutral.white,
      borderRadius: 16,
      padding: 16,
      marginTop: 14,
      borderWidth: 1,
      borderColor: Colors.neutral.border,
    },
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    heroBadge: {
      backgroundColor: Colors.primary[50],
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    heroBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: Colors.primary[700],
    },
    statsPill: {
      backgroundColor: Colors.neutral.surfaceSubtle,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statsPillText: {
      fontSize: 11,
      fontWeight: '700',
      color: Colors.neutral.textSecondary,
    },
    heroTitle: {
      fontSize: isSmallDevice ? 20 : 22,
      fontWeight: '800',
      color: Colors.neutral.textPrimary,
    },
    heroSubtitle: {
      fontSize: 13,
      color: Colors.neutral.textSecondary,
      marginTop: 4,
      lineHeight: 18,
    },
    quickSpecs: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: Colors.neutral.divider,
    },
    specItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    specLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#334155',
    },
    specDivider: {
      width: 1,
      height: 12,
      backgroundColor: Colors.neutral.borderStrong,
      marginHorizontal: 12,
    },

    /* BẢNG ĐIỆN TÍN (MAIN TELEGRAPH SHEET) */
    boardCard: {
      marginTop: 16,
      backgroundColor: Colors.neutral.white,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: Colors.neutral.borderStrong,
      padding: cardPadding,
      ...Platform.select({
        ios: {
          shadowColor: Colors.neutral.textPrimary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    sheetTopBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      gap: 8,
    },
    sheetTopDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.neutral.textMuted,
    },
    sheetTopTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: Colors.neutral.textSecondary,
      letterSpacing: 1,
    },
    // Ký tự đang phát tiếng beep
    charHighlighted: {
      color: Colors.morse.charHighlightedText,
      backgroundColor: Colors.morse.charHighlightedBg, // Xanh lá đậm nổi bật
      borderRadius: 4,
      fontWeight: '900',
      overflow: 'hidden',
    },

    // Highlight khi phát dấu '=' hoặc '+'
    markerBadgeActive: {
      backgroundColor: Colors.primary[600],
      borderColor: Colors.primary[700],
    },
    markerTextActive: {
      color: Colors.neutral.white,
      fontWeight: '900',
    },
    markerBadge: {
      alignSelf: 'flex-start',
      backgroundColor: Colors.accent.yellowLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      marginBottom: 10,
      borderWidth: 0.5,
      borderColor: '#FDE68A',
    },
    markerBadgeEnd: {
      marginTop: 10,
      marginBottom: 0,
      backgroundColor: Colors.primary[50],
      borderColor: Colors.primary[200],
    },
    markerText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#92400E',
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    gridContainer: {
      gap: 8,
    },
    boardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cellsRow: {
      flexDirection: 'row',
      gap: cellGap,
    },
    groupCell: {
      width: cellWidth,
      height: 38,
      backgroundColor: Colors.neutral.background,
      borderWidth: 1,
      borderColor: Colors.neutral.border,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupText: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.neutral.textPrimary,
      letterSpacing: 1.5,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    rowCounter: {
      width: counterColWidth,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    rowCounterText: {
      fontSize: 11,
      fontWeight: '700',
      color: Colors.neutral.textMuted,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    /* Controls: Audio Play */
    audioActionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 16,
    },
    playBtn: {
      flex: 1,
      height: 50,
      borderRadius: 12,
      backgroundColor: Colors.primary[600],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    playBtnActive: {
      backgroundColor: Colors.primary[700],
    },
    playBtnText: {
      color: Colors.neutral.white,
      fontSize: 15,
      fontWeight: '700',
    },
    iconButton: {
      width: 50,
      height: 50,
      borderRadius: 12,
      backgroundColor: Colors.neutral.white,
      borderWidth: 1,
      borderColor: Colors.neutral.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* Sections */
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 24,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#1E293B',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },

    /* Đối chiếu */
    compareCard: {
      backgroundColor: Colors.neutral.white,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: Colors.neutral.border,
    },
    compareDesc: {
      fontSize: 13,
      color: Colors.neutral.textSecondary,
      lineHeight: 18,
      marginBottom: 12,
    },
    compareBtnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    compareBtn: {
      flex: 1,
      height: 46,
      borderRadius: 10,
      backgroundColor: Colors.neutral.textPrimary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    compareBtnActive: {
      backgroundColor: Colors.accent.amberDark,
    },
    compareBtnText: {
      color: Colors.neutral.white,
      fontSize: 14,
      fontWeight: '700',
    },
    speedSelectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.neutral.divider,
    },
    speedLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: Colors.neutral.textSecondary,
    },
    speedButtonGroup: {
      flexDirection: 'row',
      gap: 6,
    },
    speedChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: Colors.neutral.surfaceSubtle,
      borderWidth: 1,
      borderColor: Colors.neutral.border,
    },
    speedChipActive: {
      backgroundColor: Colors.primary[50],
      borderColor: Colors.primary[200],
    },
    speedChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: Colors.neutral.textSecondary,
    },
    speedChipTextActive: {
      color: Colors.primary[700],
    },

    /* Sliders */
    sliderCard: {
      backgroundColor: Colors.neutral.white,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: Colors.neutral.border,
    },
    sliderHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    sliderLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#334155',
    },
    sliderValue: {
      fontSize: 13,
      fontWeight: '700',
      color: Colors.primary[700],
    },
    rangeLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    rangeSub: {
      fontSize: 11,
      color: Colors.neutral.textMuted,
    },
    toggleCard: {
      backgroundColor: Colors.neutral.white,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: Colors.neutral.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    toggleInfo: {
      flex: 1,
    },
    toggleTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.neutral.textPrimary,
      marginBottom: 2,
    },
    toggleDesc: {
      fontSize: 12,
      color: Colors.neutral.textSecondary,
      lineHeight: 16,
    },
    preambleConfigCard: {
      backgroundColor: Colors.neutral.white,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: Colors.neutral.border,
      marginBottom: 10,
      overflow: 'hidden',
    },
    preambleForm: {
      paddingHorizontal: 14,
      paddingBottom: 14,
      borderTopWidth: 1,
      borderTopColor: Colors.neutral.divider,
      gap: 10,
    },
    preambleInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    preambleFieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#334155',
    },
    preambleTextInput: {
      width: 120,
      height: 38,
      backgroundColor: Colors.neutral.background,
      borderWidth: 1,
      borderColor: Colors.neutral.borderStrong,
      borderRadius: 8,
      paddingHorizontal: 10,
      fontSize: 14,
      fontWeight: '700',
      color: Colors.neutral.textPrimary,
      textAlign: 'center',
    },
    dateTimeActionRow: {
      flexDirection: 'row',
      gap: 10,
    },
    pickerTriggerBtn: {
      flex: 1,
      height: 38,
      backgroundColor: Colors.primary[50],
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors.primary[200],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    pickerTriggerText: {
      fontSize: 13,
      fontWeight: '700',
      color: Colors.primary[700],
    },
    previewBox: {
      backgroundColor: Colors.neutral.background,
      padding: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: Colors.neutral.border,
    },
    previewLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: Colors.neutral.textSecondary,
      marginBottom: 2,
    },
    previewText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#334155',
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    /* Hiển thị trong bức điện */
    preambleBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.neutral.surfaceSubtle,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
      marginBottom: 10,
      borderLeftWidth: 3,
      borderLeftColor: Colors.neutral.textMuted,
      gap: 8,
    },
    preambleBannerActive: {
      backgroundColor: Colors.primary[50],
      borderLeftColor: Colors.primary[600],
    },
    preambleTag: {
      fontSize: 10,
      fontWeight: '800',
      color: Colors.primary[700],
    },
    preambleContentText: {
      fontSize: 13,
      fontWeight: '700',
      color: Colors.neutral.textPrimary,
      letterSpacing: 0.5,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    // --- STYLES CHO MODAL LƯU FILE BẢNG ĐIỆN ---
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    saveModalCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: Colors.neutral.white,
      borderRadius: 18,
      padding: 22,
      shadowColor: Colors.neutral.textPrimary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 8,
    },
    saveModalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: Colors.neutral.textPrimary,
      marginBottom: 6,
      letterSpacing: 0.3,
    },
    saveModalDesc: {
      fontSize: 13,
      color: Colors.neutral.textSecondary,
      lineHeight: 19,
      marginBottom: 16,
    },
    saveModalInput: {
      backgroundColor: Colors.neutral.background,
      borderWidth: 1.5,
      borderColor: Colors.neutral.borderStrong,
      borderRadius: 10,
      paddingHorizontal: 14,
      height: 46,
      fontSize: 14,
      fontWeight: '600',
      color: Colors.neutral.textPrimary,
      marginBottom: 20,
    },
    saveModalActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    saveModalCancelBtn: {
      flex: 1,
      height: 42,
      borderRadius: 10,
      backgroundColor: Colors.neutral.surfaceSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveModalCancelText: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.neutral.textSecondary,
    },
    saveModalSubmitBtn: {
      flex: 1,
      height: 42,
      borderRadius: 10,
      backgroundColor: Colors.primary[600],
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveModalSubmitText: {
      fontSize: 14,
      fontWeight: '700',
      color: Colors.neutral.white,
    },
  });
};
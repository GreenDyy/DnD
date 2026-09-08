import { Platform, StyleSheet } from 'react-native';

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
      backgroundColor: '#F8FAFC',
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
      borderBottomColor: '#F1F5F9',
      backgroundColor: '#F8FAFC',
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#E2E8F0',
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
      color: '#0F172A',
      letterSpacing: 0.4,
    },
    navSpacer: {
      width: 38,
    },

    /* Hero Banner */
    heroCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginTop: 14,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    heroBadge: {
      backgroundColor: '#EEF2FF',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    heroBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#4F46E5',
    },
    statsPill: {
      backgroundColor: '#F1F5F9',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statsPillText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#475569',
    },
    heroTitle: {
      fontSize: isSmallDevice ? 20 : 22,
      fontWeight: '800',
      color: '#0F172A',
    },
    heroSubtitle: {
      fontSize: 13,
      color: '#64748B',
      marginTop: 4,
      lineHeight: 18,
    },
    quickSpecs: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: '#F1F5F9',
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
      backgroundColor: '#CBD5E1',
      marginHorizontal: 12,
    },

    /* BẢNG ĐIỆN TÍN (MAIN TELEGRAPH SHEET) */
    boardCard: {
      marginTop: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: '#CBD5E1',
      padding: cardPadding,
      ...Platform.select({
        ios: {
          shadowColor: '#0F172A',
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
      backgroundColor: '#94A3B8',
    },
    sheetTopTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: '#64748B',
      letterSpacing: 1,
    },
    // Ký tự đang phát tiếng beep
    charHighlighted: {
      color: '#FFFFFF',
      backgroundColor: '#4F46E5', // Nền tím đậm nổi bật
      borderRadius: 4,
      fontWeight: '900',
      overflow: 'hidden',
    },

    // Highlight khi phát dấu '=' hoặc '+'
    markerBadgeActive: {
      backgroundColor: '#4F46E5',
      borderColor: '#4338CA',
    },
    markerTextActive: {
      color: '#FFFFFF',
      fontWeight: '900',
    },
    markerBadge: {
      alignSelf: 'flex-start',
      backgroundColor: '#FEF3C7',
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
      backgroundColor: '#E0F2FE',
      borderColor: '#BAE6FD',
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
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#0F172A',
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
      color: '#94A3B8',
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
      backgroundColor: '#4F46E5',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    playBtnActive: {
      backgroundColor: '#059669',
    },
    playBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    iconButton: {
      width: 50,
      height: 50,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
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
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    compareDesc: {
      fontSize: 13,
      color: '#64748B',
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
      backgroundColor: '#0F172A',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    compareBtnActive: {
      backgroundColor: '#D97706',
    },
    compareBtnText: {
      color: '#FFFFFF',
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
      borderBottomColor: '#F1F5F9',
    },
    speedLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: '#475569',
    },
    speedButtonGroup: {
      flexDirection: 'row',
      gap: 6,
    },
    speedChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: '#F1F5F9',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    speedChipActive: {
      backgroundColor: '#EEF2FF',
      borderColor: '#818CF8',
    },
    speedChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#64748B',
    },
    speedChipTextActive: {
      color: '#4F46E5',
    },

    /* Sliders */
    sliderCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#E2E8F0',
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
      color: '#4F46E5',
    },
    rangeLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    rangeSub: {
      fontSize: 11,
      color: '#94A3B8',
    },
    toggleCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#E2E8F0',
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
      color: '#0F172A',
      marginBottom: 2,
    },
    toggleDesc: {
      fontSize: 12,
      color: '#64748B',
      lineHeight: 16,
    },
  });
};

import React from 'react';
import { Text, View } from 'react-native';

// Định nghĩa kiểu props cho component MorseTelegraphSheet
interface MorseTelegraphSheetProps {
  styles: any;
  characterType: string;
  useShortNumbers: boolean;
  hasPreamble: boolean;
  preambleDisplayText: string;
  activeMorseIndex: number;
  equalSignIndex: number;
  groups: string[];
  groupsPerRow: number;
  firstGroupStartIndex: number;
  activeCompareIndex: number;
  fullPlaybackLength: number;
}

// Component hiển thị tờ điện báo (Telegraph Sheet) gồm Đầu điện, Dấu =, Các nhóm mã và Dấu +
export const MorseTelegraphSheet: React.FC<MorseTelegraphSheetProps> = ({
  styles,
  characterType,
  useShortNumbers,
  hasPreamble,
  preambleDisplayText,
  activeMorseIndex,
  equalSignIndex,
  groups,
  groupsPerRow,
  firstGroupStartIndex,
  activeCompareIndex,
  fullPlaybackLength,
}) => {
  return (
    <View style={styles.boardCard}>
      {/* 1. Header tiêu đề loại điện */}
      <View style={styles.sheetTopBanner}>
        <View style={styles.sheetTopDot} />
        <Text style={styles.sheetTopTitle}>
          {characterType === 'letter'
            ? 'ĐIỆN TÍN CHỮ CÁI'
            : characterType === 'number'
            ? `ĐIỆN TÍN SỐ ${useShortNumbers ? '(SỐ TẮT)' : ''}`
            : 'ĐIỆN TÍN HỖN HỢP'}
        </Text>
        <View style={styles.sheetTopDot} />
      </View>

      {/* 2. Banner hiển thị Đầu điện nếu được bật */}
      {hasPreamble && (
        <View
          style={[
            styles.preambleBanner,
            activeMorseIndex >= 0 &&
              activeMorseIndex < equalSignIndex &&
              styles.preambleBannerActive,
          ]}
        >
          <Text style={styles.preambleTag}>[ĐẦU ĐIỆN]</Text>
          <Text style={styles.preambleContentText}>{preambleDisplayText}</Text>
        </View>
      )}

      {/* 3. Dấu hiệu bắt đầu '=' */}
      <View
        style={[
          styles.markerBadge,
          activeMorseIndex === equalSignIndex && styles.markerBadgeActive,
        ]}
      >
        <Text
          style={[
            styles.markerText,
            activeMorseIndex === equalSignIndex && styles.markerTextActive,
          ]}
        >
          = (BẮT ĐẦU PHÁT)
        </Text>
      </View>

      {/* 4. Lưới hiển thị các nhóm ký tự */}
      <View style={styles.gridContainer}>
        {Array.from(
          { length: Math.ceil(groups.length / groupsPerRow) },
          (_, rowIndex) => {
            const rowGroups = groups.slice(
              rowIndex * groupsPerRow,
              rowIndex * groupsPerRow + groupsPerRow,
            );
            const endNumber = Math.min(
              (rowIndex + 1) * groupsPerRow,
              groups.length,
            );

            return (
              <View key={`row-${rowIndex}`} style={styles.boardRow}>
                <View style={styles.cellsRow}>
                  {rowGroups.map((group, groupIdx) => {
                    const currentGroupGlobalIndex =
                      rowIndex * groupsPerRow + groupIdx;

                    // Tính offset index cho phát Morse và Đối chiếu
                    const morseGroupStartIndex =
                      firstGroupStartIndex + currentGroupGlobalIndex * 6;
                    const compareGroupStartIndex = currentGroupGlobalIndex * 5;

                    return (
                      <View
                        key={`${group}-${groupIdx}`}
                        style={styles.groupCell}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          {group.split('').map((char, charOffset) => {
                            const morseCharIdx =
                              morseGroupStartIndex + charOffset;
                            const compareCharIdx =
                              compareGroupStartIndex + charOffset;

                            // Highlight khi trùng khớp với tiến trình Morse hoặc Đối chiếu
                            const isHighlighted =
                              activeMorseIndex === morseCharIdx ||
                              activeCompareIndex === compareCharIdx;

                            return (
                              <Text
                                key={`${char}-${charOffset}`}
                                style={[
                                  styles.groupText,
                                  isHighlighted && styles.charHighlighted,
                                ]}
                              >
                                {char}
                              </Text>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })}
                </View>
                <View style={styles.rowCounter}>
                  <Text style={styles.rowCounterText}>#{endNumber}</Text>
                </View>
              </View>
            );
          },
        )}
      </View>

      {/* 5. Dấu hiệu kết thúc '+' */}
      <View
        style={[
          styles.markerBadge,
          styles.markerBadgeEnd,
          activeMorseIndex === fullPlaybackLength - 1 &&
            styles.markerBadgeActive,
        ]}
      >
        <Text
          style={[
            styles.markerText,
            activeMorseIndex === fullPlaybackLength - 1 &&
              styles.markerTextActive,
          ]}
        >
          + (HẾT BỨC ĐIỆN)
        </Text>
      </View>
    </View>
  );
};
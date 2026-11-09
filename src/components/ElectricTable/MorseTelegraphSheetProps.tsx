import React from 'react';
import {
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

interface GroupCellProps {
  group: string;
  groupCellStyle: StyleProp<ViewStyle>;
  groupTextStyle: StyleProp<TextStyle>;
  highlightedTextStyle: StyleProp<TextStyle>;
  morseHighlightOffset: number;
  compareHighlightOffset: number;
}

const groupCharactersStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
};

const GroupCell = React.memo(
  ({
    group,
    groupCellStyle,
    groupTextStyle,
    highlightedTextStyle,
    morseHighlightOffset,
    compareHighlightOffset,
  }: GroupCellProps) => (
    <View style={groupCellStyle}>
      <View style={groupCharactersStyle}>
        {group.split('').map((char, charOffset) => {
          const isHighlighted =
            morseHighlightOffset === charOffset ||
            compareHighlightOffset === charOffset;

          return (
            <Text
              key={`${char}-${charOffset}`}
              style={[
                groupTextStyle,
                isHighlighted && highlightedTextStyle,
              ]}
            >
              {char}
            </Text>
          );
        })}
      </View>
    </View>
  ),
);

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

                    const morseHighlightOffset =
                      activeMorseIndex >= morseGroupStartIndex &&
                      activeMorseIndex < morseGroupStartIndex + group.length
                        ? activeMorseIndex - morseGroupStartIndex
                        : -1;
                    const compareHighlightOffset =
                      activeCompareIndex >= compareGroupStartIndex &&
                      activeCompareIndex < compareGroupStartIndex + group.length
                        ? activeCompareIndex - compareGroupStartIndex
                        : -1;

                    return (
                      <GroupCell
                        key={`${group}-${groupIdx}`}
                        group={group}
                        groupCellStyle={styles.groupCell}
                        groupTextStyle={styles.groupText}
                        highlightedTextStyle={styles.charHighlighted}
                        morseHighlightOffset={morseHighlightOffset}
                        compareHighlightOffset={compareHighlightOffset}
                      />
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
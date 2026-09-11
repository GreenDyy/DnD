import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Calendar,
  FilePlus,
  FileText,
  Play,
  Share2,
  Trash2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { pick, types } from '@react-native-documents/picker';

import {
  deleteBoardFile,
  exportBoardFile,
  importBoardFromFile,
  loadAllBoardFiles,
  type MorseBoardFile,
} from '../../services/fileBoardService';
import { type RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedBoardsScreen'>;

const SavedBoardsScreen = ({ navigation }: Props) => {
  const [boards, setBoards] = useState<MorseBoardFile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const files = await loadAllBoardFiles();
    setBoards(files);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  // Xử lý Import file từ máy
  const handleImportFile = async () => {
    try {
      const [res] = await pick({
        type: [types.allFiles],
      });

      if (res && res.uri) {
        const imported = await importBoardFromFile(res.uri);
        Alert.alert('Thành công', `Đã nhập đề: "${imported.title}"`);
        loadData();
      }
    } catch (err: any) {
      if (err?.code !== 'OPERATION_CANCELED') {
        Alert.alert(
          'Lỗi',
          'Không thể nhập file hoặc file sai định dạng JSON/Morse.',
        );
      }
    }
  };

  // Chia sẻ file ra ngoài
  const handleShare = async (board: MorseBoardFile) => {
    try {
      await exportBoardFile(board);
    } catch (err: any) {
      console.log(err);
      Alert.alert('Lỗi', 'Không thể chia sẻ file đề này.');
    }
  };

  // Xóa file
  const handleDelete = (id: string, title: string) => {
    Alert.alert('Xác nhận xóa', `Bạn có chắc muốn xóa file "${title}" không?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await deleteBoardFile(id);
          loadData();
        },
      },
    ]);
  };

  // Mở lại đề để luyện
  const handleOpenBoard = (board: MorseBoardFile) => {
    navigation.navigate('ElectricBoardScreen', {
      groupCount: board.config.groupCount,
      characterType: board.config.characterType,
      savedBoard: board,
    });
  };

  const renderItem = ({ item }: { item: MorseBoardFile }) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString('vi-VN');

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.headerActions}>
            {/* Nút Chia sẻ file */}
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => handleShare(item)}
            >
              <Share2 size={17} color="#4F46E5" />
            </TouchableOpacity>

            {/* Nút Xóa file */}
            <TouchableOpacity
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => handleDelete(item.id, item.title)}
            >
              <Trash2 size={17} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Các nhãn thông số */}
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.config.groupCount} nhóm</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {item.config.characterType === 'letter'
                ? 'Chữ cái'
                : item.config.characterType === 'number'
                ? `Số ${item.config.useShortNumbers ? '(Tắt)' : ''}`
                : 'Hỗn hợp'}
            </Text>
          </View>
          {item.config.hasPreamble && (
            <View style={[styles.tag, styles.preambleTag]}>
              <Text style={[styles.tagText, styles.preambleTagText]}>
                Đầu điện: {item.config.nrValue}
              </Text>
            </View>
          )}
        </View>

        {/* Xem trước vài nhóm */}
        <Text style={styles.previewText} numberOfLines={1}>
          {item.groups.slice(0, 6).join(' ')}...
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Calendar size={13} color="#94A3B8" />
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.playBtn}
            onPress={() => handleOpenBoard(item)}
          >
            <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.playBtnText}>Luyện lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Navigation Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>KHO BẢNG ĐIỆN (.MORSE)</Text>

        {/* Nút Import File */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.importBtn}
          onPress={handleImportFile}
        >
          <FilePlus size={18} color="#4F46E5" />
          <Text style={styles.importBtnText}>Nhập file</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={boards}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <FileText size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Chưa có file đề nào</Text>
              <Text style={styles.emptyDesc}>
                Nhấn "Nhập file" để nạp đề từ bên ngoài hoặc bấm Bookmark trên
                màn hình luyện tập để lưu lại thành file.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default SavedBoardsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  importBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  preambleTag: {
    backgroundColor: '#EEF2FF',
  },
  preambleTagText: {
    color: '#4F46E5',
  },
  previewText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 10,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  playBtn: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 14,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});

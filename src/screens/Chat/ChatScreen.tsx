import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { colors } from '../../theme/colors';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalAIStore } from '../../store';
import { knowledgeService } from '../../ai';
import { LOCAL_AI_SYSTEM_PROMPT } from '../../ai/prompts';
import { parseIntent, getIntentNavigation } from '../../ai/IntentService';
import TypingIndicator from '../../components/TypingIndicator';
import { images } from '../../assets';
import { AI_NAME, REPLIES } from '../../constants';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  action?: {
    label: string;
    screen: string;
    params?: Record<string, any>;
  };
}

const MAX_INPUT_LENGTH = 200;
const MAX_PROMPT_LENGTH = 800;

// Memoized message item
const MessageItem = memo(({ item, onAction }: { item: Message; onAction?: (action: Message['action']) => void }) => {
  const isUser = item.role === 'user';

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}>
      {!isUser && <Image source={images.mori} style={styles.botAvatar} />}
      <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapBot]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          {item.text === '...' ? (
            <TypingIndicator />
          ) : (
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
              {item.text}
            </Text>
          )}
        </View>
        {item.action && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onAction?.(item.action)}
            activeOpacity={0.7}>
            <Text style={styles.actionBtnText}>{item.action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { progress, isReady, isLoading, error, initialize, generate } =
    useLocalAIStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: 'Xin chào! Mình là trợ lý AI Morse. Đang khởi tạo...',
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    handleInitialize();
  }, []);

  const handleInitialize = async () => {
    try {
      await initialize();
      setMessages(prev =>
        prev.map(m =>
          m.id === '1'
            ? { ...m, text: 'Xin chào! Mình là trợ lý AI Morse. Hỏi mình bất cứ điều gì về mã Morse nhé!' }
            : m,
        ),
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(m =>
          m.id === '1'
            ? { ...m, text: REPLIES.MODEL_ERROR }
            : m,
        ),
      );
    }
  };

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 50);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isGenerating) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text };
    const thinkingMessage: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: '...' };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInput('');
    setIsGenerating(true);
    scrollToBottom();

    try {
      let reply: string;

      // Check intent first
      const intent = parseIntent(text);
      console.log('🎯 [Intent]', JSON.stringify(intent, null, 2));

      if (intent.type !== 'ask_morse') {
        reply = intent.response;

        const navTarget = getIntentNavigation(intent.type, intent.params);
        const botMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'bot',
          text: reply,
          action: navTarget ? {
            label: `Mở ${intent.type === 'practice_electro' ? 'Bảng điện' : 'Tíc Tà Sound'}`,
            screen: navTarget.screen,
            params: navTarget.params,
          } : undefined,
        };
        setMessages(prev => [...prev.slice(0, -1), botMessage]);
      } else if (isReady) {
        if (!knowledgeService.isRelevant(text)) {
          reply = REPLIES.OUT_OF_SCOPE;
        } else {
          const context = knowledgeService.getContext(text);
          let fullPrompt = `Context từ knowledge base:\n${context}\n\nCâu hỏi của người dùng: ${text}`;

          console.log('🔍 [RAG] Context:', context);
          console.log('📝 [RAG] Full prompt:', fullPrompt);

          if (fullPrompt.length > MAX_PROMPT_LENGTH) {
            fullPrompt = fullPrompt.substring(0, MAX_PROMPT_LENGTH);
            console.log('✂️ [RAG] Truncated to:', fullPrompt.length, 'chars');
          }

          const maxTokensForGen = 256;
          const budget = knowledgeService.checkTokenBudget(LOCAL_AI_SYSTEM_PROMPT, fullPrompt, maxTokensForGen);

          console.log('💰 [Token] Budget:', budget);

          if (!budget.ok) {
            reply = `⚠️ ${budget.message}`;
          } else {
            reply = await generate(LOCAL_AI_SYSTEM_PROMPT, fullPrompt, maxTokensForGen);
            reply = reply.trim() || REPLIES.GENERATE_ERROR;
          }
        }
      } else {
        const result = knowledgeService.ask(text);
        reply = result.message;
      }

      if (intent.type === 'ask_morse') {
        const botMessage: Message = { id: (Date.now() + 2).toString(), role: 'bot', text: reply };
        setMessages(prev => [...prev.slice(0, -1), botMessage]);
      }
    } catch (err: any) {
      const errorMessage: Message = { id: (Date.now() + 2).toString(), role: 'bot', text: `Lỗi: ${err.message || 'Không thể generate'}` };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsGenerating(false);
      scrollToBottom();
    }
  }, [input, isGenerating, isReady, generate, scrollToBottom, navigation]);

  const statusText = isLoading
    ? `Đang tải... ${progress}%`
    : isReady
      ? 'Đang hoạt động'
      : error
        ? 'Lỗi kết nối'
        : 'Đang khởi tạo...';

  const statusColor = isReady
    ? colors.success
    : isLoading
      ? '#F59E0B'
      : error
        ? colors.error
        : colors.textSecondary;

  const handleAction = useCallback((action?: Message['action']) => {
    if (action) {
      (navigation as any).navigate(action.screen, action.params);
    }
  }, [navigation]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageItem item={item} onAction={handleAction} />
  ), [handleAction]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <Image source={images.mori} style={styles.avatar} />
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{AI_NAME}</Text>
            <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuBtn}>
          <MoreVertical size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages - FlatList with virtualization */}
      <FlatList
        ref={flatListRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        onContentSizeChange={scrollToBottom}
      />

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={isReady ? 'Nhập câu hỏi của bạn...' : 'Đang tải model...'}
            placeholderTextColor={colors.textSecondary}
            editable={!isGenerating && !isLoading}
            onSubmitEditing={handleSend}
            maxLength={MAX_INPUT_LENGTH}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isGenerating || isLoading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isGenerating || isLoading}>
            <Send size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.charCount}>{input.length}/{MAX_INPUT_LENGTH}</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
  },
  headerText: {
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  status: {
    fontSize: 13,
    marginTop: 2,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Messages
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowBot: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: colors.white,
  },
  bubbleTextBot: {
    color: colors.text,
  },
  bubbleWrap: {
    maxWidth: '78%',
  },
  bubbleWrapUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapBot: {
    alignItems: 'flex-start',
  },
  actionBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  // Input
  inputContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    fontSize: 15,
    color: colors.text,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  charCount: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 6,
    marginRight: 4,
  },
});

export default ChatScreen;

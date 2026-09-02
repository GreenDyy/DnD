import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalAIStore } from '../../store';
import { knowledgeService } from '../../ai';
import { LOCAL_AI_SYSTEM_PROMPT } from '../../ai/prompts';
import { parseIntent, getIntentNavigation, collectMissingParams, getFollowUpQuestion } from '../../ai/IntentService';
import type { ParsedIntent } from '../../ai/IntentService';
import { MessageItem, ChatHeader, ChatInput } from '../../components/Chat';
import type { Message } from '../../components/Chat';
import { colors } from '../../theme/colors';
import { AI_NAME, REPLIES } from '../../constants';

const MAX_INPUT_LENGTH = 200;
const MAX_PROMPT_LENGTH = 800;

function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { progress, isReady, isLoading, error, initialize, generate, cancelGenerate } =
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
  const [pendingIntent, setPendingIntent] = useState<ParsedIntent | null>(null);
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

  const handleStop = useCallback(() => {
    cancelGenerate();
    setIsGenerating(false);
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.text === '...') {
        return [...prev.slice(0, -1)];
      }
      return prev;
    });
  }, [cancelGenerate]);

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
      let actionMsg: Message['action'] | undefined;

      // === CASE 1: Có pendingIntent đang chờ collect params ===
      if (pendingIntent) {
        const result = collectMissingParams(pendingIntent, text);
        const updatedIntent: ParsedIntent = {
          ...pendingIntent,
          params: result.params,
          isComplete: result.isComplete,
          missingParams: result.missingParams,
        };

        if (result.isComplete) {
          // Đủ params → finalize
          const finalIntent: ParsedIntent = {
            ...updatedIntent,
            response: (() => {
              const { getIntentNavigation: _, ...rest } = updatedIntent;
              return '';
            })(),
          };
          // Generate response with full params
          const charTypeLabel: Record<string, string> = { letter: 'chữ cái', number: 'chữ số', mixed: 'hỗn hợp' };
          const numberFormatLabel: Record<string, string> = { short: 'số tắt', normal: 'số thường' };
          const p = result.params;

          if (updatedIntent.type === 'practice_electro') {
            const charLabel = charTypeLabel[p.characterType] || p.characterType;
            const fmtLabel = p.characterType === 'number' && p.numberFormat
              ? `, ${numberFormatLabel[p.numberFormat] || p.numberFormat}`
              : '';
            reply = `Được! Mình sẽ mở bảng điện ${p.groupCount} nhóm, ${charLabel}${fmtLabel}, tốc độ ${p.wpm} ký tự / 1 phút. Bắt đầu nhé!`;
          } else if (updatedIntent.type === 'practice_listen') {
            reply = `Ok! Mở chế độ luyện nghe với tốc độ ${p.speed} ký tự / 1 phút. Nghe kỹ và gõ đúng nha!`;
          } else if (updatedIntent.type === 'play_morse') {
            reply = `Mình sẽ phát âm morse của ký tự "${p.character}" ngay!`;
          } else {
            reply = 'Đã đủ thông tin!';
          }

          const navTarget = getIntentNavigation(updatedIntent.type, result.params);
          actionMsg = navTarget ? {
            label: updatedIntent.type === 'practice_electro' ? 'Bắt đầu thu' : 'Bắt đầu luyện',
            screen: navTarget.screen,
            params: navTarget.params,
          } : undefined;

          setPendingIntent(null);
        } else {
          // Còn thiếu → hỏi tiếp
          reply = getFollowUpQuestion(updatedIntent);
          setPendingIntent(updatedIntent);
        }

        const botMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'bot',
          text: reply,
          action: actionMsg,
        };

        setTimeout(() => {
          setMessages(prev => [...prev.slice(0, -1), botMessage]);
        }, 400);
        return;
      }

      // === CASE 2: Parse intent mới ===
      const intent = parseIntent(text);
      console.log('🎯 [Intent]', JSON.stringify(intent, null, 2));

      if (intent.type !== 'ask_morse') {
        if (intent.isComplete) {
          // Đủ params → show action
          reply = intent.response;
          const navTarget = getIntentNavigation(intent.type, intent.params);
          actionMsg = navTarget ? {
            label: intent.type === 'practice_electro' ? 'Bắt đầu thu' : 'Bắt đầu luyện',
            screen: navTarget.screen,
            params: navTarget.params,
          } : undefined;

          const botMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'bot',
            text: reply,
            action: actionMsg,
          };

          setTimeout(() => {
            setMessages(prev => [...prev.slice(0, -1), botMessage]);
          }, 400);
        } else {
          // Thiếu params → hỏi & lưu pendingIntent
          reply = getFollowUpQuestion(intent);
          setPendingIntent(intent);

          const botMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'bot',
            text: reply,
          };

          setTimeout(() => {
            setMessages(prev => [...prev.slice(0, -1), botMessage]);
          }, 400);
        }
        return;
      }

      // === CASE 3: ask_morse → LLM flow ===
      if (isReady) {
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

      const botMessage: Message = { id: (Date.now() + 2).toString(), role: 'bot', text: reply };
      setMessages(prev => [...prev.slice(0, -1), botMessage]);
    } catch (err: any) {
      if (err?.message === 'CANCELLED') {
        return;
      }
      const errorMessage: Message = { id: (Date.now() + 2).toString(), role: 'bot', text: `Lỗi: ${err.message || 'Không thể generate'}` };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsGenerating(false);
      scrollToBottom();
    }
  }, [input, isGenerating, isReady, pendingIntent, generate, scrollToBottom, navigation]);

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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <ChatHeader
          statusText={statusText}
          statusColor={statusColor}
          onBack={() => navigation.goBack()}
        />

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

        <ChatInput
          input={input}
          isReady={isReady}
          isGenerating={isGenerating}
          isLoading={isLoading}
          onChangeText={setInput}
          onSend={handleSend}
          onStop={handleStop}
          maxLength={MAX_INPUT_LENGTH}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
});

export default ChatScreen;

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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalAIStore } from '../../store';
import { knowledgeService } from '../../ai';
import { LOCAL_AI_SYSTEM_PROMPT } from '../../ai/prompts';
import { parseIntent, getIntentNavigation } from '../../ai/IntentService';
import { MessageItem, ChatHeader, ChatInput } from '../../components/Chat';
import type { Message } from '../../components/Chat';
import { colors } from '../../theme/colors';
import { AI_NAME, REPLIES } from '../../constants';

const MAX_INPUT_LENGTH = 200;
const MAX_PROMPT_LENGTH = 800;

function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
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
            label: intent.type === 'practice_electro' ? 'Bắt đầu thu' : 'Bắt đầu luyện',
            screen: navTarget.screen,
            params: navTarget.params,
          } : undefined,
        };

        // Typing delay 800ms rồi mới show reply
        setTimeout(() => {
          setMessages(prev => [...prev.slice(0, -1), botMessage]);
        }, 800);
        return;
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
      // Ignore cancelled errors
      if (err?.message === 'CANCELLED') {
        return;
      }
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
      <View style={{ paddingTop: insets.top + 8 }}>
        <ChatHeader
          statusText={statusText}
          statusColor={statusColor}
          onBack={() => navigation.goBack()}
        />
      </View>

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

      <View style={{ paddingBottom: insets.bottom + 8 }}>
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
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

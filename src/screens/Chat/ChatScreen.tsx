import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalAIStore } from '../../store';
import { knowledgeService } from '../../ai';
import { LOCAL_AI_SYSTEM_PROMPT } from '../../ai/prompts';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

const MAX_INPUT_LENGTH = 200;
const MAX_PROMPT_LENGTH = 800;

function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { progress, isReady, isLoading, error, initialize, generate } =
    useLocalAIStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: 'Xin chào! Mình là trợ lý AI Morse. Đang tải model, vui lòng chờ...',
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    handleInitialize();
  }, []);

  const handleInitialize = async () => {
    try {
      await initialize();

      setMessages(prev =>
        prev.map(m =>
          m.id === '1'
            ? {
              ...m,
              text: 'Xin chào! Mình là Mori, trợ lý AI báo vụ. Hãy hỏi mình về mã Morse!',
            }
            : m,
        ),
      );
    } catch (error) {
      setMessages(prev =>
        prev.map(m =>
          m.id === '1'
            ? {
              ...m,
              text: 'Không thể tải model. Vui lòng thử lại.',
            }
            : m,
        ),
      );
    }
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
    };

    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: '...',
    };

    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInput('');
    setIsGenerating(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      let reply: string;

      if (isReady) {
        // Kiểm tra câu hỏi có nằm trong phạm vi Morse không
        if (!knowledgeService.isRelevant(text)) {
          reply = 'Mình là Mori AI, trợ lý chuyên về học báo vụ Morse. Mình chỉ có thể hỗ trợ bạn về mã Morse và kỹ thuật báo vụ thôi nhé! Bạn có muốn hỏi gì về Morse không?';
        } else {
          // RAG: KnowledgeService tìm context → ghép prompt → LLM generate
          const context = knowledgeService.getContext(text);
          let fullPrompt = `Context từ knowledge base:\n${context}\n\nCâu hỏi của người dùng: ${text}`;

          console.log('🔍 [RAG] Context:', context);
          console.log('📝 [RAG] Full prompt:', fullPrompt);

          // Truncate nếu prompt quá dài để tránh crash native
          if (fullPrompt.length > MAX_PROMPT_LENGTH) {
            fullPrompt = fullPrompt.substring(0, MAX_PROMPT_LENGTH);
            console.log('✂️ [RAG] Truncated to:', fullPrompt.length, 'chars');
          }

          // Kiểm tra token budget trước khi gọi LLM
          const maxTokensForGen = 256;
          const budget = knowledgeService.checkTokenBudget(
            LOCAL_AI_SYSTEM_PROMPT,
            fullPrompt,
            maxTokensForGen,
          );

          console.log('💰 [Token] Budget:', budget);

          if (!budget.ok) {
            reply = `⚠️ ${budget.message}`;
          } else {
            reply = await generate(LOCAL_AI_SYSTEM_PROMPT, fullPrompt, maxTokensForGen);
            reply = reply.trim() || 'Xin lỗi, mình không thể trả lời lúc này.';
          }
        }
      } else {
        // Fallback: KnowledgeService rule-based
        const result = knowledgeService.ask(text);
        reply = result.message;
      }

      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'bot',
        text: reply,
      };

      setMessages(prev => [...prev.slice(0, -1), botMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'bot',
        text: `Lỗi: ${err.message || 'Không thể generate'}`,
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [input, isGenerating, isReady, generate]);

  const statusText = isLoading
    ? `Đang tải model... ${progress}%`
    : isReady
      ? 'Model sẵn sàng'
      : error
        ? `Lỗi: ${error}`
        : 'Đang khởi tạo...';

  const statusColor = isReady
    ? colors.success
    : isLoading
      ? '#F59E0B'
      : error
        ? colors.error
        : colors.textSecondary;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>AI Morse</Text>
          <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
            {msg.text === '...' ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <Text
                style={[
                  styles.bubbleText,
                  msg.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot,
                ]}>
                {msg.text}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={isReady ? 'Hỏi về Morse...' : 'Đang tải model...'}
            placeholderTextColor={colors.textSecondary}
            editable={!isGenerating && !isLoading}
            onSubmitEditing={handleSend}
            maxLength={MAX_INPUT_LENGTH}
          />
          <Text style={styles.charCount}>{input.length}/{MAX_INPUT_LENGTH}</Text>
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, (isGenerating || isLoading) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={isGenerating || isLoading}>
          <Send size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 20,
    gap: 12,
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    position: 'relative',
  },
  input: {
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingRight: 52,
    fontSize: 15,
    color: colors.text,
  },
  charCount: {
    position: 'absolute',
    right: 14,
    top: 12,
    fontSize: 11,
    color: colors.textSecondary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;

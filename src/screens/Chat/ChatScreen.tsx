import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AppState,
  View,
  StyleSheet,
  FlatList,
  ImageBackground,
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
import { parseIntent, getIntentNavigation, collectMissingParams, getFollowUpQuestion, generateIntentResponse } from '../../ai/IntentService';
import type { ParsedIntent } from '../../ai/IntentService';
import { MessageItem, ChatHeader, ChatInput } from '../../components/Chat';
import type { Message } from '../../components/Chat';
import { colors } from '../../theme/colors';
import { AI_NAME, REPLIES } from '../../constants';
import { morseAudio } from '../../audio/MorseAudioEngine';
import { images } from '../../assets';

const MAX_INPUT_LENGTH = 200;
const MAX_PROMPT_LENGTH = 800;

type PendingPlayback = {
  character: string;
  code?: string;
};

function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { progress, isReady, isLoading, error, warmup, generate, cancelGenerate } =
    useLocalAIStore();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: 'Xin chào! Mình là Mori, trợ lý AI Morse. Hỏi mình bất cứ điều gì về mã Morse nhé!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<ParsedIntent | null>(null);
  const [pendingPlayChar, setPendingPlayChar] = useState<PendingPlayback | null>(null);
  const [pendingNumber, setPendingNumber] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && isReady) {
        warmup(LOCAL_AI_SYSTEM_PROMPT).catch(error => {
          console.warn('[LocalAI] resume warmup failed', error);
        });
      }
    });

    return () => subscription.remove();
  }, [isReady, warmup]);

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

  const playMorseSignal = useCallback(async (playback: NonNullable<Message['playback']>) => {
    await morseAudio.start();
    morseAudio.setFrequency(600);
    morseAudio.setCpm(50);
    morseAudio.setVolume(1);
    if (playback.code) {
      await morseAudio.playMorse(playback.code);
    } else {
      await morseAudio.playText(playback.character);
    }
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
      let actionMsg: Message['action'] | undefined;

      // === CASE 0: Đang chờ xác nhận phát âm thanh Morse ===
      if (pendingPlayChar) {
        if (/(?:có|muốn|được|ok|yes|phát|nghe|nghe thử)/i.test(text)) {
          await playMorseSignal(pendingPlayChar);
          reply = `Đã phát tín hiệu ${pendingPlayChar.character}.`;
          setPendingPlayChar(null);

          const botMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'bot',
            text: reply,
            playback: pendingPlayChar,
          };
          setTimeout(() => {
            setMessages(prev => [...prev.slice(0, -1), botMessage]);
          }, 400);
          return;
        }
        // Không match "có" → silent cancel, rơi xuống xử lý câu mới
        setPendingPlayChar(null);
      }

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
          reply = generateIntentResponse(updatedIntent.type, result.params);

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

      // === CASE 2: Chờ chọn số thường hay số tắt ===
      if (pendingNumber) {
        const variant = /(?:số\s*)?(?:tắt|short)/i.test(text)
          ? 'short'
          : /(?:số\s*)?(?:thường|normal)/i.test(text)
            ? 'normal'
            : null;

        if (!variant) {
          reply = `Bạn muốn hỏi số ${pendingNumber} thường hay số ${pendingNumber} tắt?`;
          const botMessage: Message = { id: (Date.now() + 2).toString(), role: 'bot', text: reply };
          setMessages(prev => [...prev.slice(0, -1), botMessage]);
          return;
        }

        const numberResult = knowledgeService.getNumberResponse(pendingNumber, variant);
        setPendingNumber(null);

        if (numberResult?.type === 'character') {
          reply = `${numberResult.message}\n\nBạn có muốn tôi phát tín hiệu ${numberResult.answer} không?`;
          setPendingPlayChar({
            character: numberResult.answer,
            code: numberResult.code,
          });
        } else {
          reply = REPLIES.GENERATE_ERROR;
        }

        const botMessage: Message = { id: (Date.now() + 2).toString(), role: 'bot', text: reply };
        setMessages(prev => [...prev.slice(0, -1), botMessage]);
        return;
      }

      // === CASE 3: Parse intent mới ===
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

      // === CASE 4: ask_morse → Kiểm tra rule-based trước, sau đó LLM ===
      const askResult = knowledgeService.ask(text);

      if (!askResult) {
        throw new Error('Không thể xử lý câu hỏi Morse');
      }

      if (askResult.type === 'ambiguous_number') {
        setPendingNumber(askResult.answer);
        reply = askResult.message;
        const botMessage: Message = { id: (Date.now() + 2).toString(), role: 'bot', text: reply };
        setMessages(prev => [...prev.slice(0, -1), botMessage]);
        return;
      }

      if (askResult.type === 'character') {
        // Hỏi về ký tự → trả lời trực tiếp + hỏi phát âm
        const char = askResult.answer;
        reply = askResult.message;
        reply += `\n\nBạn có muốn tôi phát tín hiệu ${char} không?`;
        setPendingPlayChar({ character: char });

        const botMessage: Message = { id: (Date.now() + 2).toString(), role: 'bot', text: reply };
        setTimeout(() => {
          setMessages(prev => [...prev.slice(0, -1), botMessage]);
        }, 400);
        return;
      }

      // Các loại query khác → qua LLM
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
        reply = askResult.message;
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
  }, [input, isGenerating, isReady, pendingIntent, pendingNumber, pendingPlayChar, generate, playMorseSignal, scrollToBottom]);

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

  const handleReplay = useCallback(async (playback: NonNullable<Message['playback']>) => {
    try {
      await playMorseSignal(playback);
    } catch (err) {
      console.warn('[MorseAudio] replay failed', err);
    }
  }, [playMorseSignal]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageItem item={item} onAction={handleAction} onReplay={handleReplay} />
  ), [handleAction, handleReplay]);

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

        <ImageBackground
          source={images.background}
          style={styles.messageBackground}
          imageStyle={styles.messageBackgroundImage}>
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
        </ImageBackground>

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
  messageBackground: {
    flex: 1,
  },
  messageBackgroundImage: {
    resizeMode: 'stretch',
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
});

export default ChatScreen;

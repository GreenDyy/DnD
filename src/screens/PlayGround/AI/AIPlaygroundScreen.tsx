import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { PlaygroundStackParamList } from '../../../types/navigation';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Loader } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { Button } from '../../../components/Common';
import Input from '../../../components/Input/Input';
import { useLocalAIStore } from '../../../store';
import knowledgeService from '../../../ai/KnowledgeService';
import { LOCAL_AI_SYSTEM_PROMPT } from '../../../ai/prompts';

function AIPlaygroundScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<PlaygroundStackParamList>>();
  const { modelPath, progress, isReady, isLoading, error, prepare, loadModel, generate } =
    useLocalAIStore();

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [prompt, setPrompt] = useState('Xin chào, tôi muốn học báo vụ. Bạn có thể giúp tôi không?');
  const [generatedText, setGeneratedText] = useState('');
  const [maxTokens, setMaxTokens] = useState(128);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrepareModel = async () => {
    await prepare();
  };

  const handleLoadModel = async () => {
    if (!modelPath) {
      Alert.alert('Load model failed', 'Prepare the model first');
      return;
    }

    try {
      await loadModel(modelPath);
      Alert.alert('Load model', 'Model loaded successfully');
    } catch (err: any) {
      Alert.alert('Load model failed', err?.message || 'Cannot load model');
    }
  };

  const handleGenerate = async () => {
    if (!modelPath) {
      Alert.alert('Generate failed', 'Prepare and load the model first');
      return;
    }
    if (!prompt.trim()) {
      Alert.alert('Generate failed', 'Enter a prompt first');
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedText(
        await generate(LOCAL_AI_SYSTEM_PROMPT, prompt.trim(), maxTokens),
      );
    } catch (err: any) {
      Alert.alert('Generate failed', err?.message || 'Cannot generate text');
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleTestKnowledge = () => {
    if (!query.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập câu hỏi');
      return;
    }
    const response = knowledgeService.ask(query);
    setResult(response);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Model Test</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}>

        {/* --- Section: Local AI Model --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local AI Model</Text>
          <Text style={styles.desc}>
            Test native module <Text style={styles.code}>LocalAI</Text> — prepare
            model, kiểm tra trạng thái
          </Text>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isReady
                        ? colors.success
                        : isLoading
                          ? '#F59E0B'
                          : error
                            ? colors.error
                            : colors.textSecondary,
                    },
                  ]}
                />
                {isLoading ? (
                  <Loader size={14} color="#F59E0B" />
                ) : isReady ? (
                  <CheckCircle size={14} color={colors.success} />
                ) : error ? (
                  <XCircle size={14} color={colors.error} />
                ) : null}
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: isReady
                        ? colors.success
                        : isLoading
                          ? '#F59E0B'
                          : error
                            ? colors.error
                            : colors.textSecondary,
                    },
                  ]}>
                  {isReady ? 'Ready' : isLoading ? 'Loading...' : error ? 'Error' : 'Idle'}
                </Text>
              </View>
            </View>

            {isLoading && (
              <View style={styles.progressWrap}>
                <View style={styles.progressBg}>
                  <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
                <Text style={styles.progressPct}>{progress}%</Text>
              </View>
            )}


            {modelPath && (
              <View style={styles.statusRow}>
                <Text style={styles.label}>Path</Text>
                <Text style={styles.pathText} numberOfLines={2}>
                  {modelPath}
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          <Button
            title={isLoading ? 'Preparing...' : 'Prepare Model'}
            onPress={handlePrepareModel}
            disabled={isLoading}
            style={{ marginTop: 12 }}
          />

          <TouchableOpacity
            style={styles.retryBtn}
            onPress={handlePrepareModel}
            disabled={isLoading}>
            <RefreshCw size={16} color={colors.primary} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>

          <Button
            title="Load Model"
            onPress={handleLoadModel}
            disabled={!modelPath || isLoading}
            style={{ marginTop: 12 }}
          />

          <Input
            label="Prompt"
            placeholder="Ask the local model something"
            value={prompt}
            onChangeText={setPrompt}
          />

          <Button
            title={isGenerating ? 'Generating...' : 'Generate'}
            onPress={handleGenerate}
            disabled={!modelPath || isLoading || isGenerating}
            style={{ marginTop: 12 }}
          />

          {generatedText ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Output:</Text>
              <Text style={styles.resultAnswer}>{generatedText}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        {/* --- Section: Knowledge Service --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Knowledge Service</Text>
          <Text style={styles.desc}>
            Test rule-based Q&A — nhập ký tự, mã Morse, hoặc câu hỏi
          </Text>

          <Input
            label="Query"
            placeholder='e.g. "A", "... --- ...", "tích", "SOS"'
            value={query}
            onChangeText={setQuery}
          />

          <Button title="Ask" onPress={handleTestKnowledge} />

          {result && (
            <View style={styles.resultCard}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{result.type}</Text>
              </View>

              {result.answer && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Answer:</Text>
                  <Text style={styles.resultAnswer}>{result.answer}</Text>
                </View>
              )}

              {result.code && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Code:</Text>
                  <Text style={styles.resultCode}>{result.code}</Text>
                </View>
              )}

              <Text style={styles.resultMsg}>{result.message}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  pathText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 24,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    textTransform: 'uppercase',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  resultAnswer: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  resultCode: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 2,
  },
  resultMsg: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 4,
  },
});

export default AIPlaygroundScreen;

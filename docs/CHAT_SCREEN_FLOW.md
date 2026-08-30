# Chat Screen - Flow Hoạt Động

## Tổng quan

Chat Screen là giao diện chat với AI assistant "Mori" sử dụng mô hình Qwen local (llama.cpp) kết hợp RAG (Retrieval-Augmented Generation) từ knowledge base Morse.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       ChatScreen                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  Input   │───▶│  handleSend  │───▶│   FlatList       │   │
│  └─────────┘    └──────────────┘    │   (Messages)     │   │
│                                     └──────────────────┘   │
│                                              ▲              │
│                                              │              │
│  ┌──────────────────────────────────────────┴───────────┐  │
│  │                    RAG Pipeline                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ isRelevant  │─▶│ getContext  │─▶│   generate   │  │  │
│  │  │  (Filter)   │  │ (Retrieval) │  │   (LLM)     │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Flow Chi Tiết

### 1. Khởi Tạo (Mount)

```
useEffect → handleInitialize()
    │
    ├──▶ useLocalAIStore.initialize()
    │       ├── prepare()     → Copy model từ bundle sang device
    │       └── loadModel()   → Load model vào native (llama.cpp)
    │
    └──▶ Update message: "Xin chào! Mình là Mori..."
```

### 2. Gửi Tin nhắn (handleSend)

```
User nhập text → Nhấn Send
         │
         ▼
┌─────────────────────────────────────────┐
│ 1. Tạo userMessage + thinkingMessage    │
│    thinkingMessage.text = '...'         │
│    → Hiển thị TypingIndicator           │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 2. Kiểm tra Model Ready?               │
│    isReady = true  → RAG flow           │
│    isReady = false → Rule-based flow    │
└─────────────────────────────────────────┘
         │
         ▼ (RAG flow)
┌─────────────────────────────────────────┐
│ 3. Scope Filter                         │
│    knowledgeService.isRelevant(text)    │
│    ├── false → REPLIES.OUT_OF_SCOPE     │
│    └── true  → Tiếp tục RAG             │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 4. Retrieval                            │
│    knowledgeService.getContext(text)     │
│    ├── _extractTargetCharacter()        │
│    │   └── Parse: "chữ C" → "C"         │
│    ├── _findRelevantRules()             │
│    │   └── Match keywords → Rules       │
│    └── Return context string            │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 5. Build Prompt                         │
│    fullPrompt = `Context: ${context}    │
│                  Câu hỏi: ${text}`      │
│    Truncate nếu > 800 chars             │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 6. Token Budget Check                   │
│    checkTokenBudget(system, user, 256)  │
│    ├── MAX_INPUT = 600 tokens           │
│    ├── MAX_TOTAL = 1024 tokens          │
│    └── ok = false → Warning message     │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 7. Generate (Native)                    │
│    generate(systemPrompt, fullPrompt)   │
│    │                                    │
│    ▼                                    │
│  ┌────────────────────────────────────┐ │
│  │ LocalAIModule.java                 │ │
│  │   └── LlamaNative.generate()       │ │
│  │                                    │ │
│  │ llama_native.cpp                   │ │
│  │   ├── Format chat template         │ │
│  │   ├── Tokenize prompt              │ │
│  │   ├── llama_init_from_model()      │ │
│  │   ├── llama_decode() (chunked)     │ │
│  │   └── Sample tokens (greedy)       │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 8. Update Messages                      │
│    Replace thinkingMessage with reply   │
│    scrollToBottom()                     │
└─────────────────────────────────────────┘
```

### 3. Rule-Based Flow (Model chưa sẵn sàng)

```
knowledgeService.ask(text)
    │
    ├──▶ /^[.\-\s]+$/.test(text) → Decode Morse
    ├──▶ /chữ|ký tự/.test(text)  → Find character
    ├──▶ text.includes('tích')   → Rule: Tích
    ├──▶ text.includes('tà')     → Rule: Tà
    ├──▶ text.includes('sos')    → SOS decode
    └──▶ default                 → Unknown message
```

## Components

### TypingIndicator
- 3 dots animated sóng biển
- Dots bounce lên xuống với delay staggered (0ms, 150ms, 300ms)
- Dùng `Animated.loop` + `useNativeDriver: true`

### MessageItem (memo)
- Memoized component, chỉ re-render khi item thay đổi
- Bot message: avatar Mori + bubble trắng
- User message: bubble xanh lá, căn phải

### FlatList (Virtualization)
```tsx
removeClippedSubviews={true}  //卸载 offscreen views
maxToRenderPerBatch={10}       // 10 items/batch
windowSize={5}                  // 5 screens ahead
initialNumToRender={10}         // 10 items đầu
```

## Constants (config.ts)

```typescript
export const AI_NAME = "Trợ lý Mori";

export const REPLIES = {
  OUT_OF_SCOPE: 'Xin lỗi, mình chỉ hỗ trợ về mã Morse...',
  MODEL_LOADING: 'Đang tải model, vui lòng chờ...',
  MODEL_ERROR: 'Không thể tải model. Vui lòng thử lại.',
  GENERATE_ERROR: 'Xin lỗi, mình không thể trả lời lúc này.',
  TOKEN_LIMIT: 'Câu hỏi quá dài. Vui lòng rút gọn.',
};
```

## Token Budget

| Component | Max Tokens |
|-----------|-----------|
| System Prompt | ~100 |
| Context + Question | ~500 |
| Output (maxTokens) | 256 |
| **Tổng** | **~1024** |

## Safety Layers

1. **Input limit**: `maxLength={200}` trên TextInput
2. **Prompt truncation**: `MAX_PROMPT_LENGTH = 800` chars
3. **Token budget check**: `checkTokenBudget()` trước khi generate
4. **Native truncation**: `maxCtx = 2048` tokens, truncate nếu vượt
5. **Chunk decode**: Chia prompt thành batches ≤ `n_batch`

## Files

```
src/
├── screens/Chat/
│   └── ChatScreen.tsx          # Main chat UI
├── components/
│   └── TypingIndicator/
│       ├── index.ts
│       └── TypingIndicator.tsx  # Animated typing dots
├── store/
│   └── localAIStore.ts          # Zustand store (generate, initialize)
├── ai/
│   ├── KnowledgeService.js      # RAG: isRelevant, getContext, checkTokenBudget
│   ├── knowledgeBase.js         # Knowledge base loader
│   ├── knowledge/
│   │   ├── morse_basic.js       # A-Z, 0-9 entries
│   │   └── morse_rules.js       # Rules (tích, tà, SOS, WPM...)
│   └── prompts.ts               # System prompt for Qwen
├── constants/
│   └── config.ts                # AI_NAME, REPLIES, APP_NAME
└── assets/
    └── images/
        └── mori.png             # Avatar
```

## Native Layer

```
LocalAIModule.java
    └── generate(systemPrompt, prompt, maxTokens)
            │
            ▼
LlamaNative.java (JNI)
    └── native generate(modelHandle, system, user, maxTokens)
            │
            ▼
llama_native.cpp
    ├── Format chat template (Qwen format)
    ├── Tokenize → promptTokens
    ├── n_ctx = max(512, promptTokens + maxTokens + 1)
    ├── n_batch = max(512, min(promptTokens, 1024))
    ├── llama_decode() in chunks
    └── Sample greedy → output string
```

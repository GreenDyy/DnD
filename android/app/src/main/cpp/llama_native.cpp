#include <jni.h>
#include <android/log.h>

#include "llama.h"

#include <algorithm>
#include <atomic>
#include <mutex>
#include <string>
#include <thread>
#include <vector>

static constexpr const char* LOCAL_AI_TAG = "LocalAI";
#define LOCAL_AI_LOG(...) __android_log_print(ANDROID_LOG_INFO, LOCAL_AI_TAG, __VA_ARGS__)

static std::atomic<bool> stopRequested{false};
static std::mutex inferenceMutex;
static llama_model* loadedModel = nullptr;
static llama_context* loadedContext = nullptr;
static std::string cachedSystemPrompt;
static std::vector<uint8_t> cachedSystemState;
static std::vector<llama_token> cachedPrefixTokens;

static std::string formatChatPrompt(
        const llama_model* model,
        const std::string& systemPrompt,
        const std::string& userPrompt) {
    const llama_chat_message messages[] = {
        {"system", systemPrompt.c_str()},
        {"user", userPrompt.c_str()},
    };
    const char* chatTemplate = llama_model_chat_template(model, nullptr);
    std::string formattedPrompt;

    if (chatTemplate != nullptr && chatTemplate[0] != '\0') {
        const int32_t requiredSize = llama_chat_apply_template(
                chatTemplate, messages, 2, true, nullptr, 0);
        if (requiredSize > 0) {
            std::vector<char> formattedBuffer(static_cast<size_t>(requiredSize) + 1);
            const int32_t formattedSize = llama_chat_apply_template(
                    chatTemplate,
                    messages,
                    2,
                    true,
                    formattedBuffer.data(),
                    static_cast<int32_t>(formattedBuffer.size()));
            if (formattedSize > 0) {
                formattedPrompt.assign(
                        formattedBuffer.data(), static_cast<size_t>(formattedSize));
            }
        }
    }

    if (formattedPrompt.empty()) {
        formattedPrompt =
                "<|im_start|>system\n" + systemPrompt +
                "<|im_end|>\n<|im_start|>user\n" + userPrompt +
                "<|im_end|>\n<|im_start|>assistant\n";
    }

    return formattedPrompt;
}

static std::string formatSystemPrompt(
        const llama_model* model,
        const std::string& systemPrompt) {
    const llama_chat_message message = {"system", systemPrompt.c_str()};
    const char* chatTemplate = llama_model_chat_template(model, nullptr);
    std::string formattedPrompt;

    if (chatTemplate != nullptr && chatTemplate[0] != '\0') {
        const int32_t requiredSize = llama_chat_apply_template(
                chatTemplate, &message, 1, true, nullptr, 0);
        if (requiredSize > 0) {
            std::vector<char> formattedBuffer(static_cast<size_t>(requiredSize) + 1);
            const int32_t formattedSize = llama_chat_apply_template(
                    chatTemplate,
                    &message,
                    1,
                    true,
                    formattedBuffer.data(),
                    static_cast<int32_t>(formattedBuffer.size()));
            if (formattedSize > 0) {
                formattedPrompt.assign(
                        formattedBuffer.data(), static_cast<size_t>(formattedSize));
            }
        }
    }

    if (formattedPrompt.empty()) {
        formattedPrompt =
                "<|im_start|>system\n" + systemPrompt +
                "<|im_end|>\n<|im_start|>assistant\n";
    }

    return formattedPrompt;
}

static bool tokenizePrompt(
        const llama_vocab* vocab,
        const std::string& prompt,
        std::vector<llama_token>& tokens) {
    const int32_t requiredTokens = llama_tokenize(
            vocab,
            prompt.c_str(),
            static_cast<int32_t>(prompt.size()),
            nullptr,
            0,
            true,
            true);
    if (requiredTokens == 0) {
        return false;
    }

    const int32_t tokenCount = requiredTokens < 0 ? -requiredTokens : requiredTokens;
    tokens.resize(static_cast<size_t>(tokenCount));
    const int32_t actualTokens = llama_tokenize(
            vocab,
            prompt.c_str(),
            static_cast<int32_t>(prompt.size()),
            tokens.data(),
            tokenCount,
            true,
            true);
    return actualTokens == tokenCount;
}

static bool saveContextState(llama_context* context) {
    const size_t stateSize = llama_state_get_size(context);
    cachedSystemState.resize(stateSize);
    const size_t savedSize = llama_state_get_data(
            context, cachedSystemState.data(), cachedSystemState.size());
    if (savedSize == 0) {
        cachedSystemState.clear();
        return false;
    }
    cachedSystemState.resize(savedSize);
    return true;
}

static std::string tokenToPiece(
        const llama_vocab* vocab,
        llama_token token) {
    std::string piece(256, '\0');
    int32_t size = llama_token_to_piece(
            vocab, token, piece.data(), static_cast<int32_t>(piece.size()), 0, false);

    if (size < 0) {
        piece.resize(static_cast<size_t>(-size));
        size = llama_token_to_piece(
                vocab, token, piece.data(), static_cast<int32_t>(piece.size()), 0, false);
    }

    if (size <= 0) {
        return {};
    }

    piece.resize(static_cast<size_t>(size));
    return piece;
}

extern "C"
JNIEXPORT jlong JNICALL
Java_com_dnd_ai_LlamaNative_loadModel(
        JNIEnv* env,
        jclass clazz,
        jstring modelPath
) {
    LOCAL_AI_LOG("loadModel: start");
    const char* path = env->GetStringUTFChars(modelPath, nullptr);
    LOCAL_AI_LOG("loadModel: path=%s", path);
    llama_backend_init();

    llama_model_params params = llama_model_default_params();
    llama_model* model = llama_model_load_from_file(path, params);

    env->ReleaseStringUTFChars(modelPath, path);

    if (model != nullptr) {
        std::lock_guard<std::mutex> lock(inferenceMutex);
        cachedSystemPrompt.clear();
        cachedSystemState.clear();
        cachedPrefixTokens.clear();
        llama_context_params contextParams = llama_context_default_params();
        contextParams.n_ctx = 2048;
        contextParams.n_batch = 512;
        const unsigned int cpuThreads = std::thread::hardware_concurrency();
        const int inferenceThreads = static_cast<int>(
                std::clamp(cpuThreads == 0 ? 4u : cpuThreads, 2u, 6u));
        contextParams.n_threads = inferenceThreads;
        contextParams.n_threads_batch = inferenceThreads;

        loadedContext = llama_init_from_model(model, contextParams);
        if (loadedContext == nullptr) {
            LOCAL_AI_LOG("loadModel: context creation failed");
            llama_model_free(model);
            model = nullptr;
        }
    }

    LOCAL_AI_LOG("loadModel: finished handle=%p", model);
    return reinterpret_cast<jlong>(model);
}

extern "C"
JNIEXPORT void JNICALL
Java_com_dnd_ai_LlamaNative_freeModel(
        JNIEnv* env,
        jclass clazz,
        jlong modelHandle
) {
    LOCAL_AI_LOG("freeModel: handle=%lld", static_cast<long long>(modelHandle));
    std::lock_guard<std::mutex> lock(inferenceMutex);
    cachedSystemPrompt.clear();
    cachedSystemState.clear();
    cachedPrefixTokens.clear();
    if (loadedContext != nullptr) {
        llama_free(loadedContext);
        loadedContext = nullptr;
    }

    auto* model = reinterpret_cast<llama_model*>(modelHandle);
    if (model != nullptr) {
        llama_model_free(model);
        loadedModel = nullptr;
    }
}

extern "C"
JNIEXPORT jstring JNICALL
Java_com_dnd_ai_LlamaNative_generate(
        JNIEnv* env,
        jclass clazz,
        jlong modelHandle,
        jstring systemPrompt,
        jstring prompt,
        jint maxTokens
) {
    LOCAL_AI_LOG("generate: start handle=%lld maxTokens=%d", static_cast<long long>(modelHandle), maxTokens);
    std::lock_guard<std::mutex> lock(inferenceMutex);
    auto* model = reinterpret_cast<llama_model*>(modelHandle);
    if (model != loadedModel) {
        loadedModel = model;
    }
    if (model == nullptr || systemPrompt == nullptr || prompt == nullptr) {
        return env->NewStringUTF("");
    }

    if (loadedContext == nullptr) {
        LOCAL_AI_LOG("generate: context is not loaded");
        return env->NewStringUTF("");
    }

    const char* systemPromptText = env->GetStringUTFChars(systemPrompt, nullptr);
    const char* userPromptText = env->GetStringUTFChars(prompt, nullptr);
    LOCAL_AI_LOG("generate: prompt length=%zu", std::string(userPromptText).size());
    const std::string systemPromptValue(systemPromptText);
    const std::string userPrompt(userPromptText);
    env->ReleaseStringUTFChars(systemPrompt, systemPromptText);
    env->ReleaseStringUTFChars(prompt, userPromptText);
    const std::string formattedPrompt = formatChatPrompt(
            model, systemPromptValue, userPrompt);
        const std::string emptyUserPrompt = formatChatPrompt(
            model, systemPromptValue, "");

        LOCAL_AI_LOG("generate: formatted prompt length=%zu", formattedPrompt.size());
    const llama_vocab* vocab = llama_model_get_vocab(model);
        std::vector<llama_token> promptTokens;
        std::vector<llama_token> emptyUserTokens;
        if (!tokenizePrompt(vocab, formattedPrompt, promptTokens) ||
            !tokenizePrompt(vocab, emptyUserPrompt, emptyUserTokens)) {
        return env->NewStringUTF("");
    }
        const int32_t tokenCount = static_cast<int32_t>(promptTokens.size());
        const int32_t commonTokenCount = static_cast<int32_t>(std::distance(
            emptyUserTokens.begin(),
            std::mismatch(emptyUserTokens.begin(), emptyUserTokens.end(), promptTokens.begin()).first));
        LOCAL_AI_LOG("generate: prompt tokens=%d cache prefix tokens=%d", tokenCount, commonTokenCount);

    const int tokenLimit = maxTokens > 0 ? maxTokens : 128;
    const int maxCtx = 2048;  // Safe context window for small models
    constexpr int32_t batchSize = 512;

        // Safety: truncate tokens if prompt + output exceeds context
        int32_t usableTokens = tokenCount;
        if (tokenCount + tokenLimit + 1 > maxCtx) {
            usableTokens = maxCtx - tokenLimit - 1;
            LOCAL_AI_LOG("generate: truncating prompt from %d to %d tokens", tokenCount, usableTokens);
        }

    llama_context* context = loadedContext;
    bool canUseSystemCache = cachedSystemPrompt == systemPromptValue &&
            !cachedSystemState.empty() &&
            cachedPrefixTokens.size() == static_cast<size_t>(commonTokenCount) &&
            std::equal(cachedPrefixTokens.begin(), cachedPrefixTokens.end(), promptTokens.begin());

    if (canUseSystemCache) {
        const size_t restoredSize = llama_state_set_data(
                context, cachedSystemState.data(), cachedSystemState.size());
        canUseSystemCache = restoredSize == cachedSystemState.size();
    }

    if (!canUseSystemCache) {
        llama_memory_clear(llama_get_memory(context), true);
        for (int32_t i = 0; i < commonTokenCount; i += batchSize) {
            const int32_t chunkSize = std::min(batchSize, commonTokenCount - i);
            llama_batch systemBatch = llama_batch_get_one(
                    promptTokens.data() + i, chunkSize);
            if (llama_decode(context, systemBatch) != 0) {
                LOCAL_AI_LOG("generate: system prompt decode failed at offset=%d", i);
                return env->NewStringUTF("");
            }
        }
        cachedSystemPrompt = systemPromptValue;
        cachedPrefixTokens.assign(promptTokens.begin(), promptTokens.begin() + commonTokenCount);
        if (saveContextState(context)) {
            canUseSystemCache = true;
        } else {
            cachedSystemPrompt.clear();
            llama_memory_clear(llama_get_memory(context), true);
            for (int32_t i = 0; i < usableTokens; i += batchSize) {
                const int32_t chunkSize = std::min(batchSize, usableTokens - i);
                llama_batch promptBatch = llama_batch_get_one(
                        promptTokens.data() + i, chunkSize);
                if (llama_decode(context, promptBatch) != 0) {
                    LOCAL_AI_LOG("generate: prompt decode failed at offset=%d", i);
                    return env->NewStringUTF("");
                }
            }
        }
    }

    const int32_t userStart = canUseSystemCache ? commonTokenCount : 0;
    LOCAL_AI_LOG("generate: reused context n_ctx=%d n_batch=%d", maxCtx, 512);

    // Decode prompt in chunks of n_batch
    for (int32_t i = userStart; i < usableTokens; i += batchSize) {
        const int32_t chunkSize = std::min(batchSize, usableTokens - i);
        llama_batch promptBatch = llama_batch_get_one(
                promptTokens.data() + i, chunkSize);
        if (llama_decode(context, promptBatch) != 0) {
            LOCAL_AI_LOG("generate: prompt decode failed at offset=%d", i);
            return env->NewStringUTF("");
        }
    }
    LOCAL_AI_LOG("generate: prompt decoded");

    llama_sampler* sampler = llama_sampler_init_greedy();
    std::string output;

    // Reset stop flag before generating
    stopRequested.store(false);

    for (int i = 0; i < tokenLimit; ++i) {
        // Check if stop was requested
        if (stopRequested.load()) {
            LOCAL_AI_LOG("generate: stop requested at index=%d", i);
            break;
        }

        const llama_token token = llama_sampler_sample(sampler, context, -1);
        llama_sampler_accept(sampler, token);

        if (llama_vocab_is_eog(vocab, token)) {
            LOCAL_AI_LOG("generate: end token at index=%d", i);
            break;
        }

        output += tokenToPiece(vocab, token);
        llama_batch nextBatch = llama_batch_get_one(
                const_cast<llama_token*>(&token), 1);
        if (llama_decode(context, nextBatch) != 0) {
            LOCAL_AI_LOG("generate: token decode failed at index=%d", i);
            break;
        }

        if ((i + 1) % 10 == 0) {
            LOCAL_AI_LOG("generate: generated tokens=%d", i + 1);
        }
    }

    llama_sampler_free(sampler);
    LOCAL_AI_LOG("generate: finished output bytes=%zu", output.size());
    return env->NewStringUTF(output.c_str());
}

extern "C"
JNIEXPORT void JNICALL
Java_com_dnd_ai_LlamaNative_stopGenerate(
        JNIEnv* env,
        jclass clazz
) {
    LOCAL_AI_LOG("stopGenerate: setting stop flag");
    stopRequested.store(true);
}
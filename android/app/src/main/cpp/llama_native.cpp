#include <jni.h>
#include <android/log.h>

#include "llama.h"

#include <algorithm>
#include <string>
#include <thread>
#include <vector>

static constexpr const char* LOCAL_AI_TAG = "LocalAI";
#define LOCAL_AI_LOG(...) __android_log_print(ANDROID_LOG_INFO, LOCAL_AI_TAG, __VA_ARGS__)

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
    auto* model = reinterpret_cast<llama_model*>(modelHandle);
    if (model != nullptr) {
        llama_model_free(model);
    }
}

extern "C"
JNIEXPORT jstring JNICALL
Java_com_dnd_ai_LlamaNative_generate(
        JNIEnv* env,
        jclass clazz,
        jlong modelHandle,
        jstring prompt,
        jint maxTokens
) {
    LOCAL_AI_LOG("generate: start handle=%lld maxTokens=%d", static_cast<long long>(modelHandle), maxTokens);
    auto* model = reinterpret_cast<llama_model*>(modelHandle);
    if (model == nullptr || prompt == nullptr) {
        return env->NewStringUTF("");
    }

    const char* promptText = env->GetStringUTFChars(prompt, nullptr);
    LOCAL_AI_LOG("generate: prompt length=%zu", std::string(promptText).size());
        const std::string userPrompt(promptText);
        env->ReleaseStringUTFChars(prompt, promptText);

        const std::string systemPrompt =
            "Bạn là AI giáo viên chuyên đào tạo báo vụ Morse, có nhiệm vụ hỗ trợ "
            "người học luyện tập và nâng cao kỹ năng báo vụ.\n\n"
            "Bạn tập trung vào các nội dung:\n"
            "- Bảng mã Morse quốc tế.\n"
            "- 26 chữ cái và 10 chữ số.\n"
            "- Kỹ thuật thu, ghi và phát tín hiệu Morse.\n"
            "- Phân biệt tín hiệu tích và tè.\n"
            "- Luyện nghe, nhận biết và ghi lại ký tự Morse.\n"
            "- Kỹ thuật thu ghi nước chảy.\n"
            "- Luyện tập tốc độ và độ chính xác.\n"
            "- Giải thích các lỗi thường gặp khi học và thực hành báo vụ.\n\n"
            "Nguyên tắc giảng dạy:\n"
            "- Giải thích dễ hiểu, ngắn gọn và phù hợp với trình độ người học.\n"
            "- Khi người học trả lời sai, chỉ ra lỗi, giải thích vì sao sai và đưa ra cách sửa.\n"
            "- Khi phù hợp, đưa ra ví dụ hoặc bài tập ngắn để người học luyện tập.\n"
            "- Ưu tiên tương tác theo kiểu giáo viên - học viên, không chỉ đưa ra đáp án.\n"
            "- Không tự ý mở rộng ngoài phạm vi báo vụ nếu người học không yêu cầu.\n"
            "- Không bịa thông tin. Nếu không chắc chắn, hãy nói rõ.\n\n"
            "Phong cách giao tiếp:\n"
            "- Thân thiện, tự nhiên như giáo viên đang trực tiếp hướng dẫn học viên.\n"
            "- Trả lời trực tiếp câu hỏi của người dùng.\n"
            "- Không tự thêm tiêu đề, mục lục hoặc nội dung dài nếu không được yêu cầu.\n"
            "- Không viết nội dung website hoặc quảng cáo.\n"
            "- Không biến mọi câu hỏi thành một bài giảng dài.";
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
            formattedPrompt.assign(formattedBuffer.data(),
                static_cast<size_t>(formattedSize));
            }
        }
        }

        if (formattedPrompt.empty()) {
        formattedPrompt =
            "<|im_start|>system\n" + systemPrompt +
            "<|im_end|>\n<|im_start|>user\n" + userPrompt +
            "<|im_end|>\n<|im_start|>assistant\n";
        }

        LOCAL_AI_LOG("generate: formatted prompt length=%zu", formattedPrompt.size());
    const llama_vocab* vocab = llama_model_get_vocab(model);
        const int32_t promptLength = static_cast<int32_t>(formattedPrompt.size());
    int32_t tokenCount = llama_tokenize(
            vocab, formattedPrompt.c_str(), promptLength, nullptr, 0, true, true);

    if (tokenCount < 0) {
        tokenCount = -tokenCount;
    }
    LOCAL_AI_LOG("generate: prompt tokens=%d", tokenCount);

    if (tokenCount == 0) {
        return env->NewStringUTF("");
    }

    std::vector<llama_token> promptTokens(static_cast<size_t>(tokenCount));
    llama_tokenize(
            vocab,
            formattedPrompt.c_str(),
            promptLength,
            promptTokens.data(),
            tokenCount,
            true,
            true);

    llama_context_params contextParams = llama_context_default_params();
        const int tokenLimit = maxTokens > 0 ? maxTokens : 128;
        contextParams.n_ctx = static_cast<uint32_t>(
            std::max<size_t>(512, promptTokens.size() + tokenLimit + 1));
        contextParams.n_batch = static_cast<uint32_t>(
            std::min<size_t>(128, promptTokens.size()));
        const unsigned int cpuThreads = std::thread::hardware_concurrency();
        const int inferenceThreads = static_cast<int>(
            std::clamp(cpuThreads == 0 ? 4u : cpuThreads, 2u, 6u));
        contextParams.n_threads = inferenceThreads;
        contextParams.n_threads_batch = inferenceThreads;
    llama_context* context = llama_init_from_model(model, contextParams);
    if (context == nullptr) {
        LOCAL_AI_LOG("generate: context creation failed");
        return env->NewStringUTF("");
    }
    LOCAL_AI_LOG("generate: context created");

    llama_batch promptBatch = llama_batch_get_one(
            promptTokens.data(), static_cast<int32_t>(promptTokens.size()));
    if (llama_decode(context, promptBatch) != 0) {
        LOCAL_AI_LOG("generate: prompt decode failed");
        llama_free(context);
        return env->NewStringUTF("");
    }
    LOCAL_AI_LOG("generate: prompt decoded");

    llama_sampler* sampler = llama_sampler_init_greedy();
    std::string output;

    for (int i = 0; i < tokenLimit; ++i) {
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
    llama_free(context);
    LOCAL_AI_LOG("generate: finished output bytes=%zu", output.size());
    return env->NewStringUTF(output.c_str());
}

extern "C"
JNIEXPORT jlong JNICALL
Java_com_dnd_ai_LlamaNative_testNative(
        JNIEnv* env,
        jclass clazz
) {
    return 12345;
}
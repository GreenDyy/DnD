package com.dnd.ai;

public class LlamaNative {

    static {
        System.loadLibrary("llama_native");
    }

    public static native long loadModel(String modelPath);

    public static native void freeModel(long modelHandle);

    public static native String generate(
            long modelHandle,
            String systemPrompt,
            String prompt,
            int maxTokens
    );
}

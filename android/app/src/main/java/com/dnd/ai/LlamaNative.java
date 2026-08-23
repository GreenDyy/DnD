package com.dnd.ai;

public class LlamaNative {

    static {
        System.loadLibrary("llama_native");
    }

    public static native long testNative();

    public static native long loadModel(String modelPath);

    public static native void freeModel(long modelHandle);
}

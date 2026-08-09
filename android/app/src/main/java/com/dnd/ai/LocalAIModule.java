package com.dnd.ai;

import android.content.res.AssetManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.IOException;

public class LocalAIModule extends ReactContextBaseJavaModule {

    private static final String MODEL_NAME =
            "Qwen3-1.7B-Q8_0.gguf";

    public LocalAIModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "LocalAI";
    }

    @ReactMethod
    public void checkModel(Promise promise) {

        try {
            AssetManager assetManager =
                    getReactApplicationContext().getAssets();

            String[] files =
                    assetManager.list("models");

            if (files == null) {
                promise.resolve(false);
                return;
            }

            for (String file : files) {

                if (MODEL_NAME.equals(file)) {
                    promise.resolve(true);
                    return;
                }
            }

            promise.resolve(false);

        } catch (IOException e) {

            promise.reject(
                    "MODEL_CHECK_ERROR",
                    e.getMessage(),
                    e
            );
        }
    }
}
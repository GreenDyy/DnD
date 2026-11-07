package com.dnd.ai;

import android.content.res.AssetManager;
import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class LocalAIModule extends ReactContextBaseJavaModule {

    private final AppLogger logger;

    private static final String MODEL_NAME =
            "qwen2.5-1.5b-instruct-q4_k_m.gguf";

    private static final String MODEL_ASSET_PATH =
            "models/" + MODEL_NAME;

    private long modelHandle = 0;

    public LocalAIModule(ReactApplicationContext reactContext) {
        super(reactContext);
        logger = new AppLogger(reactContext, "LocalAI");
    }

    @Override
    public String getName() {
        return "LocalAI";
    }

    @ReactMethod
    public void addListener(String eventName) {
    }

    @ReactMethod
    public void removeListeners(int count) {
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

    @ReactMethod
    public void prepareModel(Promise promise) {
        new Thread(() -> {
            try {
                File modelDir = new File(
                        getReactApplicationContext().getFilesDir(),
                        "models"
                );

                if (!modelDir.exists()) {
                    modelDir.mkdirs();
                }

                File modelFile =
                        new File(modelDir, MODEL_NAME);

                if (modelFile.exists() && modelFile.length() > 0) {
                    promise.resolve(
                            modelFile.getAbsolutePath()
                    );
                    return;
                }

                AssetManager assetManager =
                        getReactApplicationContext().getAssets();

                InputStream inputStream =
                        assetManager.open(MODEL_ASSET_PATH);

                long totalBytes =
                        inputStream.available();

                FileOutputStream outputStream =
                        new FileOutputStream(modelFile);

                byte[] buffer = new byte[1024 * 1024];

                long copiedBytes = 0;
                int bytesRead;

                while ((bytesRead =
                        inputStream.read(buffer)) != -1) {

                    outputStream.write(
                            buffer,
                            0,
                            bytesRead
                    );

                    copiedBytes += bytesRead;

                    int progress = 0;

                    if (totalBytes > 0) {
                        progress = (int)
                                ((copiedBytes * 100) /
                                        totalBytes);
                    }

                    sendProgress(progress);
                }

                outputStream.flush();
                outputStream.close();
                inputStream.close();

                sendProgress(100);

                promise.resolve(
                        modelFile.getAbsolutePath()
                );

            } catch (Exception e) {
                promise.reject(
                        "MODEL_PREPARE_ERROR",
                        e.getMessage(),
                        e
                );
            }
        }).start();
    }

    @ReactMethod
    public void loadModel(String modelPath, Promise promise) {
        try {
            if (modelPath == null || modelPath.isEmpty()) {
                promise.reject(
                        "INVALID_MODEL_PATH",
                        "Model path is empty"
                );
                return;
            }

            if (modelHandle != 0) {
                promise.resolve(true);
                return;
            }

            modelHandle = LlamaNative.loadModel(modelPath);

            if (modelHandle == 0) {
                promise.reject(
                        "MODEL_LOAD_FAILED",
                        "Cannot load model"
                );
                return;
            }

            promise.resolve(true);

        } catch (Exception e) {
            promise.reject(
                    "MODEL_LOAD_ERROR",
                    e.getMessage(),
                    e
            );
        }
    }

    @ReactMethod
    public void warmup(String systemPrompt, Promise promise) {
        if (modelHandle == 0) {
            logger.error("warmup rejected: model is not loaded");
            promise.reject("MODEL_NOT_LOADED", "Load the model before warming up");
            return;
        }

        logger.debug("warmup requested");
        new Thread(() -> {
            try {
                logger.debug("warmup: calling native");
                boolean warmedUp = LlamaNative.warmup(systemPrompt);
                logger.debug("warmup: native returned " + warmedUp);
                if (!warmedUp) {
                    logger.error("warmup failed: native warmup returned false");
                    promise.reject("WARMUP_FAILED", "Cannot cache system prompt");
                    return;
                }
                promise.resolve(true);
            } catch (Exception e) {
                logger.error("warmup failed", e);
                promise.reject("WARMUP_ERROR", e.getMessage(), e);
            }
        }).start();
    }

    @ReactMethod
    public void destroyModel(Promise promise) {
        try {
            if (modelHandle != 0) {
                LlamaNative.freeModel(modelHandle);
                modelHandle = 0;
            }
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject(
                    "MODEL_DESTROY_ERROR",
                    e.getMessage(),
                    e
            );
        }
    }

    @ReactMethod
    public void generate(String systemPrompt, String prompt, int maxTokens, Promise promise) {
        logger.debug("generate requested");
        if (modelHandle == 0) {
            promise.reject("MODEL_NOT_LOADED", "Load the model before generating text");
            return;
        }

        new Thread(() -> {
            try {
                logger.debug("calling native generate");
                String result = LlamaNative.generate(modelHandle, systemPrompt, prompt, maxTokens);
                logger.debug("native generate returned");

                promise.resolve(result);
            } catch (Exception e) {
                logger.error("native generate failed", e);
                promise.reject("GENERATION_ERROR", e.getMessage(), e);
            }
        }).start();
    }

    @ReactMethod
    public void stopGenerate() {
        logger.debug("stopGenerate called");
        LlamaNative.stopGenerate();
    }

    private void sendProgress(int progress) {
        WritableMap params =
                Arguments.createMap();

        params.putInt(
                "progress",
                progress
        );

        new Handler(
                Looper.getMainLooper()
        ).post(() -> {
            getReactApplicationContext()
                    .getJSModule(
                            DeviceEventManagerModule.RCTDeviceEventEmitter.class
                    )
                    .emit(
                            "MODEL_COPY_PROGRESS",
                            params
                    );
        });
    }
}

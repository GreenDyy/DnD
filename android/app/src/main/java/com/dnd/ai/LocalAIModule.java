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

    private static final String MODEL_NAME =
            "Qwen3-1.7B-Q8_0.gguf";

    private static final String MODEL_ASSET_PATH =
            "models/" + MODEL_NAME;

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

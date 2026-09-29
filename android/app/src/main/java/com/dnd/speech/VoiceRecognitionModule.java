package com.dnd.speech;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class VoiceRecognitionModule extends ReactContextBaseJavaModule {
    private static final String TAG = "VoiceRecognitionModule";
    
    private SpeechRecognizer speechRecognizer;
    private boolean isListening = false;
    private Promise currentPromise;

    public VoiceRecognitionModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "VoiceRecognition";
    }

    @ReactMethod
    public void startListening(Promise promise) {
        if (isListening) {
            promise.reject("ALREADY_LISTENING", "Already listening");
            return;
        }

        Context context = getReactApplicationContext();
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            promise.reject("NOT_AVAILABLE", "Speech recognition not available on this device");
            return;
        }

        this.currentPromise = promise;

        SpeechRecognizer recognizer = SpeechRecognizer.createSpeechRecognizer(getReactApplicationContext());
        this.speechRecognizer = recognizer;

        recognizer.setRecognitionListener(new RecognitionListener() {
            @Override
            public void onReadyForSpeech(android.os.Bundle params) {
                isListening = true;
                sendEvent("onSpeechStart", null);
            }

            @Override
            public void onBeginningOfSpeech() {}

            @Override
            public void onRmsChanged(float rmsdB) {}

            @Override
            public void onBufferReceived(byte[] buffer) {}

            @Override
            public void onEndOfSpeech() {
                isListening = false;
            }

            @Override
            public void onError(int errorCode) {
                isListening = false;
                String errorMsg;
                switch (errorCode) {
                    case SpeechRecognizer.ERROR_NETWORK:
                        errorMsg = "Network error";
                        break;
                    case SpeechRecognizer.ERROR_AUDIO:
                        errorMsg = "Audio recording error";
                        break;
                    case SpeechRecognizer.ERROR_SERVER:
                        errorMsg = "Server error";
                        break;
                    case SpeechRecognizer.ERROR_CLIENT:
                        errorMsg = "Client error";
                        break;
                    case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                        errorMsg = "No speech detected";
                        break;
                    case SpeechRecognizer.ERROR_NO_MATCH:
                        errorMsg = "No match found";
                        break;
                    case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                        errorMsg = "Recognizer busy";
                        break;
                    case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                        errorMsg = "Permission denied";
                        break;
                    default:
                        errorMsg = "Unknown error: " + errorCode;
                }
                sendEvent("onSpeechError", createMap("message", errorMsg));
                if (currentPromise != null) {
                    currentPromise.reject("SPEECH_ERROR", errorMsg);
                    currentPromise = null;
                }
            }

            @Override
            public void onResults(android.os.Bundle results) {
                isListening = false;
                ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                String text = (matches != null && !matches.isEmpty()) ? matches.get(0) : "";
                
                Map<String, Object> params = new HashMap<>();
                List<String> valueList = new ArrayList<>();
                valueList.add(text);
                params.put("value", valueList);
                sendEvent("onSpeechRecognized", params);
                sendEvent("onSpeechEnd", null);
                
                if (currentPromise != null) {
                    currentPromise.resolve(text);
                    currentPromise = null;
                }
            }

            @Override
            public void onPartialResults(android.os.Bundle partialResults) {
                ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                String text = (matches != null && !matches.isEmpty()) ? matches.get(0) : "";
                
                Map<String, Object> params = new HashMap<>();
                List<String> valueList = new ArrayList<>();
                valueList.add(text);
                params.put("value", valueList);
                sendEvent("onSpeechPartialResults", params);
            }

            @Override
            public void onEvent(int eventType, android.os.Bundle params) {}
        });

        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toLanguageTag());
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, false);
        }

        try {
            recognizer.startListening(intent);
        } catch (Exception e) {
            isListening = false;
            if (currentPromise != null) {
                currentPromise.reject("START_FAILED", e.getMessage());
                currentPromise = null;
            }
        }
    }

    @ReactMethod
    public void stopListening(Promise promise) {
        if (isListening && speechRecognizer != null) {
            speechRecognizer.stopListening();
            isListening = false;
            promise.resolve(true);
        } else {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void cancelListening(Promise promise) {
        if (speechRecognizer != null) {
            speechRecognizer.cancel();
            isListening = false;
            promise.resolve(true);
        } else {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void isListening(Promise promise) {
        promise.resolve(isListening);
    }

    private void sendEvent(String eventName, @Nullable Map<String, Object> params) {
        getReactApplicationContext()
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
    }

    private Map<String, Object> createMap(String key, Object value) {
        Map<String, Object> map = new HashMap<>();
        map.put(key, value);
        return map;
    }

    @Override
    public void onCatalystInstanceDestroy() {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }
        super.onCatalystInstanceDestroy();
    }
}
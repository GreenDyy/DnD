package com.dnd.ai;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.util.Log;

final class AppLogger {
    private final String tag;
    private final boolean debugBuild;

    AppLogger(Context context, String tag) {
        this.tag = tag;
        this.debugBuild = (context.getApplicationInfo().flags
                & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }

    void debug(String message) {
        if (debugBuild) {
            Log.d(tag, message);
        }
    }

    void error(String message) {
        Log.e(tag, message);
    }

    void error(String message, Throwable error) {
        if (debugBuild) {
            Log.e(tag, message, error);
        } else {
            Log.e(tag, message + " (" + error.getClass().getSimpleName() + ")");
        }
    }
}

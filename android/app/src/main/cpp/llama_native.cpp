#include <jni.h>

extern "C"
JNIEXPORT jlong JNICALL
Java_com_dnd_ai_LlamaNative_testNative(
        JNIEnv* env,
        jclass clazz
) {
    return 12345;
}
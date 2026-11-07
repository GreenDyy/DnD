
cmake_minimum_required(VERSION 3.13)

project(appmodules)

# React Native Android
include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

# ==========================================
# 1. LLAMA.CPP CONFIGURATION
# ==========================================

set(LLAMA_BUILD_COMMON OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_TOOLS OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_SERVER OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_APP OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_UI OFF CACHE BOOL "" FORCE)

# ==========================================
# 2. GGML CPU CONFIGURATION
# ==========================================

# Disable OpenMP
set(GGML_OPENMP OFF CACHE BOOL "" FORCE)

# Disable llamafile backend
set(GGML_LLAMAFILE OFF CACHE BOOL "" FORCE)

# Avoid native CPU auto-optimization
set(GGML_NATIVE OFF CACHE BOOL "" FORCE)

# ==========================================
# 3. ANDROID CPU ARCHITECTURE
# ==========================================

if(ANDROID_ABI STREQUAL "arm64-v8a")

    # ARMv8-A baseline for broad ARM64 compatibility
    set(GGML_CPU_ARM_ARCH "armv8-a" CACHE STRING "" FORCE)
    add_compile_options(
        "$<$<COMPILE_LANGUAGE:C>:-O3>"
        "$<$<COMPILE_LANGUAGE:CXX>:-O3>"
    )

    message(STATUS "GGML CPU architecture: ARMv8-A")
    message(STATUS "Android ABI: ${ANDROID_ABI}")

else()

    # Use default architecture for other ABIs
    set(GGML_CPU_ARM_ARCH "" CACHE STRING "" FORCE)

    message(STATUS "Android ABI: ${ANDROID_ABI}")

endif()

# ==========================================
# 4. INCLUDE LLAMA.CPP
# ==========================================

set(
    LLAMA_CPP_DIR
    "${CMAKE_CURRENT_LIST_DIR}/../../../../../native/llama.cpp"
)

if(EXISTS "${LLAMA_CPP_DIR}/CMakeLists.txt")

    add_subdirectory(
        "${LLAMA_CPP_DIR}"
        llama-build
        EXCLUDE_FROM_ALL
    )

else()

    message(FATAL_ERROR
        "llama.cpp not found at: ${LLAMA_CPP_DIR}"
    )

endif()

# ==========================================
# 5. JNI NATIVE LIBRARY
# ==========================================

if(TARGET llama)

    add_library(
        llama_native
        SHARED
        ../cpp/llama_native.cpp
    )

    find_library(log-lib log)

    target_link_libraries(
        llama_native
        PRIVATE
        llama
        ${log-lib}
    )

    message(STATUS "llama_native configured successfully")

else()

    message(FATAL_ERROR "llama target was not created")

endif()

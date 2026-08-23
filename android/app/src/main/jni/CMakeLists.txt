cmake_minimum_required(VERSION 3.13)

project(appmodules)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

add_library(
        llama_native
        SHARED
        ../cpp/llama_native.cpp
)

find_library(log-lib log)

target_link_libraries(
        llama_native
        ${log-lib}
)
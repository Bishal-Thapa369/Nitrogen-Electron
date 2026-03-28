cmake_minimum_required(VERSION 3.15)
project(nitrogen_editor LANGUAGES C CXX)


set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ---- Performance flags ----
if(NOT MSVC)
    add_compile_options(-O2 -Wall -Wextra -Wpedantic)
else()
    add_compile_options(/O2 /W4)
endif()

# ---- cmake-js integration ----
include_directories(${CMAKE_JS_INC})

# ---- Node-Addon-API headers ----
execute_process(
    COMMAND node -p "require('node-addon-api').include"
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE NODE_ADDON_API_DIR
    OUTPUT_STRIP_TRAILING_WHITESPACE
)
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})


# ---- libvterm sources ----
set(LIBVTERM_DIR ${CMAKE_SOURCE_DIR}/third_party/libvterm)
set(LIBVTERM_SOURCES
    ${LIBVTERM_DIR}/src/encoding.c
    ${LIBVTERM_DIR}/src/keyboard.c
    ${LIBVTERM_DIR}/src/mouse.c
    ${LIBVTERM_DIR}/src/parser.c
    ${LIBVTERM_DIR}/src/pen.c
    ${LIBVTERM_DIR}/src/screen.c
    ${LIBVTERM_DIR}/src/state.c
    ${LIBVTERM_DIR}/src/unicode.c
    ${LIBVTERM_DIR}/src/vterm.c
)

# Suppress legacy warnings from third-party libvterm
set_source_files_properties(${LIBVTERM_SOURCES} PROPERTIES COMPILE_FLAGS "-w")

# ---- Targets ----

# 1. File Explorer Module (Archived/Finalized)
add_library(nitrogen_file_explorer SHARED
    src/core/file_system/file_explorer.cpp
    src/core/bridge/file_explorer_bridge.cpp
)
target_include_directories(nitrogen_file_explorer PRIVATE ${NODE_ADDON_API_DIR})
set_target_properties(nitrogen_file_explorer PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(nitrogen_file_explorer ${CMAKE_JS_LIB})

# 2. Terminal Module (New Implementation)
add_library(nitrogen_terminal SHARED
    ${LIBVTERM_SOURCES}
    src/core/terminal/terminal_session.cpp
    src/core/bridge/terminal_bridge.cpp
)
target_include_directories(nitrogen_terminal PRIVATE ${NODE_ADDON_API_DIR} ${LIBVTERM_DIR}/include)
set_target_properties(nitrogen_terminal PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(nitrogen_terminal ${CMAKE_JS_LIB})

# 3. Search Engine Module (Exhaustive & Multi-threaded)
add_library(nitrogen_search SHARED
    src/core/search/search_engine.cpp
    src/core/bridge/search_bridge.cpp
)
target_include_directories(nitrogen_search PRIVATE ${NODE_ADDON_API_DIR})
set_target_properties(nitrogen_search PROPERTIES PREFIX "" SUFFIX ".node")
target_link_libraries(nitrogen_search ${CMAKE_JS_LIB})

# ---- Platform-specific linking ----
if(UNIX AND NOT APPLE)
    target_link_libraries(nitrogen_file_explorer stdc++fs)
    target_link_libraries(nitrogen_terminal stdc++fs util)
    target_link_libraries(nitrogen_search stdc++fs)
endif()

# NAPI_VERSION 8 for broad Node.js compatibility
target_compile_definitions(nitrogen_file_explorer PRIVATE NAPI_VERSION=8)
target_compile_definitions(nitrogen_terminal PRIVATE NAPI_VERSION=8)
target_compile_definitions(nitrogen_search PRIVATE NAPI_VERSION=8)



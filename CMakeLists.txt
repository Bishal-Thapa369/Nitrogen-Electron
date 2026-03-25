cmake_minimum_required(VERSION 3.15)
project(nitrogen_file_explorer LANGUAGES CXX)

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

# ---- Source files ----
add_library(${PROJECT_NAME} SHARED
    src/core/file_system/file_explorer.cpp
    src/core/bridge/file_explorer_bridge.cpp
)

# ---- Node-Addon-API headers ----
# cmake-js sets CMAKE_JS_INC, but we also need node-addon-api headers
execute_process(
    COMMAND node -p "require('node-addon-api').include"
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE NODE_ADDON_API_DIR
    OUTPUT_STRIP_TRAILING_WHITESPACE
)
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
target_include_directories(${PROJECT_NAME} PRIVATE ${NODE_ADDON_API_DIR})

# ---- Link cmake-js libraries ----
set_target_properties(${PROJECT_NAME} PROPERTIES
    PREFIX ""
    SUFFIX ".node"
)
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})

# ---- Platform-specific filesystem linking ----
if(UNIX AND NOT APPLE)
    target_link_libraries(${PROJECT_NAME} stdc++fs)
endif()

# NAPI_VERSION 8 for broad Node.js compatibility
target_compile_definitions(${PROJECT_NAME} PRIVATE NAPI_VERSION=8)

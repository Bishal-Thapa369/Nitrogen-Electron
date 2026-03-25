#include <napi.h>
#include "../file_system/file_explorer.hpp"
#include <memory>

static std::unique_ptr<nitrogen::core::FileExplorer> g_explorer;

// ---------------------------------------------------------------------------
// Helper: Convert a FileNode tree into a Napi::Object recursively
// ---------------------------------------------------------------------------
static Napi::Object FileNodeToNapi(Napi::Env env, const nitrogen::core::FileNode* node) {
    Napi::Object obj = Napi::Object::New(env);
    obj.Set("name", Napi::String::New(env, node->name));
    obj.Set("path", Napi::String::New(env, node->path));
    obj.Set("isDirectory", Napi::Boolean::New(env, node->isDirectory));
    obj.Set("size", Napi::Number::New(env, static_cast<double>(node->size)));
    obj.Set("isLoaded", Napi::Boolean::New(env, node->isLoaded));

    Napi::Array children = Napi::Array::New(env, node->children.size());
    for (size_t i = 0; i < node->children.size(); ++i) {
        children.Set(static_cast<uint32_t>(i), FileNodeToNapi(env, node->children[i].get()));
    }
    obj.Set("children", children);

    return obj;
}

// ---------------------------------------------------------------------------
// N-API Methods
// ---------------------------------------------------------------------------

// openDirectory(rootPath: string, maxDepth?: number): object
Napi::Value OpenDirectory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected string argument: rootPath").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string rootPath = info[0].As<Napi::String>().Utf8Value();
    int maxDepth = 1;
    if (info.Length() >= 2 && info[1].IsNumber()) {
        maxDepth = info[1].As<Napi::Number>().Int32Value();
    }

    g_explorer = std::make_unique<nitrogen::core::FileExplorer>();

    try {
        g_explorer->openDirectory(rootPath, maxDepth);
    } catch (const std::exception& e) {
        Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
        return env.Null();
    }

    const auto* root = g_explorer->getRoot();
    if (!root) return env.Null();

    return FileNodeToNapi(env, root);
}

// expandDirectory(dirPath: string, maxDepth?: number): object | null
Napi::Value ExpandDirectory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!g_explorer) {
        Napi::Error::New(env, "No directory is open. Call openDirectory first.").ThrowAsJavaScriptException();
        return env.Null();
    }
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected string argument: dirPath").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string dirPath = info[0].As<Napi::String>().Utf8Value();
    int maxDepth = 1;
    if (info.Length() >= 2 && info[1].IsNumber()) {
        maxDepth = info[1].As<Napi::Number>().Int32Value();
    }

    g_explorer->expandDirectory(dirPath, maxDepth);

    const auto* node = g_explorer->findNode(dirPath);
    if (!node) return env.Null();

    return FileNodeToNapi(env, node);
}

// collapseDirectory(dirPath: string): void
Napi::Value CollapseDirectory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!g_explorer) return env.Undefined();
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected string argument: dirPath").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string dirPath = info[0].As<Napi::String>().Utf8Value();
    g_explorer->collapseDirectory(dirPath);
    return env.Undefined();
}

// refreshDirectory(dirPath: string): object | null
Napi::Value RefreshDirectory(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!g_explorer) {
        Napi::Error::New(env, "No directory is open. Call openDirectory first.").ThrowAsJavaScriptException();
        return env.Null();
    }
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected string argument: dirPath").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string dirPath = info[0].As<Napi::String>().Utf8Value();
    g_explorer->refreshDirectory(dirPath);

    const auto* node = g_explorer->findNode(dirPath);
    if (!node) return env.Null();

    return FileNodeToNapi(env, node);
}

// getTree(): object | null
Napi::Value GetTree(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!g_explorer) return env.Null();

    const auto* root = g_explorer->getRoot();
    if (!root) return env.Null();

    return FileNodeToNapi(env, root);
}

// ---------------------------------------------------------------------------
// Module Registration
// ---------------------------------------------------------------------------
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("openDirectory", Napi::Function::New(env, OpenDirectory));
    exports.Set("expandDirectory", Napi::Function::New(env, ExpandDirectory));
    exports.Set("collapseDirectory", Napi::Function::New(env, CollapseDirectory));
    exports.Set("refreshDirectory", Napi::Function::New(env, RefreshDirectory));
    exports.Set("getTree", Napi::Function::New(env, GetTree));
    return exports;
}

NODE_API_MODULE(nitrogen_file_explorer, Init)

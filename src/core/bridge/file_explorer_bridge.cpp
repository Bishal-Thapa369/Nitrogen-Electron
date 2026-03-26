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
    obj.Set("typeId", Napi::Number::New(env, static_cast<double>(node->typeId)));

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

// getExtensions(): { [id: number]: string }
Napi::Value GetExtensions(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!g_explorer) return Napi::Object::New(env); // Return empty object

    const auto& extMap = g_explorer->getExtensionMap();
    Napi::Object obj = Napi::Object::New(env);

    for (const auto& [ext, id] : extMap) {
        obj.Set(std::to_string(id), Napi::String::New(env, ext));
    }

    return obj;
}

// deleteItem(targetPath: string): boolean
Napi::Value DeleteItemAsync(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!g_explorer) {
        Napi::Error::New(env, "No directory is open.").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected string argument: targetPath").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    std::string targetPath = info[0].As<Napi::String>().Utf8Value();
    
    // We don't bother with a JS callback here yet; 
    // the UI will refresh manually or after this returns.
    g_explorer->deleteItemAsync(targetPath);

    return Napi::Boolean::New(env, true);
}

// deleteItemsBulk(targetPaths: string[]): boolean
Napi::Value DeleteItemsBulk(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!g_explorer) {
        Napi::Error::New(env, "No directory is open.").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }
    if (info.Length() < 1 || !info[0].IsArray()) {
        Napi::TypeError::New(env, "Expected array argument: targetPaths").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    Napi::Array pathsArray = info[0].As<Napi::Array>();
    std::vector<std::string> paths;
    paths.reserve(pathsArray.Length());

    for (uint32_t i = 0; i < pathsArray.Length(); ++i) {
        Napi::Value val = pathsArray[i];
        if (val.IsString()) {
            paths.push_back(val.As<Napi::String>().Utf8Value());
        }
    }
    
    // Trigger bulk atomic hide and background deletion
    g_explorer->deleteBulkAsync(paths);

    return Napi::Boolean::New(env, true);
}

Napi::Value UnmarkForDeletionBulk(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!g_explorer) {
        Napi::Error::New(env, "No directory is open.").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }
    if (info.Length() < 1 || !info[0].IsArray()) {
        return Napi::Boolean::New(env, false);
    }

    Napi::Array pathsArray = info[0].As<Napi::Array>();
    std::vector<std::string> paths;
    paths.reserve(pathsArray.Length());

    for (uint32_t i = 0; i < pathsArray.Length(); ++i) {
        Napi::Value val = pathsArray[i];
        if (val.IsString()) {
            paths.push_back(val.As<Napi::String>().Utf8Value());
        }
    }
    
    g_explorer->unmarkForDeletionBulk(paths);
    return Napi::Boolean::New(env, true);
}

Napi::Value ClearDeletionBlacklist(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (g_explorer) {
        g_explorer->clearDeletionBlacklist();
    }
    return Napi::Boolean::New(env, true);
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
    exports.Set("getExtensions", Napi::Function::New(env, GetExtensions));
    exports.Set("deleteItemAsync", Napi::Function::New(env, DeleteItemAsync));
    exports.Set("deleteItemsBulk", Napi::Function::New(env, DeleteItemsBulk));
    exports.Set("unmarkForDeletionBulk", Napi::Function::New(env, UnmarkForDeletionBulk));
    exports.Set("clearDeletionBlacklist", Napi::Function::New(env, ClearDeletionBlacklist));
    return exports;
}

NODE_API_MODULE(nitrogen_file_explorer, Init)

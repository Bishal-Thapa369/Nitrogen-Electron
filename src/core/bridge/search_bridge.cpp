#include <napi.h>
#include "../search/search_engine.hpp"
#include <string>
#include <vector>

using namespace Napi;

class SearchWorker : public AsyncWorker {
public:
    SearchWorker(Function& callback, std::string query, std::string rootPath)
        : AsyncWorker(callback), query(query), rootPath(rootPath) {}

    void Execute() override {
        try {
            nitrogen::SearchEngine engine;
            results = engine.searchAll(query, rootPath);
        } catch (const std::exception& e) {
            SetError(e.what());
        }
    }

    void OnOK() override {
        HandleScope scope(Env());
        Array jsResults = Array::New(Env(), results.size());

        for (size_t i = 0; i < results.size(); ++i) {
            Object obj = Object::New(Env());
            obj.Set("path", results[i].path);
            obj.Set("fileName", results[i].fileName);
            obj.Set("line", results[i].line);
            obj.Set("context", results[i].context);
            jsResults[i] = obj;
        }

        Callback().Call({Env().Null(), jsResults});
    }

private:
    std::string query;
    std::string rootPath;
    std::vector<nitrogen::SearchResult> results;
};

Value SearchAsync(const CallbackInfo& info) {
    Env env = info.Env();

    if (info.Length() < 3 || !info[0].IsString() || !info[1].IsString() || !info[2].IsFunction()) {
        TypeError::New(env, "Expected (query, rootPath, callback)").ThrowAsJavaScriptException();
        return env.Null();
    }

    std::string query = info[0].As<String>().Utf8Value();
    std::string rootPath = info[1].As<String>().Utf8Value();
    Function callback = info[2].As<Function>();

    SearchWorker* worker = new SearchWorker(callback, query, rootPath);
    worker->Queue();

    return env.Null();
}

Object Init(Env env, Object exports) {
    exports.Set(String::New(env, "searchAsync"), Function::New(env, SearchAsync));
    return exports;
}

NODE_API_MODULE(nitrogen_search, Init)

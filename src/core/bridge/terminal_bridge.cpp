#include <napi.h>
#include "../terminal/terminal_session.hpp"
#include <map>
#include <memory>
#include <mutex>

namespace nitrogen {

static int nextId = 0;
static std::map<int, std::shared_ptr<TerminalSession>> sessions;
static std::map<int, Napi::ThreadSafeFunction> callbacks;

static Napi::Value Spawn(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    int rows = info[0].As<Napi::Number>().Int32Value();
    int cols = info[1].As<Napi::Number>().Int32Value();
    std::string shell = info[2].As<Napi::String>().Utf8Value();
    Napi::Function cb = info[3].As<Napi::Function>();

    int id = nextId++;
    
    // Create ThreadSafeFunction
    auto tsfn = Napi::ThreadSafeFunction::New(
        env,
        cb,
        "TerminalDataCallback",
        0,
        1
    );

    auto session = std::make_shared<TerminalSession>(rows, cols);
    
    // Set callback to push data through TSFN
    session->setOnData([tsfn](const std::string& data) {
        auto callback = [data](Napi::Env env, Napi::Function jsCallback) {
            jsCallback.Call({Napi::String::New(env, data)});
        };
        tsfn.BlockingCall(callback);
    });

    if (!session->spawn(shell)) {
        tsfn.Release();
        Napi::TypeError::New(env, "Failed to spawn shell").ThrowAsJavaScriptException();
        return env.Null();
    }

    sessions[id] = session;
    callbacks[id] = tsfn;
    
    return Napi::Number::New(env, id);
}

static Napi::Value Write(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    int id = info[0].As<Napi::Number>().Int32Value();
    std::string data = info[1].As<Napi::String>().Utf8Value();

    auto it = sessions.find(id);
    if (it != sessions.end()) {
        it->second->write(data);
    }
    return env.Undefined();
}

static Napi::Value Resize(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    int id = info[0].As<Napi::Number>().Int32Value();
    int rows = info[1].As<Napi::Number>().Int32Value();
    int cols = info[2].As<Napi::Number>().Int32Value();

    auto it = sessions.find(id);
    if (it != sessions.end()) {
        it->second->resize(rows, cols);
    }
    return env.Undefined();
}

static Napi::Value Kill(const Napi::CallbackInfo& info) {

    Napi::Env env = info.Env();
    int id = info[0].As<Napi::Number>().Int32Value();

    auto it = sessions.find(id);
    if (it != sessions.end()) {
        sessions.erase(it);
    }
    auto cbIt = callbacks.find(id);
    if (cbIt != callbacks.end()) {
        cbIt->second.Release();
        callbacks.erase(cbIt);
    }
    return env.Undefined();
}

Napi::Object InitInternal(Napi::Env env, Napi::Object exports) {
    exports.Set("spawn", Napi::Function::New(env, Spawn));
    exports.Set("write", Napi::Function::New(env, Write));
    exports.Set("resize", Napi::Function::New(env, Resize));
    exports.Set("kill", Napi::Function::New(env, Kill));
    return exports;
}


} // namespace nitrogen

Napi::Object InitTerminal(Napi::Env env, Napi::Object exports) {
    return nitrogen::InitInternal(env, exports);
}

NODE_API_MODULE(nitrogen_terminal, InitTerminal)




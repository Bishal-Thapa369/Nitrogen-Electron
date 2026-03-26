#pragma once

#include <string>
#include <vector>
#include <thread>
#include <mutex>
#include <functional>
#include <vterm.h>

namespace nitrogen {

struct TerminalCell {
    uint32_t chars[VTERM_MAX_CHARS_PER_CELL];
    uint8_t width;
    bool bold;
    bool underline;
    bool italic;
    bool blink;
    bool reverse;
    bool conceal;
    bool strike;
    VTermColor fg;
    VTermColor bg;
};

class TerminalSession {
public:
    TerminalSession(int rows, int cols);
    ~TerminalSession();

    bool spawn(const std::string& shell);
    void write(const std::string& data);
    void resize(int rows, int cols);

    using DataCallback = std::function<void(const std::string&)>;
    void setOnData(DataCallback cb) { onData = cb; }

    // Get a snapshot of the screen for the UI
    std::vector<TerminalCell> getScreenSnapshot();

private:
    void readLoop();
    void setupVTerm();

    int rows;
    int cols;
    int masterFd;
    pid_t childPid;
    
    VTerm* vt;
    VTermScreen* vts;
    
    std::thread readThread;
    bool running;
    std::mutex vtMutex;
    
    DataCallback onData;
};

} // namespace nitrogen

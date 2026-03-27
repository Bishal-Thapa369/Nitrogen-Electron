#include "terminal_session.hpp"
#include <unistd.h>
#include <pty.h>
#include <sys/wait.h>
#include <fcntl.h>
#include <iostream>
#include <vector>

namespace nitrogen {

// libvterm callbacks
static int screen_damage(VTermRect rect, void *user) {
    (void)rect;
    (void)user;
    return 1;
}

static int screen_bell(void *user) {
    (void)user;
    return 1;
}


static VTermScreenCallbacks screen_callbacks = {
    screen_damage,   /* damage */
    nullptr,         /* moverect */
    nullptr,         /* movecursor */
    nullptr,         /* settermprop */
    screen_bell,     /* bell */
    nullptr,         /* resize */
    nullptr,         /* sb_pushline */
    nullptr,         /* sb_popline */
    nullptr,         /* sb_clear */
    nullptr,         /* sb_pushline4 */
};


TerminalSession::TerminalSession(int rows, int cols)
    : rows(rows), cols(cols), masterFd(-1), childPid(-1), vt(nullptr), vts(nullptr), running(false) {
    setupVTerm();
}

TerminalSession::~TerminalSession() {
    running = false;
    if (readThread.joinable()) {
        readThread.detach(); // Or properly signal shutdown
    }
    if (masterFd != -1) {
        close(masterFd);
    }
    if (childPid != -1) {
        kill(childPid, SIGTERM);
        waitpid(childPid, nullptr, 0);
    }
    if (vt) {
        vterm_free(vt);
    }
}

void TerminalSession::setupVTerm() {
    vt = vterm_new(rows, cols);
    vterm_set_utf8(vt, 1);
    vts = vterm_obtain_screen(vt);
    vterm_screen_set_callbacks(vts, &screen_callbacks, this);
    vterm_screen_reset(vts, 1);
}

bool TerminalSession::spawn(const std::string& shell) {
    struct winsize ws = { (unsigned short)rows, (unsigned short)cols, 0, 0 };
    
    childPid = forkpty(&masterFd, nullptr, nullptr, &ws);
    
    if (childPid < 0) {
        return false;
    }
    
    if (childPid == 0) {
        // Child process
        setenv("TERM", "xterm-256color", 1);
        execl(shell.c_str(), shell.c_str(), nullptr);
        _exit(1);
    }
    
    // Parent process
    // Set non-blocking
    int flags = fcntl(masterFd, F_GETFL, 0);
    fcntl(masterFd, F_SETFL, flags | O_NONBLOCK);
    
    running = true;
    readThread = std::thread(&TerminalSession::readLoop, this);
    
    return true;
}

void TerminalSession::write(const std::string& data) {
    if (masterFd != -1) {
        ::write(masterFd, data.c_str(), data.length());
    }
}

void TerminalSession::resize(int newRows, int newCols) {
    std::lock_guard<std::mutex> lock(vtMutex);
    rows = newRows;
    cols = newCols;
    
    vterm_set_size(vt, rows, cols);
    
    struct winsize ws = { (unsigned short)rows, (unsigned short)cols, 0, 0 };
    ioctl(masterFd, TIOCSWINSZ, &ws);
}

void TerminalSession::readLoop() {
    char buffer[4096];
    while (running) {
        ssize_t n = read(masterFd, buffer, sizeof(buffer));
        if (n > 0) {
            std::lock_guard<std::mutex> lock(vtMutex);
            vterm_input_write(vt, buffer, n);
            
            if (onData) {
                onData(std::string(buffer, n));
            }
        } else if (n < 0) {
            if (errno == EAGAIN || errno == EINTR) {
                usleep(10000); // 10ms sleep to avoid spinning
                continue;
            }
            break; // Error or closed
        } else {
            break; // EOF
        }
    }
}

std::vector<TerminalCell> TerminalSession::getScreenSnapshot() {
    std::lock_guard<std::mutex> lock(vtMutex);
    std::vector<TerminalCell> cells;
    cells.reserve(rows * cols);
    
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            VTermPos pos = { r, c };
            VTermScreenCell vCell;
            vterm_screen_get_cell(vts, pos, &vCell);
            
            TerminalCell tc;
            for (int i = 0; i < VTERM_MAX_CHARS_PER_CELL; ++i) {
                tc.chars[i] = vCell.chars[i];
            }
            tc.width = vCell.width;
            tc.bold = vCell.attrs.bold;
            tc.underline = vCell.attrs.underline;
            tc.italic = vCell.attrs.italic;
            tc.blink = vCell.attrs.blink;
            tc.reverse = vCell.attrs.reverse;
            tc.conceal = vCell.attrs.conceal;
            tc.strike = vCell.attrs.strike;
            tc.fg = vCell.fg;
            tc.bg = vCell.bg;
            
            cells.push_back(tc);
        }
    }
    return cells;
}

} // namespace nitrogen

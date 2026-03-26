#include "file_explorer.hpp"
#include <filesystem>
#include <stdexcept>
#include <thread>
#include <mutex>
#include <functional>
#include <unordered_map>

namespace fs = std::filesystem;

namespace nitrogen::core {

FileExplorer::FileExplorer() = default;

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

void FileExplorer::openDirectory(const std::string& rootPath, int maxDepth) {
    fs::path p(rootPath);

    if (!fs::exists(p) || !fs::is_directory(p)) {
        throw std::runtime_error("FileExplorer::openDirectory: path does not exist or is not a directory: " + rootPath);
    }

    m_root = std::make_unique<FileNode>(p.filename().string(), rootPath, true, 1);
    scanDirectory(m_root.get(), 0, maxDepth);
    m_root->isLoaded = true;
}

void FileExplorer::expandDirectory(const std::string& dirPath, int maxDepth) {
    FileNode* node = findNodeMutable(m_root.get(), dirPath);
    if (!node || !node->isDirectory) return;
    if (node->isLoaded) return; // Already expanded

    scanDirectory(node, 0, maxDepth);
    node->isLoaded = true;
}

void FileExplorer::collapseDirectory(const std::string& dirPath) {
    FileNode* node = findNodeMutable(m_root.get(), dirPath);
    if (!node || !node->isDirectory) return;

    node->children.clear();
    node->isLoaded = false;
}

void FileExplorer::refreshDirectory(const std::string& dirPath) {
    FileNode* node = findNodeMutable(m_root.get(), dirPath);
    if (!node || !node->isDirectory) return;

    // Clear existing children and re-scan
    node->children.clear();
    node->isLoaded = false;
    scanDirectory(node, 0, 1);
    node->isLoaded = true;
}

void FileExplorer::markForDeletion(const std::string& path) {
    std::lock_guard<std::mutex> lock(m_blacklistMutex);
    m_blacklistedPaths.insert(path);
}

void FileExplorer::markForDeletionBulk(const std::vector<std::string>& paths) {
    std::lock_guard<std::mutex> lock(m_blacklistMutex);
    for (const auto& p : paths) {
        m_blacklistedPaths.insert(p);
    }
}

void FileExplorer::deleteBulkAsync(const std::vector<std::string>& paths, std::function<void(bool)> onComplete) {
    // 1. Mark for instant-hide (Bulk)
    markForDeletionBulk(paths);

    // 2. Launch target background thread
    std::thread([this, paths, onComplete]() {
        bool allSuccess = true;
        size_t processedCount = 0;

        for (const auto& path : paths) {
            try {
                std::error_code ec;
                if (fs::exists(path, ec)) {
                    fs::remove_all(path, ec);
                    if (ec) allSuccess = false;
                }
            } catch (...) {
                allSuccess = false;
            }

            processedCount++;

            // Batch-Cleanup: Optional: every 100 files, we could remove from blacklist
            // to show progress, but since we are doing 1 UI refresh, we keep them blacklisted
            // until the end of the whole block for safety.
        }

        // 3. Final Cleanup: Remove all from blacklist
        {
            std::lock_guard<std::mutex> lock(m_blacklistMutex);
            for (const auto& p : paths) {
                m_blacklistedPaths.erase(p);
            }
        }

        if (onComplete) {
            onComplete(allSuccess);
        }
    }).detach();
}

void FileExplorer::deleteItemAsync(const std::string& path, std::function<void(bool)> onComplete) {
    // 1. Mark for instant-hide
    markForDeletion(path);

    // 2. Launch background thread for physical disk removal
    std::thread([this, path, onComplete]() {
        bool success = false;
        try {
            std::error_code ec;
            if (fs::exists(path, ec)) {
                fs::remove_all(path, ec);
                success = !ec;
            } else {
                success = true; // Already gone
            }
        } catch (...) {
            success = false;
        }

        // 3. Cleanup: Remove from blacklist after disk operation is finished
        {
            std::lock_guard<std::mutex> lock(m_blacklistMutex);
            m_blacklistedPaths.erase(path);
        }

        if (onComplete) {
            onComplete(success);
        }
    }).detach(); // Detach so the explorer doesn't need to join the thread
}

// ---------------------------------------------------------------------------
// Query API
// ---------------------------------------------------------------------------

const FileNode* FileExplorer::getRoot() const {
    return m_root.get();
}

const FileNode* FileExplorer::findNode(const std::string& path) const {
    return findNodeMutable(m_root.get(), path);
}

const std::unordered_map<std::string, uint16_t>& FileExplorer::getExtensionMap() const {
    return m_extensionMap;
}

// ---------------------------------------------------------------------------
// Internal Implementation
// ---------------------------------------------------------------------------

uint16_t FileExplorer::registerExtension(const std::string& name, bool isDir) {
    if (isDir) return 1;
    
    auto dotPos = name.find_last_of('.');
    if (dotPos == std::string::npos || dotPos == 0 || dotPos == name.length() - 1) {
        return 0; // Unknown / no extension
    }
    
    std::string ext = name.substr(dotPos + 1);
    // Convert to lowercase
    for(auto& c : ext) c = std::tolower(c);

    auto it = m_extensionMap.find(ext);
    if (it != m_extensionMap.end()) {
        return it->second;
    }
    
    uint16_t newId = m_nextExtensionId++;
    m_extensionMap[ext] = newId;
    return newId;
}

void FileExplorer::scanDirectory(FileNode* node, int currentDepth, int maxDepth) {
    if (currentDepth >= maxDepth) return;

    std::error_code ec;
    auto it = fs::directory_iterator(node->path, fs::directory_options::skip_permission_denied, ec);
    if (ec) return; // Silently skip directories we can't read

    for (const auto& entry : it) {
        std::error_code entryEc;
        const auto& entryPath = entry.path();
        const std::string pathStr = entryPath.string();

        // --- FILTER: Skip blacklisted paths ---
        {
            std::lock_guard<std::mutex> lock(m_blacklistMutex);
            if (m_blacklistedPaths.find(pathStr) != m_blacklistedPaths.end()) {
                continue;
            }
        }

        const bool isDir = entry.is_directory(entryEc);
        if (entryEc) continue; // Skip entries we can't stat

        uint64_t fileSize = 0;
        if (!isDir) {
            fileSize = static_cast<uint64_t>(entry.file_size(entryEc));
            if (entryEc) fileSize = 0;
        }

        uint16_t typeId = registerExtension(entryPath.filename().string(), isDir);

        auto child = std::make_unique<FileNode>(
            entryPath.filename().string(),
            entryPath.string(),
            isDir,
            typeId,
            fileSize
        );

        // Recursively scan sub-directories if within depth limit
        if (isDir) {
            scanDirectory(child.get(), currentDepth + 1, maxDepth);
            if (currentDepth + 1 < maxDepth) {
                child->isLoaded = true;
            }
        }

        node->children.push_back(std::move(child));
    }

    // Sort after all children are added (one sort pass, not per-insert)
    node->sortChildren();
}

FileNode* FileExplorer::findNodeMutable(FileNode* node, const std::string& path) const {
    if (!node) return nullptr;
    if (node->path == path) return node;

    for (auto& child : node->children) {
        // Optimization: only recurse into directories whose path is a prefix of the target
        if (child->isDirectory && path.rfind(child->path, 0) == 0) {
            FileNode* found = findNodeMutable(child.get(), path);
            if (found) return found;
        }
    }
    return nullptr;
}

} // namespace nitrogen::core

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
    
    // Capture snapshot once at start of scan
    std::unordered_set<std::string> snapshot;
    {
        std::lock_guard<std::mutex> lock(m_blacklistMutex);
        snapshot = m_blacklistedPaths;
    }

    scanDirectory(m_root.get(), 0, maxDepth, &snapshot);
    m_root->isLoaded = true;
}

void FileExplorer::expandDirectory(const std::string& dirPath, int maxDepth) {
    FileNode* node = findNodeMutable(m_root.get(), dirPath);
    if (!node || !node->isDirectory) return;
    if (node->isLoaded) return; // Already expanded

    // Capture snapshot for the sub-scan
    std::unordered_set<std::string> snapshot;
    {
        std::lock_guard<std::mutex> lock(m_blacklistMutex);
        snapshot = m_blacklistedPaths;
    }

    scanDirectory(node, 0, maxDepth, &snapshot);
    node->isLoaded = true;
}

void FileExplorer::collapseDirectory(const std::string& dirPath) {
    FileNode* node = findNodeMutable(m_root.get(), dirPath);
    if (!node || !node->isDirectory) return;

    node->children.clear();
    node->isLoaded = false;
}

void FileExplorer::refreshDirectory(const std::string& dirPath, bool force) {
    FileNode* node = findNodeMutable(m_root.get(), dirPath);
    if (!node || !node->isDirectory) return;

    // Clear existing children and re-scan
    node->children.clear();
    node->isLoaded = false;
    
    if (force) {
        // Absolute Scan: Ignore the blacklist entirely
        scanDirectory(node, 0, 1, nullptr);
    } else {
        // Standard Scan: Respect the blacklist using a snapshot
        std::unordered_set<std::string> snapshot;
        {
            std::lock_guard<std::mutex> lock(m_blacklistMutex);
            snapshot = m_blacklistedPaths;
        }
        scanDirectory(node, 0, 1, &snapshot);
    }
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

void FileExplorer::unmarkForDeletionBulk(const std::vector<std::string>& paths) {
    std::lock_guard<std::mutex> lock(m_blacklistMutex);
    for (const auto& p : paths) {
        m_blacklistedPaths.erase(p);
    }
}

void FileExplorer::clearDeletionBlacklist() {
    std::lock_guard<std::mutex> lock(m_blacklistMutex);
    m_blacklistedPaths.clear();
}

void FileExplorer::deleteBulkAsync(const std::vector<std::string>& paths, std::function<void(bool)> onComplete) {
    // We only handle the "Instant Hide" logic in C++. 
    // Physical trashing is now handled by Electron's safe Shell API.
    markForDeletionBulk(paths);
    
    if (onComplete) {
        onComplete(true);
    }
}

void FileExplorer::deleteItemAsync(const std::string& path, std::function<void(bool)> onComplete) {
    // We only handle the "Instant Hide" logic in C++. 
    // Physical trashing is now handled by Electron's safe Shell API.
    markForDeletion(path);

    if (onComplete) {
        onComplete(true);
    }
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

void FileExplorer::scanDirectory(FileNode* node, int currentDepth, int maxDepth, const std::unordered_set<std::string>* snapshot) {
    if (currentDepth >= maxDepth) return;

    std::error_code ec;
    auto it = fs::directory_iterator(node->path, fs::directory_options::skip_permission_denied, ec);
    if (ec) return; // Silently skip directories we can't read

    // Use snapshot if provided, otherwise capture one (for safety/convenience in unexpected calls)
    std::unordered_set<std::string> localSnapshot;
    const std::unordered_set<std::string>* targetSnapshot = snapshot;
    if (!targetSnapshot) {
        std::lock_guard<std::mutex> lock(m_blacklistMutex);
        localSnapshot = m_blacklistedPaths;
        targetSnapshot = &localSnapshot;
    }

    for (const auto& entry : it) {
        std::error_code entryEc;
        const auto& entryPath = entry.path();
        const std::string pathStr = entryPath.string();

        // --- FILTER: Skip blacklisted paths using the snapshot (O(1) lookup, ZERO Locks!) ---
        if (targetSnapshot->find(pathStr) != targetSnapshot->end()) {
            continue;
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
            scanDirectory(child.get(), currentDepth + 1, maxDepth, targetSnapshot);
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

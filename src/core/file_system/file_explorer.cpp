#include "file_explorer.hpp"
#include <filesystem>
#include <stdexcept>

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

    m_root = std::make_unique<FileNode>(p.filename().string(), rootPath, true);
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

// ---------------------------------------------------------------------------
// Query API
// ---------------------------------------------------------------------------

const FileNode* FileExplorer::getRoot() const {
    return m_root.get();
}

const FileNode* FileExplorer::findNode(const std::string& path) const {
    return findNodeMutable(m_root.get(), path);
}

// ---------------------------------------------------------------------------
// Internal Implementation
// ---------------------------------------------------------------------------

void FileExplorer::scanDirectory(FileNode* node, int currentDepth, int maxDepth) {
    if (currentDepth >= maxDepth) return;

    std::error_code ec;
    auto it = fs::directory_iterator(node->path, fs::directory_options::skip_permission_denied, ec);
    if (ec) return; // Silently skip directories we can't read

    for (const auto& entry : it) {
        std::error_code entryEc;
        const auto& entryPath = entry.path();
        const bool isDir = entry.is_directory(entryEc);
        if (entryEc) continue; // Skip entries we can't stat

        uint64_t fileSize = 0;
        if (!isDir) {
            fileSize = static_cast<uint64_t>(entry.file_size(entryEc));
            if (entryEc) fileSize = 0;
        }

        auto child = std::make_unique<FileNode>(
            entryPath.filename().string(),
            entryPath.string(),
            isDir,
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

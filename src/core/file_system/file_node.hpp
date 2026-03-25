#pragma once

#include <string>
#include <vector>
#include <memory>
#include <cstdint>
#include <algorithm>

namespace nitrogen::core {

/**
 * @struct FileNode
 * @brief Represents a single node (file or directory) in the file system tree.
 *
 * Uses a flat vector of children for O(1) index access.
 * Children are sorted: directories first, then files, both alphabetically.
 */
struct FileNode {
    std::string name;
    std::string path;        // Absolute path on disk
    bool isDirectory;
    uint64_t size;           // File size in bytes (0 for directories)
    bool isLoaded;           // Whether children have been scanned (directories only)

    std::vector<std::unique_ptr<FileNode>> children;

    FileNode(std::string name, std::string path, bool isDir, uint64_t size = 0)
        : name(std::move(name))
        , path(std::move(path))
        , isDirectory(isDir)
        , size(size)
        , isLoaded(false) {}

    // Sort children: directories first (alphabetical), then files (alphabetical)
    void sortChildren() {
        std::sort(children.begin(), children.end(),
            [](const std::unique_ptr<FileNode>& a, const std::unique_ptr<FileNode>& b) {
                if (a->isDirectory != b->isDirectory) {
                    return a->isDirectory > b->isDirectory; // dirs first
                }
                return a->name < b->name; // alphabetical
            }
        );
    }

    // Find a direct child by name. Returns nullptr if not found.
    FileNode* findChild(const std::string& childName) const {
        for (const auto& child : children) {
            if (child->name == childName) return child.get();
        }
        return nullptr;
    }
};

} // namespace nitrogen::core

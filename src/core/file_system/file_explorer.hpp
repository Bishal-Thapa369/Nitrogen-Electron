#pragma once

#include "file_node.hpp"
#include <string>
#include <functional>
#include <unordered_map>
#include <unordered_set>
#include <mutex>

namespace nitrogen::core {

/**
 * @class FileExplorer
 * @brief High-performance file system scanner and tree manager.
 *
 * Scans directories using std::filesystem and builds a FileNode tree.
 * Supports depth-limited scanning for lazy-loading and immediate UI feedback.
 */
class FileExplorer {
public:
    explicit FileExplorer();
    ~FileExplorer() = default;

    // --- Core API ---

    /**
     * @brief Open a root directory and scan it to a specified depth.
     * @param rootPath Absolute path to the directory to open.
     * @param maxDepth Maximum depth to scan. 0 = root only, 1 = immediate children, etc.
     */
    void openDirectory(const std::string& rootPath, int maxDepth = 1);

    /**
     * @brief Expand a specific directory node by scanning its children.
     *        This is the lazy-loading entry point.
     * @param dirPath Absolute path of the directory to expand.
     * @param maxDepth Maximum depth of children to scan from this point.
     */
    void expandDirectory(const std::string& dirPath, int maxDepth = 1);

    /**
     * @brief Collapse a directory by releasing its children from memory.
     * @param dirPath Absolute path of the directory to collapse.
     */
    void collapseDirectory(const std::string& dirPath);

    /**
     * @brief Refresh a specific directory by re-scanning its contents.
     * @param dirPath Absolute path of the directory to refresh.
     * @param force If true, ignores the deletion blacklist and performs an absolute scan.
     */
    void refreshDirectory(const std::string& dirPath, bool force = false);

    // --- Query API ---

    /**
     * @brief Get the root node of the file tree.
     * @return Const pointer to the root FileNode, or nullptr if no directory is open.
     */
    const FileNode* getRoot() const;

    /**
     * @brief Find a node by its absolute path.
     * @param path Absolute path to search for.
     * @return Const pointer to the FileNode, or nullptr if not found.
     */
    const FileNode* findNode(const std::string& path) const;

    /**
     * @brief Mark a path as "being deleted" so it's instantly hidden from scans.
     * @param path Absolute path to hide.
     */
    void markForDeletion(const std::string& path);

     /**
     * @brief Mark multiple paths as "being deleted" atomically.
     * @param paths List of absolute paths to hide.
     */
    void markForDeletionBulk(const std::vector<std::string>& paths);

    /**
     * @brief Clear the deletion flag for multiple paths, making them visible again.
     * @param paths List of absolute paths to restore.
     */
    void unmarkForDeletionBulk(const std::vector<std::string>& paths);

    /**
     * @brief Completely clear the deletion blacklist.
     */
    void clearDeletionBlacklist();

    /**
     * @brief Physically delete multiple files or directories from the disk in a single background thread.
     * @param paths List of absolute paths to delete.
     * @param onComplete Optional callback when ALL deletions finish.
     */
    void deleteBulkAsync(const std::vector<std::string>& paths, std::function<void(bool)> onComplete = nullptr);

    /**
     * @brief Physically delete a file or directory from the disk in a background thread.
     * @param path Absolute path to delete.
     * @param onComplete Optional callback when the deletion finishes.
     */
    void deleteItemAsync(const std::string& path, std::function<void(bool)> onComplete = nullptr);

    /**
     * @brief Get the dynamic extension mapping generated during scan.
     * @return Const reference to the extension map (string -> id).
     */
    const std::unordered_map<std::string, uint16_t>& getExtensionMap() const;

private:
    std::unique_ptr<FileNode> m_root;
    
    std::unordered_set<std::string> m_blacklistedPaths;
    mutable std::mutex m_blacklistMutex;

    std::unordered_map<std::string, uint16_t> m_extensionMap;
    uint16_t m_nextExtensionId = 2; // 0 = unknown, 1 = folder

    uint16_t registerExtension(const std::string& name, bool isDir);

    /**
     * @brief Internal recursive scanner.
     * @param node The parent node to scan children into.
     * @param currentDepth The current recursion depth.
     * @param maxDepth The maximum recursion depth.
     * @param snapshot A point-in-time snapshot of the blacklist to avoid per-node locking.
     */
    void scanDirectory(FileNode* node, int currentDepth, int maxDepth, const std::unordered_set<std::string>* snapshot = nullptr);

    /**
     * @brief Internal recursive finder.
     * @param node The node to start searching from.
     * @param path The absolute path to find.
     * @return Mutable pointer to the found node, or nullptr.
     */
    FileNode* findNodeMutable(FileNode* node, const std::string& path) const;
};

} // namespace nitrogen::core

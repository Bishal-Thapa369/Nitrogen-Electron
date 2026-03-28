#ifndef NITROGEN_SEARCH_ENGINE_HPP
#define NITROGEN_SEARCH_ENGINE_HPP

#include <string>
#include <vector>
#include <filesystem>
#include <mutex>
#include <future>

namespace nitrogen {

struct SearchResult {
    std::string path;
    std::string fileName;
    int line;
    std::string context; // A preview of the line where the match was found
};

class SearchEngine {
public:
    SearchEngine() = default;
    ~SearchEngine() = default;

    /**
     * Perform an exhaustive search for filename and content matches.
     * @param query The string to search for.
     * @param rootPath The directory to start searching from.
     * @return A vector of SearchResult objects.
     */
    std::vector<SearchResult> searchAll(const std::string& query, const std::string& rootPath);

private:
    /**
     * Internal recursive search worker.
     */
    void searchRecursive(const std::filesystem::path& currentPath, const std::string& query, std::vector<SearchResult>& results, std::mutex& mtx);

    /**
     * Check if a file's content contains the query.
     */
    void searchInFile(const std::filesystem::path& filePath, const std::string& query, std::vector<SearchResult>& results, std::mutex& mtx);

    /**
     * Helper to check if a file is likely a text/source file.
     */
    bool isSearchable(const std::filesystem::path& path);
};

} // namespace nitrogen

#endif // NITROGEN_SEARCH_ENGINE_HPP

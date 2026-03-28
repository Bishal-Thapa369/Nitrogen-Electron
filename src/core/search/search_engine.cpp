#include "search_engine.hpp"
#include <fstream>
#include <iostream>
#include <algorithm>
#include <future>

namespace nitrogen {

std::vector<SearchResult> SearchEngine::searchAll(const std::string& query, const std::string& rootPath) {
    std::vector<SearchResult> results;
    std::mutex mtx;
    std::filesystem::path root(rootPath);

    if (!std::filesystem::exists(root) || !std::filesystem::is_directory(root)) {
        return results;
    }

    // Exhaustive walk through all directories (no exclusions per request)
    std::vector<std::future<void>> futures;

    for (const auto& entry : std::filesystem::recursive_directory_iterator(root, std::filesystem::directory_options::skip_permission_denied)) {
        const auto& path = entry.path();
        
        // 1. Filename Match
        std::string fileName = path.filename().string();
        std::string lowerFileName = fileName;
        std::string lowerQuery = query;
        std::transform(lowerFileName.begin(), lowerFileName.end(), lowerFileName.begin(), ::tolower);
        std::transform(lowerQuery.begin(), lowerQuery.end(), lowerQuery.begin(), ::tolower);

        if (lowerFileName.find(lowerQuery) != std::string::npos) {
            std::lock_guard<std::mutex> lock(mtx);
            results.push_back({path.string(), fileName, 0, "Filename Match"});
        }

        // 2. Content Match (Only for searchable files)
        if (entry.is_regular_file() && isSearchable(path)) {
            // Offload to a thread pool (async) for content search
            futures.push_back(std::async(std::launch::async, &SearchEngine::searchInFile, this, path, query, std::ref(results), std::ref(mtx)));
        }
    }

    // Wait for all content searches to complete
    for (auto& f : futures) {
        f.get();
    }

    return results;
}

void SearchEngine::searchInFile(const std::filesystem::path& filePath, const std::string& query, std::vector<SearchResult>& results, std::mutex& mtx) {
    std::ifstream file(filePath);
    if (!file.is_open()) return;

    std::string line;
    int lineNumber = 1;
    std::string lowerQuery = query;
    std::transform(lowerQuery.begin(), lowerQuery.end(), lowerQuery.begin(), ::tolower);

    while (std::getline(file, line)) {
        std::string lowerLine = line;
        std::transform(lowerLine.begin(), lowerLine.end(), lowerLine.begin(), ::tolower);

        if (lowerLine.find(lowerQuery) != std::string::npos) {
            std::lock_guard<std::mutex> lock(mtx);
            results.push_back({filePath.string(), filePath.filename().string(), lineNumber, line});
            
            // Limit results per file to keep it manageable
            if (results.size() > 5000) return; 
        }
        lineNumber++;
    }
}

bool SearchEngine::isSearchable(const std::filesystem::path& path) {
    static const std::vector<std::string> excludedExtensions = {
        ".exe", ".dll", ".so", ".node", ".bin", ".pyc", ".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".tar", ".gz"
    };

    std::string ext = path.extension().string();
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);

    // If extension is in the excluded list, skip content search 
    for (const auto& excluded : excludedExtensions) {
        if (ext == excluded) return false;
    }

    return true; 
}

} // namespace nitrogen

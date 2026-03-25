#pragma once

#include <vector>
#include <string>
#include <memory>
#include <cstdint>

namespace nitrogen::core {

/**
 * @enum BufferType
 * @brief Categorizes buffer segments for the Piece Table.
 */
enum class BufferType {
    Original,
    Add
};

/**
 * @struct Piece
 * @brief Represents a single segment in the document's logical sequence.
 * 
 * Each piece points to either the Original or Add buffer and maintains
 * its own length and starting position.
 */
struct Piece {
    BufferType buffer;
    size_t start;
    size_t length;
};

/**
 * @class PieceTable
 * @brief High-performance text buffer using the Piece Table data structure.
 * 
 * Provides O(1) amortized complexity for edits and handles large files
 * without re-allocating the entire document content.
 */
class PieceTable {
public:
    explicit PieceTable();
    ~PieceTable() = default;

    // Core API
    void load(const std::string& content);
    void insert(size_t pos, const std::string& text);
    void remove(size_t pos, size_t length);

    // Query API
    size_t totalSize() const;
    std::string getText() const;
    std::string getTextRange(size_t start, size_t length) const;

private:
    std::string m_originalBuffer;
    std::string m_addBuffer;
    std::vector<Piece> m_pieces;
    
    // Internal helpers
    void splitPiece(size_t logicalPos, size_t& pieceIndex, size_t& offsetInPiece);
};

} // namespace nitrogen::core

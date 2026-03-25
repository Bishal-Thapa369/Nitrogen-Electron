#include "piece_table.hpp"

namespace nitrogen::core {

PieceTable::PieceTable() {
    m_pieces.clear();
}

void PieceTable::load(const std::string& content) {
    m_originalBuffer = content;
    m_addBuffer.clear();
    m_pieces.clear();
    
    if (!content.empty()) {
        m_pieces.push_back({BufferType::Original, 0, content.size()});
    }
}

void PieceTable::insert(size_t pos, const std::string& text) {
    if (text.empty()) return;

    size_t pieceIndex = 0;
    size_t offsetInPiece = 0;
    // splitPiece(pos, pieceIndex, offsetInPiece); // Placeholder for next turn
    
    // Core logic: Add to buffer, insert new piece descriptor
    size_t addStart = m_addBuffer.size();
    m_addBuffer += text;
    
    // Simple push_back for now, will implement splitPiece for mid-text inserts
    m_pieces.push_back({BufferType::Add, addStart, text.size()});
}

void PieceTable::remove(size_t pos, size_t length) {
    if (length == 0 || m_pieces.empty()) return;
    // TODO: Implement piece splitting and removal
}

size_t PieceTable::totalSize() const {
    size_t total = 0;
    for (const auto& p : m_pieces) {
        total += p.length;
    }
    return total;
}

std::string PieceTable::getText() const {
    std::string result;
    result.reserve(totalSize());
    
    for (const auto& p : m_pieces) {
        const std::string& buf = (p.buffer == BufferType::Original) 
                                ? m_originalBuffer 
                                : m_addBuffer;
        result.append(buf.substr(p.start, p.length));
    }
    return result;
}

} // namespace nitrogen::core

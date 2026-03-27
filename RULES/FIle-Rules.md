# Project File Structure Rules and Guidelines

This document defines the rules, conventions, and principles for organizing the project's file and folder structure. Follow these rules consistently throughout development.

---

# 1. Core Philosophy

## 1.1 Guiding Principles

| Principle | Description |
|-----------|-------------|
| **Separation of Concerns** | Each folder represents one responsibility domain |
| **Single Purpose** | Each file should do one thing well |
| **Discoverability** | Anyone should find any component within 3 levels |
| **Isolation** | Components should be movable without breaking others |
| **Scalability** | Structure should remain clean at 10x current size |
| **Consistency** | Same patterns everywhere, no exceptions |

## 1.2 Golden Rules

1. **Never put unrelated files in the same folder**
2. **Never create files directly in root src folder**
3. **Never mix UI code with core logic**
4. **Never mix platform-specific code with cross-platform code**
5. **Always group by feature/domain first, then by file type**
6. **Always keep interfaces separate from implementations**
7. **Always co-locate related files together**

---

# 2. Folder Hierarchy Rules

## 2.1 Top-Level Organization

The project root should contain only:
- `src/` — all source code
- `include/` — public headers (if building library) OR keep headers with source
- `tests/` — all test code
- `resources/` — assets, themes, icons, translations
- `docs/` — documentation
- `scripts/` — build scripts, tooling scripts
- `third_party/` or `vendor/` or `external/` — external dependencies
- `build/` — build output (gitignored)
- Configuration files (CMakeLists.txt, .gitignore, README.md, etc.)

## 2.2 Source Folder Depth Rules

| Level | Purpose | Example |
|-------|---------|---------|
| Level 1 | Major system/domain | `src/ui/`, `src/core/`, `src/terminal/` |
| Level 2 | Sub-system/feature | `src/ui/sidebar/`, `src/ui/tabs/` |
| Level 3 | Component/module | `src/ui/sidebar/file_explorer/` |
| Level 4 | Rarely needed | Only if component is very complex |

### Rule: Maximum 4 levels deep
If you need more than 4 levels, reconsider your architecture.

### Rule: Minimum file count per folder
- Don't create a folder for just 1 file
- Minimum 2-3 related files justify a folder
- Exception: feature folders that will grow

## 2.3 Folder Naming Rules

| Rule | Good | Bad |
|------|------|-----|
| Use lowercase | `file_explorer/` | `FileExplorer/`, `File_Explorer/` |
| Use snake_case | `syntax_engine/` | `syntaxEngine/`, `syntaxengine/` |
| Use singular nouns for components | `editor/` | `editors/` |
| Use plural for collections | `utils/`, `widgets/` | `util/`, `widget/` |
| Be descriptive | `text_buffer/` | `tb/`, `buffer/` |
| No abbreviations unless universal | `ui/` is ok | `fe/` for file_explorer is not |
| No version numbers | `renderer/` | `renderer_v2/` |

---

# 3. File Naming Rules

## 3.1 General File Naming

| Rule | Good | Bad |
|------|------|-----|
| Use snake_case for all files | `file_explorer.cpp` | `FileExplorer.cpp`, `fileexplorer.cpp` |
| Match class name to file name | `FileExplorer` class → `file_explorer.cpp` | `FileExplorer` → `explorer.cpp` |
| One primary class per file | `document.cpp` has `Document` class | `document.cpp` has 5 unrelated classes |
| Suffix for file type | `_test.cpp`, `_mock.cpp`, `_interface.hpp` | `test_document.cpp` |
| No spaces or special characters | `text_buffer.cpp` | `text buffer.cpp`, `text-buffer.cpp` |

## 3.2 Header and Source Pairing

| Header | Source |
|--------|--------|
| `document.hpp` | `document.cpp` |
| `file_explorer.hpp` | `file_explorer.cpp` |
| `syntax_manager.hpp` | `syntax_manager.cpp` |

### Rule: Keep header and source together
Same folder, same base name.

### Rule: Use `.hpp` for C++ headers
Distinguishes from C headers (`.h`).

| Extension | Use For |
|-----------|---------|
| `.hpp` | C++ headers |
| `.cpp` | C++ source |
| `.h` | C headers or pure C compatibility headers |
| `.inl` | Inline/template implementations (optional) |

## 3.3 Special File Naming Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| `i_*.hpp` or `*_interface.hpp` | Interfaces/abstract base | `i_document.hpp`, `renderer_interface.hpp` |
| `*_types.hpp` | Type definitions only | `editor_types.hpp` |
| `*_fwd.hpp` | Forward declarations | `core_fwd.hpp` |
| `*_utils.hpp` / `*_utils.cpp` | Utility functions | `string_utils.hpp` |
| `*_constants.hpp` | Constants/enums | `editor_constants.hpp` |
| `*_config.hpp` | Configuration structures | `app_config.hpp` |
| `*_test.cpp` | Unit tests | `document_test.cpp` |
| `*_benchmark.cpp` | Performance tests | `buffer_benchmark.cpp` |
| `*_mock.hpp` | Mock objects | `file_service_mock.hpp` |

---

# 4. Component Isolation Rules

## 4.1 Folder Per Component

Each logical component gets its own folder containing:
- Header file(s)
- Source file(s)
- Internal helpers (private to component)
- Component-specific types

### Example Component Folder

```
src/ui/sidebar/file_explorer/
├── file_explorer.hpp          # Public interface
├── file_explorer.cpp          # Implementation
├── file_explorer_model.hpp    # Internal model
├── file_explorer_model.cpp
├── file_explorer_item.hpp     # Internal types
├── file_explorer_item.cpp
└── file_explorer_constants.hpp # Component constants
```

## 4.2 Public vs Internal Files

### Rule: Distinguish public interfaces from internals

**Option A: Naming convention**
- `file_explorer.hpp` — public
- `file_explorer_internal.hpp` — internal

**Option B: Subfolder**
```
file_explorer/
├── file_explorer.hpp      # Public
├── file_explorer.cpp
└── internal/
    ├── model.hpp          # Internal
    └── model.cpp
```

Choose one approach and stick with it project-wide.

## 4.3 Component Independence Rules

1. **No circular dependencies between component folders**
2. **Component should compile independently** (if isolated)
3. **Depend on interfaces, not implementations** where possible
4. **Internal files should not be included from outside the folder**

---

# 5. Layer Separation Rules

## 5.1 Layer Definition

Your project has these layers (from top to bottom):

| Layer | Depends On | Never Depends On |
|-------|------------|------------------|
| UI | Core, Rendering, Services | — |
| Rendering | Core | UI |
| Services (File, Terminal) | Core | UI, Rendering (usually) |
| Core | Nothing (or minimal utils) | UI, Rendering, Services |
| Utils/Common | Nothing | Anything above |

## 5.2 Layer Folder Rules

1. **Each layer is a top-level folder under `src/`**
2. **Lower layers must not include headers from higher layers**
3. **Cross-layer communication via interfaces or signals**
4. **Shared types go in `common/` or `core/types/`**

## 5.3 Dependency Direction

```
        +--------+
        |   UI   |
        +---+----+
            |
            v
    +-------+--------+
    |                |
+---v----+     +-----v------+
|Rendering|     |  Services  |
+---+----+     +-----+------+
    |                |
    v                v
    +-------+--------+
            |
        +---v---+
        |  Core |
        +---+---+
            |
            v
        +---+---+
        | Utils |
        +-------+
```

### Enforcement
- Code review checks
- Include-what-you-use tooling
- Build system layer validation (optional)

---

# 6. UI Folder Rules

## 6.1 UI Hierarchy Pattern

```
src/ui/
├── main_window/           # Main window container
├── menu/                  # Menu bar components
├── toolbar/               # Toolbar components
├── statusbar/             # Status bar components
├── tabs/                  # Tab management
├── sidebar/               # Sidebar container
│   ├── file_explorer/     # File explorer panel
│   ├── search_panel/      # Search panel
│   └── outline_panel/     # Outline panel
├── editor/                # Editor view components
│   ├── viewport/          # Text viewport
│   ├── line_numbers/      # Line number gutter
│   ├── minimap/           # Minimap component
│   └── overlays/          # Popups, tooltips, etc.
├── terminal/              # Terminal UI (not backend)
├── dialogs/               # Modal dialogs
├── widgets/               # Reusable custom widgets
├── styles/                # QSS or style logic
└── animations/            # Animation controllers
```

## 6.2 UI Component Rules

1. **Each panel/section is its own folder**
2. **Reusable widgets go in `widgets/`**
3. **Dialog windows go in `dialogs/`**
4. **Separate UI logic from backend logic**
5. **Terminal UI is separate from terminal backend**

## 6.3 UI File Responsibilities

| File Pattern | Contains |
|--------------|----------|
| `*_view.hpp/cpp` | Main widget class |
| `*_controller.hpp/cpp` | Logic/state management |
| `*_model.hpp/cpp` | Data model |
| `*_delegate.hpp/cpp` | Custom item rendering |
| `*_widget.hpp/cpp` | Reusable sub-widget |

---

# 7. Core Folder Rules

## 7.1 Core Hierarchy Pattern

```
src/core/
├── document/              # Document model
│   ├── document.hpp
│   ├── document.cpp
│   ├── text_buffer/       # Text storage implementation
│   ├── cursor/            # Cursor logic
│   ├── selection/         # Selection logic
│   └── undo_redo/         # Undo/redo system
├── syntax/                # Syntax engine
│   ├── syntax_manager.hpp
│   ├── tree_sitter/       # Tree-sitter integration
│   ├── highlighter/       # Highlighting logic
│   └── languages/         # Language definitions
├── search/                # Search engine
├── session/               # Session state management
├── commands/              # Command system
├── keybindings/           # Keybinding system
└── events/                # Event bus / signals
```

## 7.2 Core Rules

1. **Core has no UI dependencies**
2. **Core has no Qt widget dependencies** (QtCore is ok)
3. **Core can be tested independently**
4. **Document model is heart of core**
5. **All editor state logic lives in core**

---

# 8. Services Folder Rules

## 8.1 Services Hierarchy Pattern

```
src/services/
├── file_service/          # File operations
│   ├── file_service.hpp
│   ├── file_loader.hpp
│   ├── file_saver.hpp
│   ├── file_watcher.hpp
│   └── encoding/          # Encoding detection/conversion
├── terminal_service/      # Terminal backend
│   ├── terminal_session.hpp
│   ├── shell_process.hpp
│   └── ansi_parser.hpp
├── project_service/       # Project/workspace management
├── config_service/        # Configuration loading/saving
├── recent_files_service/  # Recent files tracking
└── plugin_service/        # Plugin management
```

## 8.2 Service Rules

1. **Each service is self-contained**
2. **Services expose clean interfaces**
3. **Services can use core types**
4. **Services should not use UI types**
5. **Services run operations async where appropriate**

---

# 9. Interface Definition Rules

## 9.1 Where to Put Interfaces

**Option A: With implementation**
```
src/services/file_service/
├── i_file_service.hpp     # Interface
├── file_service.hpp       # Implementation header
└── file_service.cpp       # Implementation source
```

**Option B: Separate interfaces folder**
```
src/interfaces/
���── i_file_service.hpp
├── i_document.hpp
└── i_renderer.hpp

src/services/file_service/
├── file_service.hpp
└── file_service.cpp
```

### Recommendation
Option A for most cases.
Option B only if you have many implementations of same interface.

## 9.2 Interface Naming

| Convention | Example |
|------------|---------|
| Prefix with `I` | `IDocument`, `IFileService` |
| File: prefix with `i_` | `i_document.hpp` |
| Or suffix with `Interface` | `DocumentInterface` |

Choose one convention, use everywhere.

## 9.3 Interface File Contents

Interface header should contain only:
- Abstract class definition
- Pure virtual methods
- Necessary type includes
- No implementation details

---

# 10. Utility and Common Rules

## 10.1 Utils Folder Pattern

```
src/utils/
├── string_utils.hpp       # String helpers
├── string_utils.cpp
├── path_utils.hpp         # Path manipulation
├── path_utils.cpp
├── time_utils.hpp         # Time/date helpers
├── file_utils.hpp         # Low-level file helpers
├── math_utils.hpp         # Math helpers
├── debug/                 # Debug utilities
│   ├── logger.hpp
│   ├── logger.cpp
│   ├── profiler.hpp
│   └── assert.hpp
└── memory/                # Memory utilities
    ├── object_pool.hpp
    └── string_intern.hpp
```

## 10.2 Common/Shared Types Pattern

```
src/common/
├── types.hpp              # Common type aliases
├── constants.hpp          # Global constants
├── enums.hpp              # Shared enumerations
├── result.hpp             # Result/Error types
├── id_types.hpp           # ID wrapper types
└── forward_declarations.hpp
```

## 10.3 Rules for Utils/Common

1. **No business logic in utils**
2. **Utils must not depend on any domain code**
3. **Utils should be generic and reusable**
4. **Common types are used across layers**
5. **Keep utils stateless when possible**

---

# 11. Third-Party / External Code Rules

## 11.1 External Code Location

All external/third-party code goes in one place:
```
third_party/
├── tree_sitter/           # Tree-sitter library
├── lua/                   # Lua interpreter
├── fmt/                   # fmt library (if used)
└── ...
```

Or:
```
external/
vendor/
```

Choose one name.

## 11.2 External Code Rules

1. **Never modify third-party code** (or track modifications)
2. **Never scatter third-party code across project**
3. **Wrap third-party APIs** in your own abstractions when useful
4. **Document version/source** of each dependency
5. **Keep build instructions for each dependency**

## 11.3 Wrapper Pattern

If wrapping external library:
```
src/wrappers/
├── tree_sitter_wrapper/
│   ├── ts_parser.hpp      # Your clean interface
│   └── ts_parser.cpp      # Wraps raw tree-sitter API
└── lua_wrapper/
    ├── lua_engine.hpp
    └── lua_engine.cpp
```

---

# 12. Test Folder Rules

## 12.1 Test Organization

Tests mirror source structure:
```
tests/
├── core/
│   ├── document/
│   │   ├── document_test.cpp
│   │   └── text_buffer_test.cpp
│   └── syntax/
│       └── highlighter_test.cpp
├── services/
│   └── file_service/
│       └── file_service_test.cpp
├── ui/
│   └── editor/
│       └── viewport_test.cpp
├── integration/           # Integration tests
│   ├── file_open_save_test.cpp
│   └── editor_workflow_test.cpp
├── benchmarks/            # Performance tests
│   ├── buffer_benchmark.cpp
│   └── render_benchmark.cpp
├── fixtures/              # Test data files
│   ├── sample_cpp_file.cpp
│   └── large_file.txt
└── mocks/                 # Shared mock objects
    ├── mock_file_service.hpp
    └── mock_document.hpp
```

## 12.2 Test File Rules

1. **Test file mirrors source file path**
2. **Test file name: `<source_name>_test.cpp`**
3. **Benchmarks: `<source_name>_benchmark.cpp`**
4. **Mocks can live with tests or in shared `mocks/`**
5. **Test fixtures/data in `fixtures/`**
6. **Integration tests separate from unit tests**

## 12.3 Test Naming Convention

| Source File | Test File |
|-------------|-----------|
| `src/core/document/document.cpp` | `tests/core/document/document_test.cpp` |
| `src/services/file_service/file_loader.cpp` | `tests/services/file_service/file_loader_test.cpp` |

---

# 13. Resource Folder Rules

## 13.1 Resource Organization

```
resources/
├── icons/                 # Application icons
│   ├── app/               # App icons (various sizes)
│   ├── actions/           # Action/toolbar icons
│   ├── file_types/        # File type icons
│   └── ui/                # UI element icons
├── themes/                # Theme definitions
│   ├── dark/
│   │   ├── theme.json
│   │   └── syntax.json
│   └── light/
│       ├── theme.json
│       └── syntax.json
├── fonts/                 # Bundled fonts (if any)
├── translations/          # i18n files
│   ├── en.json
│   ├── es.json
│   └── ...
├── syntax/                # Syntax definitions / grammars
│   ├── cpp.json
│   └── python.json
├── templates/             # File templates
└── default_config/        # Default configuration files
```

## 13.2 Resource Rules

1. **Organize by resource type first**
2. **Use consistent naming within each type**
3. **Keep multiple sizes of icons if needed**
4. **Version or document theme format**
5. **Keep translations separate from code**

---

# 14. Documentation Folder Rules

## 14.1 Documentation Organization

```
docs/
├── architecture/          # Architecture documents
│   ├── ARCHITECTURE.md
│   ├── LAYERS.md
│   └── diagrams/
├── development/           # Developer guides
│   ├── SETUP.md
│   ├── BUILDING.md
│   ├── CODING_STYLE.md
│   └── CONTRIBUTING.md
├── api/                   # API documentation
│   └── (generated docs)
├── user/                  # User documentation
│   ├── USER_GUIDE.md
│   └── KEYBINDINGS.md
└── decisions/             # Architecture Decision Records
    ├── 001_text_buffer_choice.md
    └── 002_threading_model.md
```

## 14.2 Documentation Rules

1. **Keep docs near what they document** (README in component folder)
2. **High-level docs in `docs/`**
3. **Each component can have its own README.md**
4. **Record major decisions in ADR format**
5. **Keep docs updated with code changes**

---

# 15. Platform-Specific Code Rules

## 15.1 Platform Code Location

```
src/platform/
├── common/                # Cross-platform base
│   └── platform_interface.hpp
├── windows/               # Windows-specific
│   ├── windows_shell.cpp
│   └── windows_utils.cpp
├── linux/                 # Linux-specific
│   ├── linux_shell.cpp
│   └── linux_utils.cpp
└── macos/                 # macOS-specific
    ├── macos_shell.cpp
    └── macos_utils.cpp
```

## 15.2 Platform Code Rules

1. **Isolate all platform-specific code in `platform/`**
2. **Define cross-platform interface in `common/`**
3. **Implement per-platform in respective folders**
4. **Never put `#ifdef _WIN32` in non-platform code**
5. **Use platform folder for:**
   - Native shell integration
   - OS-specific paths
   - Native dialogs
   - System notifications
   - Hardware access

---

# 16. Build Configuration Rules

## 16.1 Build Files Location

```
project_root/
├── CMakeLists.txt             # Root CMake file
├── cmake/                     # CMake modules/helpers
│   ├── CompilerOptions.cmake
│   ├── Dependencies.cmake
│   └── Packaging.cmake
├── src/
│   ├── CMakeLists.txt         # Main src CMake
│   ├── core/
│   │   └── CMakeLists.txt     # Core library CMake
│   ├── ui/
│   │   └── CMakeLists.txt     # UI library CMake
│   └── ...
└── tests/
    └── CMakeLists.txt         # Tests CMake
```

## 16.2 Build Rules

1. **One CMakeLists.txt per major folder**
2. **Each layer can be a separate library target**
3. **Tests are separate target(s)**
4. **Keep build configuration modular**
5. **CMake helpers go in `cmake/` folder**

---

# 17. Quick Reference: Folder Naming

| Folder Type | Naming Style | Example |
|-------------|--------------|---------|
| Layer folders | lowercase singular | `core`, `ui`, `services` |
| Component folders | snake_case singular | `file_explorer`, `text_buffer` |
| Sub-feature folders | snake_case | `undo_redo`, `tree_sitter` |
| Collection folders | plural | `utils`, `widgets`, `dialogs` |
| Platform folders | lowercase | `windows`, `linux`, `macos` |
| Test folders | match source | `tests/core/document/` |
| Resource type folders | plural | `icons`, `themes`, `fonts` |

---

# 18. Quick Reference: File Naming

| File Type | Naming Pattern | Example |
|-----------|----------------|---------|
| Class header | `class_name.hpp` | `document.hpp` |
| Class source | `class_name.cpp` | `document.cpp` |
| Interface | `i_class_name.hpp` | `i_document.hpp` |
| Types only | `*_types.hpp` | `editor_types.hpp` |
| Constants | `*_constants.hpp` | `theme_constants.hpp` |
| Utilities | `*_utils.hpp/cpp` | `string_utils.hpp` |
| Forward decl | `*_fwd.hpp` | `core_fwd.hpp` |
| Test | `*_test.cpp` | `document_test.cpp` |
| Benchmark | `*_benchmark.cpp` | `buffer_benchmark.cpp` |
| Mock | `*_mock.hpp` | `file_service_mock.hpp` |
| README | `README.md` | `README.md` |

---

# 19. Anti-Patterns to Avoid

## 19.1 Folder Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| `src/classes/` | Meaningless grouping | Group by domain |
| `src/headers/` and `src/source/` | Separates related files | Keep .hpp/.cpp together |
| `src/new/` or `src/old/` | Version in folder name | Use git branches |
| `src/misc/` or `src/stuff/` | Dumping ground | Find proper homes |
| `src/MyComponent/` | Inconsistent casing | Use snake_case |
| Deep nesting (5+ levels) | Hard to navigate | Flatten or redesign |
| Single file folders | Overkill | Merge into parent or wait until growth |

## 19.2 File Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| `utils.cpp` (one giant file) | Too much responsibility | Split by function |
| `DocumentManager.cpp` (PascalCase) | Inconsistent naming | Use `document_manager.cpp` |
| `doc.cpp` (abbreviated) | Not discoverable | Use full name `document.cpp` |
| `document2.cpp` | Version in name | One file, use git for history |
| `helpers.cpp` | Too vague | Name by specific purpose |
| Mixed class + free functions | Confusing responsibility | Separate files |

---

# 20. Checklist Before Creating New File/Folder

Ask yourself:

## Before Creating a Folder

- [ ] Does this folder represent a clear single responsibility?
- [ ] Will this folder contain at least 2-3 files?
- [ ] Does the name follow snake_case convention?
- [ ] Is there already a folder where this logically belongs?
- [ ] Is this at the appropriate depth level (max 4)?
- [ ] Does this create any circular dependency risks?

## Before Creating a File

- [ ] Does file name match the primary class/component name?
- [ ] Is naming consistent with existing files?
- [ ] Does this file have single responsibility?
- [ ] Is this in the correct folder for its domain?
- [ ] Does header have matching source file (if needed)?
- [ ] Would this break any layer dependencies?

---

# 21. Maintenance Rules

## 21.1 When to Refactor Structure

Consider restructuring when:
- Folder has too many files (15+ files)
- Folder has only 1 file for long time
- You keep looking in wrong places
- Circular dependencies appear
- Layer boundaries are violated
- Related files are scattered

## 21.2 How to Refactor Safely

1. **Plan the new structure first**
2. **Update build system**
3. **Move files**
4. **Update all includes**
5. **Verify build**
6. **Run all tests**
7. **Update documentation**
8. **Commit with clear message**

## 21.3 Documentation Updates

When structure changes:
- Update root README if needed
- Update architecture docs
- Update this structure guidelines if rules change
- Add component README for new major components

---

# 22. Summary

## Core Rules Recap

1. **Separate by domain/feature, not by file type**
2. **snake_case everywhere for files and folders**
3. **Keep headers with their sources**
4. **One component per folder**
5. **Respect layer boundaries**
6. **Maximum 4 levels deep**
7. **Minimum 2-3 files per folder**
8. **No circular dependencies**
9. **UI separate from core**
10. **Platform code isolated**
11. **Tests mirror source structure**
12. **External code in one place**
13. **Be consistent everywhere**

---

# 23. Most Important Rules

**This document should be your reference whenever you create new files or folders. Following these rules from the start will save significant refactoring time later and keep the codebase navigable as it grows.ALso AI is Required to make a file-Tree-Structure.md file and after every update, make update to FIle-Tree-Structure.md file inside RULES folder, this is non negligable, cause it helps us in long term, not only tree diagram but AI needs to properly explain role of each file there in 1-2 sentences which prevents hallucination. Before making changes AI should always read File structure md file and understand the context.Beofre Making Changes AI should confirm and BE aware of all the RUles like Plan,Optimization,File-Rules and then only proceed to read file structure and make changes.**
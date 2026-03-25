import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock File System Path
  const MOCK_FS_PATH = path.join(process.cwd(), "mock-fs.json");

  // Initialize mock FS if it doesn't exist
  try {
    await fs.access(MOCK_FS_PATH);
  } catch {
    const initialData = {
      files: [
        { id: "1", name: "index.html", content: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello CodeWeaver!</h1>\n</body>\n</html>", language: "html", parentId: null },
        { id: "2", name: "styles.css", content: "body {\n  background: #1e1e1e;\n  color: white;\n}", language: "css", parentId: null },
        { id: "3", name: "app.js", content: "console.log('Welcome to CodeWeaver');", language: "javascript", parentId: null },
        { id: "4", name: "readme.md", content: "# CodeWeaver\nA VS Code inspired editor.", language: "markdown", parentId: null },
      ],
      folders: []
    };
    await fs.writeFile(MOCK_FS_PATH, JSON.stringify(initialData, null, 2));
  }

  // API Routes
  app.get("/api/files", async (req, res) => {
    const data = await fs.readFile(MOCK_FS_PATH, "utf-8");
    res.json(JSON.parse(data));
  });

  app.post("/api/files/save", async (req, res) => {
    const { id, content } = req.body;
    const data = JSON.parse(await fs.readFile(MOCK_FS_PATH, "utf-8"));
    const file = data.files.find((f: any) => f.id === id);
    if (file) {
      file.content = content;
      await fs.writeFile(MOCK_FS_PATH, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  app.post("/api/files/create", async (req, res) => {
    const { name, language, parentId } = req.body;
    const data = JSON.parse(await fs.readFile(MOCK_FS_PATH, "utf-8"));
    const newFile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      content: "",
      language,
      parentId: parentId || null
    };
    data.files.push(newFile);
    await fs.writeFile(MOCK_FS_PATH, JSON.stringify(data, null, 2));
    res.json(newFile);
  });

  app.delete("/api/files/:id", async (req, res) => {
    const { id } = req.params;
    const data = JSON.parse(await fs.readFile(MOCK_FS_PATH, "utf-8"));
    data.files = data.files.filter((f: any) => f.id !== id);
    await fs.writeFile(MOCK_FS_PATH, JSON.stringify(data, null, 2));
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

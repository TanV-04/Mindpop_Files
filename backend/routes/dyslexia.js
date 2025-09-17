import express from "express";
import { PythonShell } from "python-shell";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/run", (req, res) => {
  const { userText } = req.body || ""; // optional: send user input

  let options = {
    pythonPath: "python3",
    args: userText ? [userText] : []
  };

  const scriptPath = path.join(__dirname, "../dyslexia/dyslexia.py");

  PythonShell.run(scriptPath, options, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ output: results.join("\n") });
  });
});

export default router;

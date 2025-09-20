import express from "express";
import multer from "multer";
import { PythonShell } from "python-shell";
import path from "path";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST route to run 1-sentence dyslexia test
router.post("/run", upload.single("audio"), (req, res) => {
  const file = req.file; // single audio file
  const { sentence } = req.body; // single sentence

  if (!file || !sentence) {
    return res.status(400).json({ error: "Audio file or sentence missing" });
  }

  const audioPath = file.path;

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    args: [audioPath, sentence],
  };

  PythonShell.run(
    path.join("backend", "dyslexia", "dyslexia.py"),
    options,
    (err, output) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ sentence, output });
    }
  );
});

export default router;

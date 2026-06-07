import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
} from "@google/genai";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import db from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/entries", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM entries ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("GET /entries error:", err);
    res.status(500).json({ error: "server error" });
  }
});

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    const uploadedFile = await ai.files.upload({
      file: req.file.path,
      config: {
        mimeType: req.file.mimetype,
      },
    });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
        "Transcribe this audio. Return only the spoken words.",
      ]),
    });

    console.log("The message says:", result.text);
    res.json({ transcript: result.text });
  } catch (err) {
    console.error("Upload/transcription error:", err);
    res.status(500).json({ error: "transcription failed" });
  }
});

app.post("/entries", async (req, res) => {
  try {
    const { text } = req.body;

    const today = new Date().toISOString().split("T")[0];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are an AI assistant for a smart journal and productivity app.

Today's date is ${today}.

Convert the user's natural language input into STRICT valid JSON.

Return ONLY raw JSON.
Do not use markdown.
Do not use code fences.
Do not explain anything.

The JSON MUST exactly follow this structure:

{
  "rawText": "string",
  "type": "statement | task | reminder | event",
  "actionable": true,
  "title": "string",
  "description": "string",
  "category": "Personal | Work | School | Health | Finance | Social | Travel | Leisure | Maintenance | Other",
  "date": "YYYY-MM-DD or null",
  "time": "HH:MM or null",
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null",
  "dueDate": "YYYY-MM-DD or null",
  "recurrence": "none | daily | weekly | monthly | yearly | custom",
  "durationMinutes": 0,
  "notificationEnabled": true,
  "notificationTime": "real datetime string or null",
  "reminderOffsetMinutes": 0,
  "priority": "low | medium | high",
  "sentiment": "positive | neutral | negative",
  "confidence": 1,
  "keywords": ["keyword1", "keyword2"]
}

Rules:

- type:
  - "statement" = general thought or journal entry
  - "task" = something to complete
  - "reminder" = something the user wants to remember
  - "event" = scheduled occurrence

- actionable:
  - true for reminders, tasks, and events
  - false for statements

- category:
  - choose the most relevant category

- date:
  - use YYYY-MM-DD
  - infer relative dates like "today", "tomorrow", and "next friday"
  - use null if no date is known

- time:
  - use 24-hour HH:MM format
  - use null if no time is known

- recurrence:
  - daily, weekly, monthly, yearly, custom, or none

- durationMinutes:
  - use a number if duration is given
  - otherwise use null

- notificationEnabled:
  - true if the user asks to remember, be reminded, schedule something, or complete a task
  - false for plain statements or journal thoughts

- notificationTime:
  - must be either null or a real full datetime string like "2026-05-21T16:30:00"
  - never return only "HH:MM"
  - never return the placeholder "YYYY-MM-DDTHH:MM:SS"
  - if an event/task/reminder has a date and time, subtract reminderOffsetMinutes from that datetime
  - if a time exists but no reminder offset is stated, use 30 minutes
  - if no date or time can reasonably be inferred, use null

- reminderOffsetMinutes:
  - default to 30 when there is a specific time
  - otherwise use null

- priority:
  - infer urgency intelligently

- sentiment:
  - detect emotional tone

- confidence:
  - number between 0 and 1

- keywords:
  - include searchable keywords the user would realistically search later

ALL fields must exist.
If unknown, use null.

User input:
"${text}"
`,
    });

    let aiText = response.text.trim();

    aiText = aiText
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/i, "")
      .trim();

    console.log("AI TEXT:", aiText);

    const parsedText = JSON.parse(aiText);

    const result = await db.query(
      `
      INSERT INTO entries (
        raw_text,
        type,
        actionable,
        title,
        description,
        category,
        date,
        start_date,
        end_date,
        due_date,
        recurrence,
        duration_minutes,
        notification_enabled,
        notification_time,
        reminder_offset_minutes,
        priority,
        sentiment,
        confidence,
        keywords
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19
      )
      RETURNING *
      `,
      [
        parsedText.rawText,
        parsedText.type,
        parsedText.actionable,
        parsedText.title,
        parsedText.description || parsedText.rawText || parsedText.title || "",
        parsedText.category,
        parsedText.date,
        parsedText.startDate,
        parsedText.endDate,
        parsedText.dueDate,
        parsedText.recurrence,
        parsedText.durationMinutes,
        parsedText.notificationEnabled,
        parsedText.notificationTime,
        parsedText.reminderOffsetMinutes,
        parsedText.priority,
        parsedText.sentiment,
        parsedText.confidence,
        parsedText.keywords,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("POST /entries error:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

app.delete("/entries/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await db.query("DELETE FROM entries WHERE id = $1", [id]);
    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error("DELETE /entries error:", err);
    res.status(500).json({ error: "server error" });
  }
});

app.put("/entries/:id", async (req, res) => {
  const id = req.params.id;
  const text = req.body.new_text?.trim();

  if (!text) {
    return res.status(400).json({ error: "new_text is required" });
  }

  try {
    const result = await db.query(
      `
      UPDATE entries
      SET 
        raw_text = $1,
        description = $1
      WHERE id = $2
      RETURNING *
      `,
      [text, id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /entries error:", err);
    res.status(500).json({ error: "server error" });
  }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

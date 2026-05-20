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
const PORT = 3000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/entries", async (req, res) => {
  console.log("Ts working");
  try {
    const result = await db.query("SELECT * FROM entries");

    console.log("ROWS: ", result.rows);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("audio"), async (req, res) => {
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

  res.json({ transcript: result.text });
  console.log("The message says: ", result.text);
});

app.post("/entries", async (req, res) => {
  console.log("Testing with balls");
  try {
    const { text } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are an AI assistant for a smart journal and productivity app.

Today's date is ${new Date().toISOString().split("T")[0]}.

Your job is to convert the user's natural language input into STRICT valid JSON.

Return ONLY raw JSON.
DO NOT use markdown.
DO NOT wrap the response in \`\`\`.
DO NOT explain anything.

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
  "durationMinutes": number or null,
  "notificationEnabled": true,
  "notificationTime": "HH:MM or null",
  "reminderOffsetMinutes": number or null,
  "priority": "low | medium | high",
  "sentiment": "positive | neutral | negative",
  "confidence": number,
  "keywords": ["keyword1", "keyword2", ...]
}

Interpretation rules:

- type:
  - "statement" = general thought/journal entry
  - "task" = something to complete
  - "reminder" = something the user wants to remember
  - "event" = scheduled occurrence

- actionable:
  - true for reminders/tasks/events
  - false for statements

- title:
  - short concise summary

- description:
  - clear explanation of the entry

- category:
  - choose the MOST relevant category

- Dates:
  - use YYYY-MM-DD format
  - infer relative dates like "tomorrow", "next friday", etc.

- Times:
  - use 24-hour HH:MM format

- recurrence:
  - "daily" for phrases like "every day"
  - "weekly" for weekly repeats
  - "monthly" for monthly repeats
  - "yearly" for yearly repeats
  - otherwise "none"

- durationMinutes:
  - infer if user gives a duration like:
    "study for 1 hour"

- notificationEnabled:
  - true if the user implies wanting a reminder or schedule
  - false for plain journal thoughts

- notificationTime:
  - If a time is given, assume notification should happen BEFORE the event.
  - Default reminderOffsetMinutes = 30 if time exists.
  - notificationTime = time minus reminderOffsetMinutes.

Examples:
- Event at 17:00
- reminderOffsetMinutes = 30
- notificationTime = 16:30

- If the user says:
  "study for my test"

  Then:
  - type = "task"
  - recurrence = "daily"
  - notificationEnabled = true
  - generate a reasonable reminder schedule

- If the user says:
  "study for my test that's this friday an hour a day at 5"

  Then:
  - type = "task"
  - recurrence = "daily"
  - startDate = today
  - endDate = friday
  - durationMinutes = 60
  - time = 17:00
  - notificationTime = 16:30

- priority:
  - infer urgency intelligently

- sentiment:
  - detect emotional tone

- confidence:
  - value between 0 and 1

- keywords:
  - include searchable keywords related to the entry, use as many as needed doesn't have to just be two but make them something a person would most likely use to search

ALL fields must exist.
If unknown, use null.

User input:
"${text}"
`,
    });

    const aiText = response.text;
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
        parsedText.description,
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

    console.log("We good");

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});

app.delete("/entries/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await db.query(`DELETE FROM entries WHERE id = $1`, [id]);

    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

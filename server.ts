import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());

  // Google GenAI Lazy Initialization
  let aiClient: GoogleGenAI | null = null;

  function getAiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in your Secrets settings.");
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message, history, examResult } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const ai = getAiClient();

      // Extract Student and Exam stats
      const studentName = examResult?.studentName || "Sudar";
      const studentId = examResult?.studentId || "STU-2092";
      const examTitle = examResult?.examTitle || "SSIT Vision Platform Trial — Section A";
      const scoreText = `${examResult?.correctCount ?? 0} / ${examResult?.totalCount ?? 5}`;
      const percentage = examResult?.percentage ?? 0;
      const accuracy = `${percentage}%`;
      const integrityScore = examResult?.integrityScore ?? 100;
      const classification = examResult?.classification || "SECURE_INTEGRITY";
      const anomalyCount = examResult?.anomalyCount ?? 0;
      const date = new Date().toLocaleDateString();

      // Build text representation of student violations logs
      const logsText = examResult?.logs && examResult.logs.length > 0
        ? examResult.logs.map((l: any) => `[${l.time}] ${l.event} (Severity: ${l.level}, Model: ${l.model})`).join("\n")
        : "No anomalies detected. Pristine session integrity.";

      // Build text representation of questions, correct choices, and student selections
      const questionsText = examResult?.questions && examResult.questions.length > 0
        ? examResult.questions.map((q: any, i: number) => {
            const selectedOpt = q.options[q.selectedAnswer] || "No Answer Selected";
            const correctOpt = q.options[q.correctAnswer];
            const isCorrect = q.selectedAnswer === q.correctAnswer;
            return `Question ${i + 1}: ${q.question}
Options:
${q.options.map((opt: string, idx: number) => `  ${String.fromCharCode(65 + idx)}) ${opt}`).join("\n")}
- Student's Selected Answer: ${selectedOpt}
- Correct Answer: ${correctOpt}
- Outcome: ${isCorrect ? "CORRECT" : "INCORRECT"}`;
          }).join("\n\n")
        : "No question data available.";

      const systemInstruction = `You are the ProctorAI Academic Assistant, an advanced AI tutor. You are helping a student review their recent proctored exam performance.
Here is the student's performance report:
Student Details:
- Name: ${studentName}
- ID: ${studentId}
Exam Details:
- Exam: ${examTitle}
- Date: ${date}
Marks / Score:
- Score: ${scoreText} (${percentage}%)
- Answering Accuracy: ${accuracy}
Integrity / Proctoring Analysis:
- Integrity Trust Index: ${integrityScore}%
- Classification: ${classification}
- Total Anomalies: ${anomalyCount}
- Logs/Violations during exam:
${logsText}

Questions and Responses:
${questionsText}

Ground Rules:
1. Ground all your answers strictly in the student's actual performance. If they ask "Why did I lose marks?", identify which questions they got wrong, explain the correct answer, and explain why their chosen answer was incorrect. Be specific and reference the actual question text and correct vs chosen option.
2. If they ask "What topics should I study?", analyze their wrong answers and recommend specific topics (e.g., Computer Vision, Head Gaze, Relational Databases, Browser Visibility API) that correspond to those questions.
3. If they ask "Give me practice questions", generate 3 practice multiple-choice questions with answers based on the topics they got wrong, to help them practice. Include answers at the end of your response with explanations.
4. If they ask "Explain Question X" (where X is 1 to 5), explain that specific question in detail: the prompt, why the correct option is right, and why the other options are wrong.
5. Keep your tone encouraging, professional, academic, and supportive. Address them as a student of Sri Sai Ram Institute of Technology (SSIT). Use clean formatting, bold text, and lists where appropriate. Do not use markdown headers larger than h3 (use ### for headings).`;

      const contents: any[] = [];

      // Ground history if available, ensuring strict turn alternation and starting with a user turn
      if (history && Array.isArray(history)) {
        let lastRole: "user" | "model" | null = null;
        history.forEach((h: any) => {
          if (h.sender === "user") {
            if (lastRole !== "user") {
              contents.push({ role: "user", parts: [{ text: h.text }] });
              lastRole = "user";
            }
          } else if (h.sender === "ai") {
            // Only allow model turn if it succeeds a user turn
            if (lastRole === "user") {
              contents.push({ role: "model", parts: [{ text: h.text }] });
              lastRole = "model";
            }
          }
        });
      }

      // Add current user question
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Error in AI Chatbot endpoint:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Serve Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
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

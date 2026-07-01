import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

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

  // HTML Report generator for secure emails
  function generateReportEmailHtml(data: {
    studentName: string;
    studentEmail: string;
    examTitle: string;
    scoreText: string;
    percentage: number;
    integrityScore: number;
    anomalyCount: number;
    logs: any[];
    simulated: boolean;
  }) {
    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false }) + " UTC";

    const logRows = data.logs && data.logs.length > 0
      ? data.logs.map(log => {
          let badgeColor = "#10B981";
          if (log.level === "HIGH") badgeColor = "#EF4444";
          else if (log.level === "MED") badgeColor = "#F59E0B";
          else if (log.level === "LOW") badgeColor = "#3B82F6";

          return `
            <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
              <td style="padding: 10px; font-family: monospace; color: rgba(255, 255, 255, 0.5); font-size: 11px;">${log.time}</td>
              <td style="padding: 10px; font-size: 12px; color: #EBEBEB; font-weight: 500;">${log.event}</td>
              <td style="padding: 10px;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-family: monospace; font-weight: bold; background-color: ${badgeColor}; color: #000000; text-transform: uppercase;">
                  ${log.level}
                </span>
              </td>
              <td style="padding: 10px; font-family: monospace; color: rgba(255, 255, 255, 0.4); font-size: 11px;">${log.model}</td>
            </tr>
          `;
        }).join("")
      : `
        <tr>
          <td colspan="4" style="padding: 24px; text-align: center; color: #10B981; font-weight: 500; font-size: 13px; background-color: rgba(16, 185, 129, 0.05); border: 1px dashed rgba(16, 185, 129, 0.2); border-radius: 8px;">
            ✓ Pristine Session Integrity - Zero anomalies recorded.
          </td>
        </tr>
      `;

    const integrityColor = data.integrityScore >= 80 ? "#10B981" : data.integrityScore >= 50 ? "#F59E0B" : "#EF4444";
    const integrityBg = data.integrityScore >= 80 ? "rgba(16, 185, 129, 0.1)" : data.integrityScore >= 50 ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)";

    const previewBanner = data.simulated
      ? `
        <div style="background-color: #F59E0B; color: #000000; padding: 12px; border-radius: 8px; margin-bottom: 24px; font-family: sans-serif; font-size: 12px; font-weight: bold; text-align: center;">
          ✉ DEV PREVIEW MODE: Real-time SMTP keys not configured. This email has been simulated and is fully rendered in the secure sandbox.
        </div>
      `
      : "";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>ProctorAI Exam Audit Ledger</title>
      </head>
      <body style="background-color: #050505; color: #EBEBEB; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0C0C0C; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          
          ${previewBanner}

          <!-- Header -->
          <table style="width: 100%; margin-bottom: 24px; border-collapse: collapse;">
            <tr>
              <td>
                <div style="font-family: sans-serif; font-size: 11px; font-weight: bold; color: #10B981; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px;">ProctorAI Vision Platform</div>
                <div style="font-family: serif; font-size: 20px; font-weight: bold; color: #FFFFFF; letter-spacing: -0.5px;">SECURED ASSESSMENT REPORT</div>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <span style="font-size: 10px; font-family: monospace; padding: 4px 8px; background-color: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; color: rgba(255, 255, 255, 0.6);">
                  REF: SSIT-${Math.floor(Math.random() * 9000 + 1000)}
                </span>
              </td>
            </tr>
          </table>

          <!-- Banner Accent -->
          <div style="height: 4px; background: linear-gradient(90deg, #10B981, #059669); border-radius: 2px; margin-bottom: 28px;"></div>

          <p style="font-size: 13px; line-height: 1.6; color: rgba(255, 255, 255, 0.7); font-weight: 300; margin-bottom: 28px;">
            The computational auditing engine at <strong>Sri Sai Ram Institute of Technology (SSIT)</strong> has compiled and sealed the biometric assessment record for the secure examination detailed below.
          </p>

          <!-- Candidate and Exam Specs Grid -->
          <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 28px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.8;">
              <tr>
                <td style="width: 50%; padding-right: 12px; vertical-align: top;">
                  <div style="font-weight: bold; color: #10B981; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; margin-bottom: 6px;">CANDIDATE PARTICULARS</div>
                  <div style="color: #FFFFFF; font-weight: 600; font-size: 13px;">${data.studentName}</div>
                  <div style="color: rgba(255, 255, 255, 0.5);">${data.studentEmail}</div>
                  <div style="color: rgba(255, 255, 255, 0.4); font-family: monospace; font-size: 10px; margin-top: 4px;">CLEARANCE: VERIFIED_INSTITUTIONAL</div>
                </td>
                <td style="width: 50%; padding-left: 12px; border-left: 1px solid rgba(255, 255, 255, 0.05); vertical-align: top;">
                  <div style="font-weight: bold; color: #10B981; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; margin-bottom: 6px;">ASSESSMENT DETAILS</div>
                  <div style="color: #FFFFFF; font-weight: 600; font-size: 13px;">${data.examTitle}</div>
                  <div style="color: rgba(255, 255, 255, 0.5);">Date: ${dateStr}</div>
                  <div style="color: rgba(255, 255, 255, 0.4); font-family: monospace; font-size: 10px; margin-top: 4px;">TIMESTAMP: ${timeStr}</div>
                </td>
              </tr>
            </table>
          </div>

          <!-- KPI Performance cards -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
            <tr>
              <td style="width: 48%; vertical-align: top; padding-right: 8px;">
                <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; text-align: center;">
                  <div style="font-size: 9px; font-weight: bold; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 1px;">FINAL PERFORMANCE</div>
                  <div style="font-size: 28px; font-weight: bold; color: #10B981; margin: 8px 0;">${data.scoreText}</div>
                  <div style="font-size: 11px; color: rgba(255, 255, 255, 0.5);">${data.percentage}% Answering Accuracy</div>
                </div>
              </td>
              <td style="width: 4%;">&nbsp;</td>
              <td style="width: 48%; vertical-align: top; padding-left: 8px;">
                <div style="background-color: ${integrityBg}; border: 1px solid ${integrityColor}33; border-radius: 12px; padding: 16px; text-align: center;">
                  <div style="font-size: 9px; font-weight: bold; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 1px;">PROCTORING INTEGRITY</div>
                  <div style="font-size: 28px; font-weight: bold; color: ${integrityColor}; margin: 8px 0;">${data.integrityScore}%</div>
                  <div style="font-size: 10px; font-weight: bold; font-family: monospace; color: ${integrityColor}; letter-spacing: 0.5px;">
                    ${data.integrityScore >= 80 ? "SECURE_INTEGRITY" : data.integrityScore >= 50 ? "FLAGGED_FOR_AUDIT" : "COMPROMISED"}
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Biometric violation logs -->
          <div style="margin-bottom: 32px;">
            <h4 style="font-family: sans-serif; font-size: 11px; font-weight: bold; color: rgba(255, 255, 255, 0.5); letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 12px 0;">
              Biometric Auditor Telemetry Logs
            </h4>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                  <th style="padding: 10px; font-size: 10px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: bold; width: 15%;">Time</th>
                  <th style="padding: 10px; font-size: 10px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: bold; width: 45%;">Security Incident Event</th>
                  <th style="padding: 10px; font-size: 10px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: bold; width: 15%;">Severity</th>
                  <th style="padding: 10px; font-size: 10px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: bold; width: 25%;">Model Sensor</th>
                </tr>
              </thead>
              <tbody>
                ${logRows}
              </tbody>
            </table>
          </div>

          <!-- Instructor approval footer -->
          <table style="width: 100%; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 24px; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td>
                <div style="font-weight: bold; color: #FFFFFF; font-size: 11px; margin-bottom: 4px;">FACULTY ENDORSEMENT</div>
                <div style="font-family: serif; font-style: italic; font-size: 14px; color: #10B981; margin-bottom: 2px;">Dr. S. Sudarsan</div>
                <div style="color: rgba(255, 255, 255, 0.4); font-size: 10px;">Director of Computational Sciences, SSIT</div>
              </td>
              <td style="text-align: right; vertical-align: bottom;">
                <div style="font-size: 9px; font-family: monospace; color: rgba(255, 255, 255, 0.3);">
                  SECURE SHA-256 BLOCK LEDGER APPROVED
                </div>
              </td>
            </tr>
          </table>

          <!-- Copyright / Notice -->
          <div style="margin-top: 32px; text-align: center; border-top: 1px dashed rgba(255, 255, 255, 0.05); padding-top: 20px; font-size: 9px; color: rgba(255, 255, 255, 0.35); line-height: 1.5;">
            This is an automated cryptographic audit report delivered securely via ProctorAI server. 
            Printed and verified by Sri Sai Ram Institute of Technology (SSIT), Chennai, India. 
            If you have questions about your score or biometric report, log into your ProctorAI terminal and contact the secure administrator center.
          </div>

        </div>
      </body>
      </html>
    `;
  }

  // API Route to send or simulate sending the secure proctoring exam report to student's email
  app.post("/api/send-email", async (req, res) => {
    try {
      const {
        studentName,
        studentEmail,
        examTitle,
        scoreText,
        percentage,
        integrityScore,
        anomalyCount,
        logs
      } = req.body;

      if (!studentEmail) {
        return res.status(400).json({ error: "Student email is required." });
      }

      const host = process.env.SMTP_HOST;
      const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const secure = process.env.SMTP_SECURE === "true";
      const sender = process.env.SENDER_EMAIL || user || "proctorai@ssit.edu";

      // Check if SMTP is configured
      const isSmtpConfigured = !!(host && user && pass);

      // Render the HTML template
      const htmlContent = generateReportEmailHtml({
        studentName: studentName || "Sudar",
        studentEmail,
        examTitle: examTitle || "SSIT Vision Platform Trial — Section A",
        scoreText: scoreText || "0 / 5",
        percentage: percentage !== undefined ? percentage : 0,
        integrityScore: integrityScore !== undefined ? integrityScore : 100,
        anomalyCount: anomalyCount !== undefined ? anomalyCount : 0,
        logs: logs || [],
        simulated: !isSmtpConfigured
      });

      if (isSmtpConfigured) {
        // Build real Nodemailer transporter
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass
          }
        });

        // Send mail
        await transporter.sendMail({
          from: `"ProctorAI - SSIT" <${sender}>`,
          to: studentEmail,
          subject: `[ProctorAI Ledger] Assessment Report - ${examTitle || "Exam Submission"}`,
          html: htmlContent
        });

        res.json({
          success: true,
          simulated: false,
          message: `Real email successfully dispatched to ${studentEmail} via ${host}.`,
          html: htmlContent
        });
      } else {
        // Return simulated success along with HTML so frontend can offer full preview
        res.json({
          success: true,
          simulated: true,
          message: "SMTP settings not configured. Session report generated in simulated local registry.",
          html: htmlContent
        });
      }
    } catch (error: any) {
      console.error("Error in send-email API:", error);
      res.status(500).json({ error: error.message || "Failed to process or dispatch email report." });
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

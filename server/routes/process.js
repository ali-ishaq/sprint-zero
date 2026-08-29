import { Router } from "express";
import crypto from "crypto";
import multer from "multer";
import pdfParse from "pdf-parse";
import { InMemoryRunner } from "@google/adk";
import { rootPipeline } from "../lib/agents/pipeline.js";
import { getAuthedClient } from "../lib/googleAuth.js";
import { createRun, updateRun } from "../lib/firestore.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { normalizePlan } from "../lib/agents/agentEvents.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/", requireAuth, upload.single("brief"), async (req, res) => {
  const userId = req.user.email;
  const runId = crypto.randomUUID();

  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }

  let teamMembers;
  try {
    teamMembers = JSON.parse(req.body.teamMembers || "[]");
  } catch {
    return res.status(400).json({ error: "Invalid team members format" });
  }

  if (!teamMembers || teamMembers.length === 0) {
    return res.status(400).json({ error: "At least one team member is required" });
  }

  for (const member of teamMembers) {
    if (!member.name?.trim() || !member.role?.trim() || !member.email?.trim()) {
      return res.status(400).json({ error: "All team members must have name, role, and email" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email.trim())) {
      return res.status(400).json({ error: "All emails must be valid" });
    }
  }

  let pdfText;
  try {
    const data = await pdfParse(req.file.buffer);
    pdfText = data.text;
  } catch (err) {
    return res.status(400).json({ error: "Failed to parse PDF" });
  }

  const projectName = req.body.projectName || "Untitled Project";

  try {
    await createRun({
      runId,
      userId,
      projectName,
      status: "running",
      taskCount: 0,
      meetingCount: 0,
    });
  } catch (err) {
    console.error("Failed to create run:", err);
    return res.status(500).json({ error: "Failed to start processing" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const parseEventData = (text) => {
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  try {
    const googleAuth = await getAuthedClient(userId);

    const sessionId = `run-${runId}`;
    const initialState = {
      pdfContent: pdfText,
      teamMembers,
      googleAuth,
      projectName,
    };

    const teamMembersText = teamMembers
      .map((m) => `${m.name} (${m.role}) - ${m.email}`)
      .join("\n");
    const userMessage = `Project Brief:\n${pdfText}\n\nTeam Members:\n${teamMembersText}\n\nProject Name: ${projectName}`;

    const runner = new InMemoryRunner({
      agent: rootPipeline,
      appName: "sprintzero",
    });
    
    await runner.sessionService.createSession({
      appName: "sprintzero",
      userId,
      sessionId,
      state: initialState,
    });

    let finalState = {};
    let hasError = false;

    for await (const event of runner.runAsync({
      userId,
      sessionId,
      newMessage: { parts: [{ text: userMessage }] },
      stateDelta: initialState,
    })) {
      const step = event.author;
      const eventData = event.content?.parts?.[0]?.text;
      const parsedData =
        step === "planner"
          ? normalizePlan(parseEventData(eventData))
          : parseEventData(eventData);
      let status = "progress";

      if (event.actions?.stateDelta) {
        const keys = Object.keys(event.actions.stateDelta);
        if (keys.length > 0) {
          const result = event.actions.stateDelta[keys[0]];
          if (result?.failed) {
            status = "error";
          } else if (result) {
            status = "done";
          }
        }
      }

      sendEvent({
        step,
        status,
        data: parsedData,
        runId,
      });

      if (status === "error" && !hasError) {
        hasError = true;
      }

      if (step === "planner" && eventData) {
        console.log(`[planner][run ${runId}]`, JSON.stringify(parsedData, null, 2));
        finalState.plan = parsedData;
      } else if (step === "sheets" && eventData) {
        finalState.sheetResult = parsedData;
      } else if (step === "calendar" && eventData) {
        finalState.calendarResult = parsedData;
      } else if (step === "email" && eventData) {
        finalState.emailResult = parsedData;
      }
    }

    const plan = finalState.plan;
    const sheetResult = finalState.sheetResult;
    const calendarResult = finalState.calendarResult;
    const emailResult = finalState.emailResult;

    const taskCount = plan?.tasks?.length || 0;
    const meetingCount = plan?.sync_meetings?.length || 0;

    await updateRun(runId, {
      status: hasError ? "error" : "complete",
      taskCount,
      meetingCount,
      sheetUrl: sheetResult?.sheetUrl || null,
      calendarLink: calendarResult?.calendarLink || null,
      emailsSent: emailResult?.sentCount || 0,
      emailsFailed: emailResult?.failedRecipients?.length || 0,
    });

    sendEvent({
      step: "complete",
      status: hasError ? "error" : "complete",
      data: {
        runId,
        projectName,
        taskCount,
        meetingCount,
        sheetUrl: sheetResult?.sheetUrl,
        calendarLink: calendarResult?.calendarLink,
        emailsSent: emailResult?.sentCount,
        emailsFailed: emailResult?.failedRecipients?.length,
        failedRecipients: emailResult?.failedRecipients,
      },
    });
  } catch (err) {
    console.error("Pipeline error:", err);
    try {
      await updateRun(runId, { status: "error" });
    } catch (updateError) {
      console.error("Failed to mark run as errored:", updateError);
    }
    sendEvent({ step: "error", status: "error", data: err.message, runId });
  } finally {
    res.end();
  }
});

export default router;

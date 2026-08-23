import { Router } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { InMemoryRunner } from '@google/adk';
import { rootPipeline } from '../lib/agents/pipeline.js';
import { getAuthedClient } from '../lib/googleAuth.js';
import { createRun, updateRun } from '../lib/firestore.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/process', requireAuth, upload.single('brief'), async (req, res) => {
  const userId = req.user.email;
  const runId = crypto.randomUUID();
  
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }
  
  const teamList = req.body.teamList;
  if (!teamList) {
    return res.status(400).json({ error: 'Team list is required' });
  }
  
  let pdfText;
  try {
    const data = await pdfParse(req.file.buffer);
    pdfText = data.text;
  } catch (err) {
    return res.status(400).json({ error: 'Failed to parse PDF' });
  }
  
  const projectName = req.body.projectName || 'Untitled Project';
  
  await createRun({
    runId,
    userId,
    projectName,
    status: 'running',
    taskCount: 0,
    meetingCount: 0
  });
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  try {
    const googleAuth = await getAuthedClient(userId);
    
    const sessionId = `run-${runId}`;
    const initialState = {
      pdfContent: pdfText,
      teamList: teamList,
      googleAuth,
      projectName
    };
    
    const userMessage = `Project Brief:\n${pdfText}\n\nTeam Members:\n${teamList}\n\nProject Name: ${projectName}`;
    
    const runner = new InMemoryRunner({
      agent: rootPipeline,
      appName: 'sprintzero'
    });
    
    let finalState = {};
    let hasError = false;
    
    for await (const event of runner.runAsync({
      userId,
      sessionId,
      newMessage: { parts: [{ text: userMessage }] },
      stateDelta: initialState
    })) {
      const step = event.author;
      const eventData = event.content?.parts?.[0]?.text;
      let status = 'progress';
      
      if (event.actions?.stateDelta) {
        const keys = Object.keys(event.actions.stateDelta);
        if (keys.length > 0) {
          const result = event.actions.stateDelta[keys[0]];
          if (result?.failed) {
            status = 'error';
          } else if (result) {
            status = 'done';
          }
        }
      }
      
      sendEvent({ step, status, data: eventData ? JSON.parse(eventData) : null, runId });
      
      if (status === 'error' && !hasError) {
        hasError = true;
      }
      
      if (step === 'planner' && eventData) {
        finalState.plan = JSON.parse(eventData);
      } else if (step === 'sheets' && eventData) {
        finalState.sheetResult = JSON.parse(eventData);
      } else if (step === 'calendar' && eventData) {
        finalState.calendarResult = JSON.parse(eventData);
      } else if (step === 'email' && eventData) {
        finalState.emailResult = JSON.parse(eventData);
      }
    }
    
    const plan = finalState.plan;
    const sheetResult = finalState.sheetResult;
    const calendarResult = finalState.calendarResult;
    const emailResult = finalState.emailResult;
    
    const taskCount = plan?.tasks?.length || 0;
    const meetingCount = plan?.sync_meetings?.length || 0;
    
    await updateRun(runId, {
      status: hasError ? 'error' : 'complete',
      taskCount,
      meetingCount,
      sheetUrl: sheetResult?.sheetUrl || null,
      calendarLink: calendarResult?.calendarLink || null,
      emailsSent: emailResult?.sentCount || 0,
      emailsFailed: emailResult?.failedRecipients?.length || 0
    });
    
    sendEvent({
      step: 'complete',
      status: hasError ? 'error' : 'complete',
      data: {
        runId,
        projectName,
        taskCount,
        meetingCount,
        sheetUrl: sheetResult?.sheetUrl,
        calendarLink: calendarResult?.calendarLink,
        emailsSent: emailResult?.sentCount,
        emailsFailed: emailResult?.failedRecipients?.length,
        failedRecipients: emailResult?.failedRecipients
      }
    });
    
  } catch (err) {
    console.error('Pipeline error:', err);
    await updateRun(runId, { status: 'error' });
    sendEvent({ step: 'error', status: 'error', data: err.message, runId });
  } finally {
    res.end();
  }
});

export default router;
import { google } from "googleapis";

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getTaskEmail(task) {
  if (typeof task?.email === "string" && task.email.trim()) {
    const email = task.email.trim();
    if (isValidEmail(email)) return email;
  }
  if (typeof task?.assignee_email === "string" && task.assignee_email.trim()) {
    const email = task.assignee_email.trim();
    if (isValidEmail(email)) return email;
  }
  // Fallback - but this will likely fail delivery
  return task.assignee.toLowerCase().replace(/\s+/g, ".") + "@example.com";
}

function buildEmailBody(assignee, userTasks, userMeetings, sheetUrl, projectName) {
  const taskLines = userTasks
    .map(
      (t) =>
        `- ${t.title} (Due: ${t.due_date}${t.depends_on ? `, Depends on: ${t.depends_on.join(", ")}` : ""})`,
    )
    .join("\n");

  const meetingLines = userMeetings
    .map(
      (m) =>
        `- ${m.meeting_title} on ${m.date} at ${m.time} (Agenda: ${m.agenda})`,
    )
    .join("\n");

  return `Hi ${assignee},

Your tasks for the "${projectName}" project:

${taskLines}

Your meetings:

${meetingLines || 'No meetings scheduled'}

Full project plan: ${sheetUrl}

— SprintZero`;
}

function encodeBase64Url(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function getMeetingEmail(attendee) {
  if (attendee.email && attendee.email.trim()) {
    const email = attendee.email.trim();
    if (isValidEmail(email)) return email;
  }
  if (attendee.name) {
    return attendee.name.toLowerCase().replace(/\s+/g, ".") + "@example.com";
  }
  return null;
}

export async function sendSummaryEmails(tasks, meetings, sheetUrl, auth, projectName = "SprintZero Project") {
  const gmail = google.gmail({ version: "v1", auth });

  const byAssignee = tasks.reduce((acc, task) => {
    const assignee = task.assignee || "Unassigned";
    const email = getTaskEmail(task);
    if (!acc[assignee]) acc[assignee] = { email, tasks: [], meetings: [] };
    acc[assignee].tasks.push(task);
    return acc;
  }, {});

  // Add meetings to each assignee's record
  for (const meeting of meetings) {
    for (const attendee of meeting.attendees || []) {
      const assignee = attendee.name;
      const email = getMeetingEmail(attendee);
      if (!byAssignee[assignee]) {
        byAssignee[assignee] = { email, tasks: [], meetings: [] };
      }
      byAssignee[assignee].meetings.push(meeting);
    }
  }

  let sentCount = 0;
  const failedRecipients = [];
  const sentDetails = [];

  for (const [assignee, record] of Object.entries(byAssignee)) {
    const email = record.email;
    const isRealEmail = isValidEmail(email) && !email.endsWith("@example.com");
    
    console.log(`[Gmail] Preparing email for ${assignee} -> ${email} (real: ${isRealEmail})`);
    console.log(`[Gmail] Tasks: ${record.tasks.length}, Meetings: ${record.meetings.length}`);

    if (!isRealEmail) {
      console.warn(`[Gmail] Skipping ${assignee} - invalid or placeholder email: ${email}`);
      failedRecipients.push(`${assignee} (invalid email: ${email})`);
      continue;
    }

    try {
      const subject = `[${projectName}] Your SprintZero Task Assignments & Meetings`;
      const body = buildEmailBody(assignee, record.tasks, record.meetings, sheetUrl, projectName);

      const message = [`To: ${email}`, `Subject: ${subject}`, "", body].join(
        "\n",
      );

      const encoded = encodeBase64Url(message);

      const result = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encoded },
      });

      console.log(`[Gmail] Sent to ${assignee} (${email}), messageId: ${result.data.id}`);
      sentCount++;
      sentDetails.push({ assignee, email, messageId: result.data.id });
    } catch (err) {
      console.error(`[Gmail] Failed to send email to ${assignee} (${email}):`, err.message);
      failedRecipients.push(`${assignee} (${email})`);
    }
  }

  return { sentCount, failedRecipients, sentDetails, failed: failedRecipients.length > 0 };
}

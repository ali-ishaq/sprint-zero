import { google } from "googleapis";

function getTaskEmail(task) {
  if (typeof task?.email === "string" && task.email.trim()) {
    return task.email.trim();
  }
  if (typeof task?.assignee_email === "string" && task.assignee_email.trim()) {
    return task.assignee_email.trim();
  }
  return task.assignee.toLowerCase().replace(/\s+/g, ".") + "@example.com";
}

function buildEmailBody(assignee, userTasks, userMeetings, sheetUrl) {
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

  return `Hi ${assignee},\n\nYour tasks for this sprint:\n\n${taskLines}\n\nYour meetings:\n\n${meetingLines || 'No meetings scheduled'}\n\nFull project plan: ${sheetUrl}\n\n— SprintZero`;
}

function encodeBase64Url(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function getMeetingEmail(meeting) {
  if (meeting.email && meeting.email.trim()) {
    return meeting.email.trim();
  }
  if (meeting.name) {
    return meeting.name.toLowerCase().replace(/\s+/g, ".") + "@example.com";
  }
  return null;
}

export async function sendSummaryEmails(tasks, meetings, sheetUrl, auth) {
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
      const email = attendee.email || getMeetingEmail(attendee);
      if (!byAssignee[assignee]) {
        byAssignee[assignee] = { email, tasks: [], meetings: [] };
      }
      byAssignee[assignee].meetings.push(meeting);
    }
  }

  let sentCount = 0;
  const failedRecipients = [];

  for (const [assignee, record] of Object.entries(byAssignee)) {
    try {
      const email = record.email;
      const subject = "Your SprintZero Task Assignments & Meetings";
      const body = buildEmailBody(assignee, record.tasks, record.meetings, sheetUrl);

      const message = [`To: ${email}`, `Subject: ${subject}`, "", body].join(
        "\n",
      );

      const encoded = encodeBase64Url(message);

      await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encoded },
      });

      sentCount++;
    } catch (err) {
      console.error(`Failed to send email to ${assignee}:`, err.message);
      failedRecipients.push(assignee);
    }
  }

  return { sentCount, failedRecipients, failed: failedRecipients.length > 0 };
}

import { google } from "googleapis";

function buildEmailBody(assignee, userTasks, sheetUrl) {
  const taskLines = userTasks
    .map(
      (t) =>
        `- ${t.title} (Due: ${t.due_date}${t.depends_on ? `, Depends on: ${t.depends_on.join(", ")}` : ""})`,
    )
    .join("\n");

  return `Hi ${assignee},\n\nYour tasks for this sprint:\n\n${taskLines}\n\nFull project plan: ${sheetUrl}\n\n— SprintZero`;
}

function encodeBase64Url(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendSummaryEmails(tasks, sheetUrl, auth) {
  const gmail = google.gmail({ version: "v1", auth });

  const byAssignee = tasks.reduce((acc, task) => {
    if (!acc[task.assignee]) acc[task.assignee] = [];
    acc[task.assignee].push(task);
    return acc;
  }, {});

  let sentCount = 0;
  const failedRecipients = [];

  for (const [assignee, userTasks] of Object.entries(byAssignee)) {
    try {
      const email =
        assignee.toLowerCase().replace(/\s+/g, ".") + "@example.com";
      const subject = "Your SprintZero Task Assignments";
      const body = buildEmailBody(assignee, userTasks, sheetUrl);

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

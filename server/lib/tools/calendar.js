import { google } from "googleapis";

function parseDateTime(dateStr, timeStr) {
  if (!timeStr) {
    return { date: dateStr };
  }
  return { dateTime: `${dateStr}T${timeStr}:00Z`, timeZone: "UTC" };
}

function nextDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function formatAttendees(attendees) {
  return attendees
    .map((entry) => {
      if (typeof entry === "string") {
        return {
          email: entry.toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
          displayName: entry,
        };
      }

      if (entry && typeof entry === "object") {
        const name = entry.name || entry.displayName || entry.email || "Unknown";
        const email = entry.email || name.toLowerCase().replace(/\s+/g, ".") + "@gmail.com";
        return { email, displayName: name };
      }

      return null;
    })
    .filter(Boolean);
}

export async function createCalendarEvents(tasks, meetings, auth) {
  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = "primary";

  let createdCount = 0;
  let failedCount = 0;

  for (const task of tasks) {
    if (!task || !task.title || !task.due_date) {
      console.warn(
        "Skipping invalid task entry for calendar generation:",
        task,
      );
      continue;
    }

    try {
      const start = parseDateTime(task.start_date || task.due_date);
      if (!start) {
        console.warn(
          `Skipping task ${task.id || task.title}: missing valid date`,
        );
        continue;
      }

      const end = { ...start };
      if (start.dateTime) {
        const endTime = new Date(start.dateTime);
        endTime.setHours(endTime.getHours() + 1);
        end.dateTime = endTime.toISOString();
        end.timeZone = "UTC";
      } else {
        end.date = nextDate(task.due_date);
      }

      const assigneeEmail = task.email || task.assignee_email || task.assignee.toLowerCase().replace(/\s+/g, ".") + "@example.com";

      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `[Task] ${task.title}`,
          description: `Assignee: ${task.assignee}\n${task.description || ""}`,
          start,
          end,
          attendees: [{ email: assigneeEmail, displayName: task.assignee }],
        },
      });
      createdCount++;
    } catch (err) {
      console.error(`Failed to create task event for ${task.id}:`, err.message);
      failedCount++;
    }
  }

  for (const meeting of meetings) {
    if (!meeting || !meeting.date || !meeting.meeting_title) {
      console.warn(
        "Skipping invalid meeting entry for calendar generation:",
        meeting,
      );
      continue;
    }

    try {
      const start = parseDateTime(meeting.date, meeting.time);
      if (!start) {
        console.warn(
          `Skipping meeting ${meeting.meeting_title}: missing valid date`,
        );
        continue;
      }

      const end = { ...start };
      if (start.dateTime) {
        const endTime = new Date(start.dateTime);
        endTime.setHours(endTime.getHours() + 1);
        end.dateTime = endTime.toISOString();
        end.timeZone = "UTC";
      } else {
        end.date = nextDate(meeting.date);
      }

      const attendees = formatAttendees(meeting.attendees);

      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: meeting.meeting_title,
          description: meeting.agenda,
          start,
          end,
          attendees,
          reminders: { useDefault: true },
        },
      });
      createdCount++;
    } catch (err) {
      console.error(`Failed to create meeting event:`, err.message);
      failedCount++;
    }
  }

  const calendarLink = `https://calendar.google.com/calendar/u/0/r`;
  return { calendarLink, createdCount, failedCount, failed: failedCount > 0 };
}

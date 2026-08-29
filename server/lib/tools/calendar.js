import { google } from "googleapis";

function parseDateTime(dateStr, timeStr) {
  if (!dateStr) {
    return null;
  }
  
  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    console.warn(`Invalid date format: ${dateStr}`);
    return null;
  }

  if (!timeStr) {
    return { date: dateStr };
  }

  timeStr = String(timeStr).trim();

  // Handle 12-hour format like "10:00 AM" or "02:30 PM"
  const militaryRegex = /^(\d{1,2}):(\d{2})(:(\d{2}))?\s*(AM|PM)?\s*$/i;
  const match = militaryRegex.exec(timeStr);
  if (!match) {
    console.warn(`Invalid time format: ${timeStr}`);
    return { date: dateStr };
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const seconds = match[4] || "00";
  const meridiem = (match[5] || "").toUpperCase();

  if (meridiem) {
    // 12-hour clock
    if (meridiem === "AM" && hours === 12) hours = 0;
    if (meridiem === "PM" && hours !== 12) hours += 12;
  } else if (hours === 24) {
    // 24-hour clock edge case: "24:00" -> "00:00" next day
    hours = 0;
  }

  if (hours < 0 || hours > 23 || parseInt(minutes, 10) > 59) {
    console.warn(`Invalid time value: ${timeStr}`);
    return { date: dateStr };
  }

  const hh = String(hours).padStart(2, "0");
  const timeWithSeconds = `${hh}:${minutes}:${seconds}`;

  return { dateTime: `${dateStr}T${timeWithSeconds}Z`, timeZone: "UTC" };
}

function nextDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date for nextDate: ${dateStr}`);
    return dateStr;
  }
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

export async function createCalendarEvents(tasks, meetings, auth, projectName = "SprintZero Project") {
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
        const startTime = new Date(start.dateTime);
        if (isNaN(startTime.getTime())) {
          console.warn(`Invalid start dateTime for task ${task.id}: ${start.dateTime}`);
          continue;
        }
        const endTime = new Date(startTime);
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
          summary: `${projectName}: ${task.title}`,
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
        const startTime = new Date(start.dateTime);
        if (isNaN(startTime.getTime())) {
          console.warn(`Invalid start dateTime for meeting ${meeting.meeting_title}: ${start.dateTime}`);
          continue;
        }
        const endTime = new Date(startTime);
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
          summary: `${projectName}: ${meeting.meeting_title}`,
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

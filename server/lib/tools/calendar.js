import { google } from 'googleapis';

function parseDateTime(dateStr, timeStr) {
  if (!timeStr) {
    return { date: dateStr };
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(`${dateStr}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return { dateTime: date.toISOString() };
}

function formatAttendees(names) {
  return names.map(name => ({ email: name.toLowerCase().replace(/\s+/g, '.') + '@example.com', displayName: name }));
}

export async function createCalendarEvents(tasks, meetings, auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const calendarId = 'primary';
  
  let createdCount = 0;
  let failedCount = 0;
  
  for (const task of tasks) {
    try {
      const start = parseDateTime(task.due_date);
      const end = { ...start };
      if (start.dateTime) {
        const endTime = new Date(start.dateTime);
        endTime.setHours(endTime.getHours() + 1);
        end.dateTime = endTime.toISOString();
      }
      
      await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: `[Task] ${task.title}`,
          description: `Assignee: ${task.assignee}\n${task.description || ''}`,
          start,
          end,
          attendees: [{ email: task.assignee.toLowerCase().replace(/\s+/g, '.') + '@example.com', displayName: task.assignee }]
        }
      });
      createdCount++;
    } catch (err) {
      console.error(`Failed to create task event for ${task.id}:`, err.message);
      failedCount++;
    }
  }
  
  for (const meeting of meetings) {
    try {
      const start = parseDateTime(meeting.date, meeting.time);
      const end = { ...start };
      if (start.dateTime) {
        const endTime = new Date(start.dateTime);
        endTime.setHours(endTime.getHours() + 1);
        end.dateTime = endTime.toISOString();
      } else {
        end.date = meeting.date;
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
          reminders: { useDefault: true }
        }
      });
      createdCount++;
    } catch (err) {
      console.error(`Failed to create meeting event:`, err.message);
      failedCount++;
    }
  }
  
  const calendarLink = `https://calendar.google.com/calendar/u/0/r`;
  return { calendarLink, createdCount, failedCount };
}
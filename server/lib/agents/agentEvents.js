import { createEvent, createEventActions } from "@google/adk";

export function resultEvent(
  ctx,
  author,
  resultKey,
  result,
  text = JSON.stringify(result),
) {
  return createEvent({
    author,
    invocationId: ctx.invocationId,
    content: { parts: [{ text }] },
    actions: createEventActions({ stateDelta: { [resultKey]: result } }),
  });
}

export function failureResult(message) {
  return { failed: true, error: message };
}

const SCHEMA_FIELD_TITLES = new Set([
  "id",
  "title",
  "assignee",
  "start_date",
  "due_date",
  "depends_on",
  "description",
  "meeting_title",
  "date",
  "time",
  "attendees",
  "related_task_ids",
  "agenda",
]);

function normalizeTask(task, index = 0) {
  if (typeof task === "string") {
    return {
      id: `task-${index + 1}`,
      title: task,
      assignee: "Unassigned",
      start_date: "",
      due_date: "",
      depends_on: [],
      description: "",
    };
  }

  if (!task || typeof task !== "object") {
    return null;
  }

  const title = typeof task.title === "string" ? task.title.trim() : "";
  if (!title || SCHEMA_FIELD_TITLES.has(title.toLowerCase())) {
    return null;
  }

  return {
    id: task.id || `task-${index + 1}`,
    title,
    assignee: task.assignee || "Unassigned",
    start_date: task.start_date || "",
    due_date: task.due_date || "",
    depends_on: Array.isArray(task.depends_on) ? task.depends_on : [],
    description: task.description || "",
  };
}

function normalizeMeeting(meeting, index = 0) {
  if (!meeting || typeof meeting !== "object") {
    return null;
  }

  return {
    meeting_title: meeting.meeting_title || `Sync ${index + 1}`,
    date: meeting.date || "",
    time: meeting.time || "",
    attendees: Array.isArray(meeting.attendees) ? meeting.attendees : [],
    related_task_ids: Array.isArray(meeting.related_task_ids)
      ? meeting.related_task_ids
      : [],
    agenda: meeting.agenda || "",
  };
}

export function normalizePlan(plan) {
  if (!plan) return { tasks: [], sync_meetings: [] };

  if (Array.isArray(plan)) {
    if (plan.every((item) => typeof item === "string")) {
      return {
        tasks: plan
          .map((item, index) => normalizeTask(item, index))
          .filter(Boolean),
        sync_meetings: [],
      };
    }

    const tasks = plan.flatMap((item) => {
      if (Array.isArray(item?.tasks)) {
        return item.tasks.map((task, index) => normalizeTask(task, index));
      }
      if (item && typeof item === "object") {
        return [normalizeTask(item, 0)].filter(Boolean);
      }
      return [];
    });

    const syncMeetings = plan.flatMap((item) => {
      if (Array.isArray(item?.sync_meetings)) {
        return item.sync_meetings.map((meeting, index) =>
          normalizeMeeting(meeting, index),
        );
      }
      return [];
    });

    return {
      tasks: tasks.filter(Boolean),
      sync_meetings: syncMeetings.filter(Boolean),
    };
  }

  if (Array.isArray(plan.tasks)) {
    return {
      tasks: plan.tasks
        .map((task, index) => normalizeTask(task, index))
        .filter(Boolean),
      sync_meetings: Array.isArray(plan.sync_meetings)
        ? plan.sync_meetings
            .map((meeting, index) => normalizeMeeting(meeting, index))
            .filter(Boolean)
        : [],
    };
  }

  return {
    tasks: [],
    sync_meetings: Array.isArray(plan.sync_meetings)
      ? plan.sync_meetings
          .map((meeting, index) => normalizeMeeting(meeting, index))
          .filter(Boolean)
      : [],
  };
}

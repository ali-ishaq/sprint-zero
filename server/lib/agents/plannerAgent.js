import { LlmAgent } from "@google/adk";
import { z } from "zod";

const PlanSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      assignee: z.string(),
      start_date: z.string(),
      due_date: z.string(),
      depends_on: z.array(z.string()).optional(),
      description: z.string().optional(),
    }),
  ),
  sync_meetings: z.array(
    z.object({
      meeting_title: z.string(),
      date: z.string(),
      time: z.string().optional(),
      attendees: z.array(z.string()),
      related_task_ids: z.array(z.string()).optional(),
      agenda: z.string(),
    }),
  ),
});

export const plannerAgent = new LlmAgent({
  name: "planner",
  model: "gemini-3.5-flash",
  instruction: `You are a technical project manager. Given a project brief and a
    list of team members, produce a work breakdown structure (6-12 tasks, each
    assigned to a specific named team member, with realistic start/due dates)
    and 2-3 sync meetings for tasks that are true dependencies of one another
    (one task's output blocks another's start). Only include attendees actually
    involved in the dependent tasks. For each meeting write a 3-bullet agenda:
    what should be done by that date, what needs to be decided or handed off.
    Return exactly one JSON object with top-level keys "tasks" and
    "sync_meetings". The tasks array must contain 6-12 tasks and the
    sync_meetings array must contain 2-3 meetings. Do not return an array,
    "project_name", or any prose.`,
  outputKey: "plan",
  outputSchema: PlanSchema,
});

import { LlmAgent, zodObjectToSchema } from "@google/adk";
import { z } from "zod";
import { resultEvent } from "./agentEvents.js";

const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  assignee: z.string(),
  email: z.string().email(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  depends_on: z.array(z.string()),
  description: z.string(),
});

const MeetingSchema = z.object({
  meeting_title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string(),
  attendees: z.array(z.object({ name: z.string(), email: z.string().email() })),
  related_task_ids: z.array(z.string()),
  agenda: z.string(),
});

const PlannerOutputSchema = z.object({
  tasks: z.array(TaskSchema),
  sync_meetings: z.array(MeetingSchema),
});

const plannerOutputSchema = zodObjectToSchema(PlannerOutputSchema);

const PLANNER_INSTRUCTION = `You are an expert project planner. Create a detailed Work Breakdown Structure (WBS) and meeting plan for the given project.

TODAY'S DATE: {{todayDate}}

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. ONLY use team members from the provided list below. DO NOT invent names, emails, or roles.
2. Assign each task to the team member whose role BEST fits the task:
   - Frontend/UI tasks → Frontend Developer / Full Stack Developer
   - Backend/API/Database tasks → Backend Developer / Full Stack Developer
   - Design/UI/UX tasks → Designer
   - Testing/QA tasks → QA Engineer
   - Infrastructure/DevOps tasks → DevOps Engineer
   - Data/ML tasks → Data Scientist
   - Management/coordination → Project Manager
   - If no exact match, pick the closest role (e.g., Full Stack for backend if no Backend dev)
3. Generate 3-8 tasks based on project scope
4. PROJECT START DATE: The project MUST start the day AFTER today's date ({{todayDate}}). The first task and kickoff meeting must be scheduled no earlier than the next day. NEVER use past dates.
5. TIMELINE: If the project brief specifies a deadline/timeline, schedule tasks to fit within it. If the brief does NOT specify a timeline, estimate a reasonable project duration based on scope and complexity (e.g., a simple app ~1-2 weeks, a complex system ~3-6 weeks). Space tasks across this duration in chronological order with dependencies (depends_on).
6. Generate 2-4 sync meetings (kickoff, review, handoff, etc.) scheduled within the project duration.
7. Meeting attendees must be from the provided team member list.
8. Use the EXACT email from the team member data.
9. All dates must be in YYYY-MM-DD format and all times in 24-hour format (e.g., "14:00") or 12-hour with AM/PM (e.g., "2:00 PM").
10. All fields are required - no empty strings.

TEAM MEMBERS (use ONLY these people):
{{teamMembersPrompt}}

Output a JSON object with "tasks" and "sync_meetings" arrays.`;

export const plannerAgent = new LlmAgent({
  name: "planner",
  model: "gemini-3.5-flash",
  instruction: PLANNER_INSTRUCTION,
  outputKey: "plan",
  outputSchema: plannerOutputSchema,
});

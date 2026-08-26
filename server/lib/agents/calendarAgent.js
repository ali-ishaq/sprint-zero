import { BaseAgent } from "@google/adk";
import { createCalendarEvents } from "../tools/calendar.js";
import { failureResult, resultEvent } from "./agentEvents.js";

export class CalendarAgent extends BaseAgent {
  constructor() {
    super({ name: "calendar" });
  }

  async *runAsyncImpl(ctx) {
    const plan = ctx.session.state.get("plan");
    const auth = ctx.session.state.get("googleAuth");

    if (!plan || !plan.tasks || !plan.sync_meetings) {
      yield resultEvent(
        ctx,
        this.name,
        "calendarResult",
        failureResult("No plan or meetings found"),
        "No plan or meetings found in session state",
      );
      return;
    }

    try {
      const result = await createCalendarEvents(
        plan.tasks,
        plan.sync_meetings,
        auth,
      );
      yield resultEvent(ctx, this.name, "calendarResult", result);
    } catch (err) {
      yield resultEvent(
        ctx,
        this.name,
        "calendarResult",
        failureResult(err.message),
        err.message,
      );
    }
  }
}

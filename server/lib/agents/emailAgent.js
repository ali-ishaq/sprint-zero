import { BaseAgent } from "@google/adk";
import { sendSummaryEmails } from "../tools/gmail.js";
import { failureResult, normalizePlan, resultEvent } from "./agentEvents.js";

export class EmailAgent extends BaseAgent {
  constructor() {
    super({ name: "email" });
  }

  async *runAsyncImpl(ctx) {
    const plan = normalizePlan(ctx.session.state.plan);
    const sheetResult = ctx.session.state.sheetResult;
    const calendarResult = ctx.session.state.calendarResult;
    const auth = ctx.session.state.googleAuth;
    const projectName = ctx.session.state.projectName || "SprintZero Project";

    if (!plan || !plan.tasks) {
      yield resultEvent(
        ctx,
        this.name,
        "emailResult",
        failureResult("No plan found"),
        "No plan found in session state",
      );
      return;
    }

    if (!sheetResult || sheetResult.failed || !sheetResult.sheetUrl) {
      yield resultEvent(
        ctx,
        this.name,
        "emailResult",
        failureResult("Sheet creation failed"),
        "Sheet creation failed, cannot send emails without sheet URL",
      );
      return;
    }

    // Attach Google Meet links (from the calendar agent) to meetings so
    // recipients can join directly from the email.
    const linkByTitle = (calendarResult?.meetings || []).reduce((acc, m) => {
      if (m.meeting_title && m.meetLink) acc[m.meeting_title] = m.meetLink;
      return acc;
    }, {});
    const meetings = (plan.sync_meetings || []).map((m) => ({
      ...m,
      meetLink: m.meetLink || linkByTitle[m.meeting_title] || null,
    }));

    try {
      const result = await sendSummaryEmails(
        plan.tasks,
        meetings,
        sheetResult.sheetUrl,
        auth,
        projectName,
      );
      yield resultEvent(ctx, this.name, "emailResult", result);
    } catch (err) {
      yield resultEvent(
        ctx,
        this.name,
        "emailResult",
        failureResult(err.message),
        err.message,
      );
    }
  }
}

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
    const auth = ctx.session.state.googleAuth;

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

    try {
      const result = await sendSummaryEmails(
        plan.tasks,
        plan.sync_meetings || [],
        sheetResult.sheetUrl,
        auth,
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

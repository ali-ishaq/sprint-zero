import { BaseAgent } from "@google/adk";
import { createSheet } from "../tools/sheets.js";
import { failureResult, normalizePlan, resultEvent } from "./agentEvents.js";

export class SheetsAgent extends BaseAgent {
  constructor() {
    super({ name: "sheets" });
  }

  async *runAsyncImpl(ctx) {
    const plan = normalizePlan(ctx.session.state.plan);
    const auth = ctx.session.state.googleAuth;

    if (!plan || !plan.tasks) {
      yield resultEvent(
        ctx,
        this.name,
        "sheetResult",
        failureResult("No plan found"),
        "No plan found in session state",
      );
      return;
    }

    try {
      const result = await createSheet(plan.tasks, auth);
      yield resultEvent(ctx, this.name, "sheetResult", result);
    } catch (err) {
      yield resultEvent(
        ctx,
        this.name,
        "sheetResult",
        failureResult(err.message),
        err.message,
      );
    }
  }
}

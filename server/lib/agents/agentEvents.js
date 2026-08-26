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

export function normalizePlan(plan) {
  if (!Array.isArray(plan)) return plan;

  return {
    tasks: plan.flatMap((item) => item?.tasks || []),
    sync_meetings: plan.flatMap((item) => item?.sync_meetings || []),
  };
}

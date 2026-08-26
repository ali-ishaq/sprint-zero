import { createEvent, createEventActions } from "@google/adk";

export function resultEvent(
  ctx,
  author,
  resultKey,
  result,
  text = JSON.stringify(result),
) {
  ctx.session.state.set(resultKey, result);

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

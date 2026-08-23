import { BaseAgent, createEvent, createEventActions } from '@google/adk';
import { createSheet } from '../tools/sheets.js';

export class SheetsAgent extends BaseAgent {
  constructor() {
    super({ name: 'sheets' });
  }

  async *runAsyncImpl(ctx) {
    const plan = ctx.session.state.get('plan');
    const auth = ctx.session.state.get('googleAuth');
    
    if (!plan || !plan.tasks) {
      yield createEvent({
        author: this.name,
        invocationId: ctx.invocationId,
        content: { parts: [{ text: 'No plan found in session state' }] },
        actions: createEventActions({ stateDelta: { sheetResult: { failed: true, error: 'No plan found' } } })
      });
      return;
    }
    
    try {
      const result = await createSheet(plan.tasks, auth);
      ctx.session.state.set('sheetResult', result);
      yield createEvent({
        author: this.name,
        invocationId: ctx.invocationId,
        content: { parts: [{ text: JSON.stringify(result) }] },
        actions: createEventActions({ stateDelta: { sheetResult: result } })
      });
    } catch (err) {
      const errorResult = { failed: true, error: err.message };
      ctx.session.state.set('sheetResult', errorResult);
      yield createEvent({
        author: this.name,
        invocationId: ctx.invocationId,
        content: { parts: [{ text: err.message }] },
        actions: createEventActions({ stateDelta: { sheetResult: errorResult } })
      });
    }
  }
}
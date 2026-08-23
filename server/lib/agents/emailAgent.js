import { BaseAgent, createEvent, createEventActions } from '@google/adk';
import { sendSummaryEmails } from '../tools/gmail.js';

export class EmailAgent extends BaseAgent {
  constructor() {
    super({ name: 'email' });
  }

  async *runAsyncImpl(ctx) {
    const plan = ctx.session.state.get('plan');
    const sheetResult = ctx.session.state.get('sheetResult');
    const auth = ctx.session.state.get('googleAuth');
    
    if (!plan || !plan.tasks) {
      yield createEvent({
        author: this.name,
        invocationId: ctx.invocationId,
        content: { parts: [{ text: 'No plan found in session state' }] },
        actions: createEventActions({ stateDelta: { emailResult: { failed: true, error: 'No plan found' } } })
      });
      return;
    }
    
    if (!sheetResult || sheetResult.failed || !sheetResult.sheetUrl) {
      yield createEvent({
        author: this.name,
        invocationId: ctx.invocationId,
        content: { parts: [{ text: 'Sheet creation failed, cannot send emails without sheet URL' }] },
        actions: createEventActions({ stateDelta: { emailResult: { failed: true, error: 'Sheet creation failed' } } })
      });
      return;
    }
    
    try {
      const result = await sendSummaryEmails(plan.tasks, sheetResult.sheetUrl, auth);
      ctx.session.state.set('emailResult', result);
      yield createEvent({
        author: this.name,
        invocationId: ctx.invocationId,
        content: { parts: [{ text: JSON.stringify(result) }] },
        actions: createEventActions({ stateDelta: { emailResult: result } })
      });
    } catch (err) {
      const errorResult = { failed: true, error: err.message };
      ctx.session.state.set('emailResult', errorResult);
      yield createEvent({
        author: this.name,
        invocationId: ctx.invocationId,
        content: { parts: [{ text: err.message }] },
        actions: createEventActions({ stateDelta: { emailResult: errorResult } })
      });
    }
  }
}
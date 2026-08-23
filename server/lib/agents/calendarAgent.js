import { BaseAgent, createEvent, createEventActions } from '@google/adk';
import { createCalendarEvents } from '../tools/calendar.js';

export class CalendarAgent extends BaseAgent {
  constructor() {
    super({ name: 'calendar' });
  }

  async *runAsyncImpl(ctx) {
    const plan = ctx.session.state.get('plan');
    const auth = ctx.session.state.get('googleAuth');
    
    if (!plan || !plan.tasks || !plan.sync_meetings) {
      yield createEvent({
        author: this.name,
        invocationId: ctx.invocationId,
        content: { parts: [{ text: 'No plan or meetings found in session state' }] },
        actions: createEventActions({ stateDelta: { calendarResult: { failed: true, error: 'No plan or meetings found' } } })
      });
      return;
    }
    
    try {
      const result = await createCalendarEvents(plan.tasks, plan.sync_meetings, auth);
      ctx.session.state.set('calendarResult', result);
      yield createEvent({
        author: this.name,
        invocationId: ctx.invocationId,
        content: { parts: [{ text: JSON.stringify(result) }] },
        actions: createEventActions({ stateDelta: { calendarResult: result } })
      });
    } catch (err) {
      const errorResult = { failed: true, error: err.message };
      ctx.session.state.set('calendarResult', errorResult);
      yield createEvent({
        author: this.name,
        invocationId: ctx.invocationId,
        content: { parts: [{ text: err.message }] },
        actions: createEventActions({ stateDelta: { calendarResult: errorResult } })
      });
    }
  }
}
import { SequentialAgent, ParallelAgent } from '@google/adk';
import { plannerAgent } from './plannerAgent.js';
import { SheetsAgent } from './sheetsAgent.js';
import { CalendarAgent } from './calendarAgent.js';
import { EmailAgent } from './emailAgent.js';

const independentTools = new ParallelAgent({
  name: 'sheets_and_calendar',
  subAgents: [new SheetsAgent(), new CalendarAgent()]
});

export const rootPipeline = new SequentialAgent({
  name: 'sprintzero_pipeline',
  subAgents: [plannerAgent, independentTools, new EmailAgent()]
});
import type { Job, JobType } from "../types/domain.js";

export type JobHandler = (payload: Record<string, unknown>) => Promise<void>;
export type HandlerMap = Partial<Record<JobType, JobHandler>>;

export function makeDispatcher(handlers: HandlerMap) {
  return async function dispatch(job: Job): Promise<void> {
    const handler = handlers[job.type];
    if (!handler) throw new Error(`No handler registered for job type: ${job.type}`);
    await handler(job.payload);
  };
}

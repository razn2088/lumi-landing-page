import type { JobsRepo } from "../db/repositories.js";
import type { JobType } from "../types/domain.js";
import { makeDispatcher, type HandlerMap } from "./dispatcher.js";

export interface TickDeps {
  jobs: JobsRepo;
  workerId: string;
  handlers: HandlerMap;
}

/** Processes at most one job. Returns true if a job was claimed and handled. */
export async function tick(deps: TickDeps): Promise<boolean> {
  const types = Object.keys(deps.handlers) as JobType[];
  const job = await deps.jobs.claim(types, deps.workerId);
  if (!job) return false;

  const dispatch = makeDispatcher(deps.handlers);
  try {
    await dispatch(job);
    await deps.jobs.complete(job.id);
  } catch (e) {
    await deps.jobs.fail(job.id, e instanceof Error ? e.message : String(e));
  }
  return true;
}

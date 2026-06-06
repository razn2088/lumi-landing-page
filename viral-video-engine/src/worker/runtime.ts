import type { JobsRepo } from "../db/repositories.js";
import type { HandlerMap } from "./dispatcher.js";
import { tick } from "./worker.js";

export interface DrainDeps {
  jobs: JobsRepo;
  workerId: string;
  handlers: HandlerMap;
  max?: number;
}

/** Processes jobs until the queue is idle (or `max` jobs handled). Returns how many ran. */
export async function drain(deps: DrainDeps): Promise<number> {
  const max = deps.max ?? 1000;
  let count = 0;
  while (count < max) {
    const ran = await tick({ jobs: deps.jobs, workerId: deps.workerId, handlers: deps.handlers });
    if (!ran) break;
    count++;
  }
  return count;
}

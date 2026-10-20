/**
 * The arithmetic behind the Cloud Run lesson's autoscaling calculator. Little's
 * law gives the requests in flight (rate × latency); dividing by the maximum
 * concurrency gives the fewest instances that can hold them; min and max
 * instances clamp that. Real Cloud Run also keeps CPU near 60%, so it usually
 * runs a few more than this floor.
 */
import type { ScaleInput } from '@/types';

export interface ScalePlan {
  /** Requests being processed at any moment. */
  inflight: number;
  /** Instances the load needs, before min/max. */
  needed: number;
  /** Instances Cloud Run keeps: needed, raised to min, capped at max. */
  running: number;
  /** Of those, the ones serving requests and the ones kept warm by min instances. */
  active: number;
  idle: number;
  /** Requests per second the service can take at max instances. */
  capacityRps: number;
  /** Requests per second over that capacity: they queue, then fail with 429. */
  overflowRps: number;
  /** Nothing running: the next request waits for a cold start. */
  coldStart: boolean;
  /** Open database connections if each instance keeps `pool` of them. */
  connections: number;
  /** More connections than the database accepts. */
  dbOver: boolean;
}

export function scalePlan(i: ScaleInput): ScalePlan {
  const inflight = (i.rps * i.latencyMs) / 1000;
  const needed = i.rps > 0 ? Math.max(1, Math.ceil(inflight / i.concurrency - 1e-9)) : 0;
  const running = Math.min(Math.max(needed, i.min), i.max);
  const active = Math.min(needed, i.max);
  const capacityRps = (i.max * i.concurrency * 1000) / i.latencyMs;
  return {
    inflight,
    needed,
    running,
    active,
    idle: running - active,
    capacityRps,
    overflowRps: Math.max(0, i.rps - capacityRps),
    coldStart: running === 0,
    connections: running * i.pool,
    dbOver: running * i.pool > i.dbMax
  };
}

/** The ranges the calculator accepts — the lesson check holds presets to them too. */
export const SCALE_LIMITS: Record<keyof ScaleInput, [min: number, max: number]> = {
  rps: [0, 20000],
  latencyMs: [10, 60000],
  concurrency: [1, 1000],
  min: [0, 1000],
  max: [1, 1000],
  pool: [0, 100],
  dbMax: [1, 100000]
};

const NAMES: Record<keyof ScaleInput, string> = {
  rps: 'Traffic',
  latencyMs: 'Time per request',
  concurrency: 'Max concurrency',
  min: 'Min instances',
  max: 'Max instances',
  pool: 'DB connections per instance',
  dbMax: 'DB connection limit'
};

export function scaleProblem(i: ScaleInput): string | null {
  for (const [k, [lo, hi]] of Object.entries(SCALE_LIMITS) as [keyof ScaleInput, [number, number]][]) {
    const v = i[k];
    if (!Number.isFinite(v) || v < lo || v > hi) return `${NAMES[k]} must be between ${lo} and ${hi}.`;
  }
  if (i.min > i.max) return 'Min instances cannot be more than max instances.';
  return null;
}

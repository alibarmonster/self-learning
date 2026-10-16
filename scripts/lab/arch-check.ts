/**
 * Consistency check for the architecture lab: every service a slot names
 * exists in the catalog, a slot's answers don't contradict each other, and
 * the key scores 100%. Run with `bun scripts/lab/arch-check.ts`.
 */
import { SERVICE_BY_ID } from '../../src/lab/arch/catalog';
import { ARCH_SCENARIOS, grade } from '../../src/lab/arch/scenarios';

let failed = 0;
const bad = (msg: string) => {
  console.log(`✗ ${msg}`);
  failed++;
};
const ids = new Set<string>();
for (const sc of ARCH_SCENARIOS) {
  if (ids.has(sc.id)) bad(`${sc.id}: duplicate scenario id`);
  ids.add(sc.id);
  const stages = new Set(sc.stages.map((s) => s.id));
  for (const slot of sc.slots) {
    const where = `${sc.id}/${slot.id}`;
    if (!stages.has(slot.stage)) bad(`${where}: unknown stage ${slot.stage}`);
    for (const id of [...slot.best, ...Object.keys(slot.ok ?? {}), ...Object.keys(slot.traps ?? {})])
      if (!SERVICE_BY_ID[id]) bad(`${where}: unknown service ${id}`);
    for (const id of slot.best) {
      if (slot.ok?.[id]) bad(`${where}: ${id} is both best and ok`);
      if (slot.traps?.[id]) bad(`${where}: ${id} is both best and a trap`);
    }
    for (const id of Object.keys(slot.ok ?? {})) if (slot.traps?.[id]) bad(`${where}: ${id} is both ok and a trap`);
  }
  const key = Object.fromEntries(sc.slots.map((s) => [s.id, s.best[0]]));
  const g = grade(sc, key);
  if (g.percent !== 100) bad(`${sc.id}: key scores ${g.percent}%`);
  else console.log(`✓ ${sc.id} (${sc.slots.length} slots)`);
}
if (failed) process.exit(1);

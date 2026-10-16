/**
 * Regression check for the terminal lab: each scenario starts unsolved, and
 * its reference command list runs without an error and completes every task.
 * Run with `bun scripts/lab/term-solutions.ts`.
 */
import { TERM_SCENARIOS } from '../../src/lab/term/scenarios';
import { run } from '../../src/lab/term/run';

let failed = 0;
for (const sc of TERM_SCENARIOS) {
  if (!sc.tasks.length) continue;
  const s = sc.build();
  if (sc.tasks.every((t) => t.check(s))) {
    console.log(`✗ ${sc.id}: already solved at start`);
    failed++;
  }
  let broke = false;
  for (const cmd of sc.solution) {
    const errs = run(s, cmd).filter((l) => l.kind === 'err');
    if (errs.length) {
      console.log(`✗ ${sc.id}: "${cmd}" failed\n    ${errs.map((l) => l.text).join('\n    ')}`);
      broke = true;
      break;
    }
  }
  const open = sc.tasks.filter((t) => !t.check(s));
  if (broke || open.length) {
    failed++;
    if (!broke) console.log(`✗ ${sc.id}: still open — ${open.map((t) => t.label).join('; ')}`);
  } else console.log(`✓ ${sc.id} (${sc.tasks.length} tasks)`);
}
if (failed) process.exit(1);

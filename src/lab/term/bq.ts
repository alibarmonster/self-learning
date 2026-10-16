/**
 * `bq`: datasets, tables, loads from Cloud Storage and queries. Models the
 * three things that trip people up: legacy SQL is the CLI's default, dataset
 * IDs take no hyphens, and data can't move between locations in a load.
 */
import { CliError, needProject, suffix } from './common';
import { bool, flag, parseArgs, type Ctx } from './shell';
import { MULTI_REGIONS, REGIONS, type CloudState, type Dataset, type Project } from './state';
import { findBucket, splitUrl } from './storage';
import type { Out } from './shell';

const BOOLS = new Set(['d', 'dataset', 't', 'table', 'r', 'recursive', 'f', 'force', 'autodetect', 'dry_run', 'replace', 'nouse_legacy_sql', 'use_legacy_sql', 'help', 'h', 'noautodetect']);

export const BQ_COMMANDS = ['mk', 'ls', 'show', 'load', 'query', 'extract', 'rm', 'head', 'help'];

function fail(op: string, msg: string, hint?: string): never {
  throw new CliError(`BigQuery error in ${op} operation: ${msg}`, hint);
}

function normLoc(v: string | undefined): string {
  const up = (v ?? 'US').toUpperCase();
  if (MULTI_REGIONS.includes(up)) return up;
  if (REGIONS.includes(up.toLowerCase())) return up.toLowerCase();
  throw new CliError(`BigQuery error in mk operation: Invalid location '${v}'.`, 'Lokasi dataset: multi-region (US, EU) atau region seperti asia-southeast2.');
}

/** `proj:ds.table`, `ds.table`, `proj.ds.table` → parts. */
function ref(s: CloudState, p: Project, text: string): { project: Project; dataset: string; table?: string } {
  let proj = p.id;
  let rest = text.replace(/`/g, '');
  if (rest.includes(':')) [proj, rest] = rest.split(':');
  const parts = rest.split('.');
  if (parts.length === 3) [proj] = parts.splice(0, 1);
  const project = s.projects.find((x) => x.id === proj);
  if (!project) throw new CliError(`BigQuery error: Access Denied: Project ${proj}: User does not have bigquery.datasets.get permission.`);
  return { project, dataset: parts[0], table: parts[1] };
}

function dataset(s: CloudState, p: Project, op: string, text: string): { ds: Dataset; table?: string; project: Project } {
  const r = ref(s, p, text);
  const ds = r.project.datasets.find((d) => d.id === r.dataset);
  if (!ds) fail(op, `Not found: Dataset ${r.project.id}:${r.dataset}`, 'Buat dataset dulu dengan bq mk --location=… NAMA_DATASET.');
  return { ds: ds!, table: r.table, project: r.project };
}

/** Whether data in `bucketLoc` can be loaded into, or extracted from, a dataset in `dsLoc`. */
function compatible(bucketLoc: string, dsLoc: string): boolean {
  const b = bucketLoc.toLowerCase();
  const d = dsLoc.toLowerCase();
  if (b === d) return true;
  if (d === 'us') return b === 'us' || b.startsWith('us-') || b === 'nam4';
  if (d === 'eu') return b === 'eu' || b.startsWith('europe-') || b === 'eur4';
  // A regional dataset can read from its own region or from a multi-region that contains it.
  if (b === 'us') return d.startsWith('us-');
  if (b === 'eu') return d.startsWith('europe-');
  if (b === 'asia') return d.startsWith('asia-');
  return false;
}

function asciiTable(o: Out, head: string[], rows: (string | number)[][]) {
  const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
  const line = '+' + w.map((x) => '-'.repeat(x + 2)).join('+') + '+';
  const row = (r: (string | number)[]) => '|' + r.map((c, i) => ` ${String(c).padEnd(w[i])} `).join('|') + '|';
  o.out(line, row(head), line, ...rows.map(row), line);
}

function sample(schema: string, n: number): { head: string[]; rows: (string | number)[][] } {
  const cols = schema.split(',').map((c) => c.split(':'));
  const head = cols.map(([name]) => name);
  const rows = Array.from({ length: n }, (_, i) =>
    cols.map(([name, type = 'STRING']) => {
      const t = type.toUpperCase();
      if (/INT|NUMERIC|FLOAT/.test(t)) return (i + 1) * 137 + name.length;
      if (/DATE|TIME/.test(t)) return `2026-10-${String(10 + i).padStart(2, '0')}`;
      if (/BOOL/.test(t)) return i % 2 ? 'true' : 'false';
      return `${name}_${i + 1}`;
    })
  );
  return { head, rows };
}

export function bq({ s, o, words }: Ctx) {
  const a = parseArgs(words, BOOLS);
  const [cmd, ...pos] = a.pos;
  if (!cmd || cmd === 'help' || bool(a, 'help', 'h')) {
    o.out('Python script for interacting with BigQuery.', '', `Perintah di lab ini: ${BQ_COMMANDS.join(', ')}`, '', 'Contoh: bq --location=asia-southeast2 mk -d sales', "        bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM sales.orders'");
    return;
  }
  const p = needProject(s, '(bq)', flag(a, 'project_id'));
  if (!p.services.includes('bigquery.googleapis.com')) fail(cmd, `BigQuery API has not been used in project ${p.number} before or it is disabled.`, 'gcloud services enable bigquery.googleapis.com');

  switch (cmd) {
    case 'mk': {
      const name = pos[0];
      if (!name) fail('mk', 'Missing dataset or table reference.');
      const isTable = bool(a, 't', 'table') || (name.replace(/^[^:]+:/, '').includes('.') && !bool(a, 'd', 'dataset'));
      if (!isTable) {
        const r = ref(s, p, name);
        if (!/^[A-Za-z0-9_]{1,1024}$/.test(r.dataset))
          fail('mk', `Dataset IDs must be alphanumeric (plus underscores) and must be at most 1024 characters long.`, 'Nama dataset BigQuery tidak boleh memakai tanda hubung (-). Pakai underscore: sales_data.');
        if (r.project.datasets.some((d) => d.id === r.dataset)) fail('mk', `Dataset '${r.project.id}:${r.dataset}' already exists.`);
        const loc = normLoc(flag(a, 'location'));
        r.project.datasets.push({ id: r.dataset, location: loc, tables: {} });
        o.out(`Dataset '${r.project.id}:${r.dataset}' successfully created.`);
        if (!flag(a, 'location')) o.info('Petunjuk: tanpa --location dataset dibuat di multi-region US, dan lokasi dataset tidak bisa diubah setelahnya.');
        return;
      }
      const { ds, table, project } = dataset(s, p, 'mk', name);
      if (!table) fail('mk', 'Missing table name.');
      if (ds.tables[table!]) fail('mk', `Table '${project.id}:${ds.id}.${table}' already exists.`);
      const schema = flag(a, 'schema') ?? pos[1];
      if (!schema) fail('mk', 'A schema is required, e.g. name:STRING,amount:NUMERIC.');
      ds.tables[table!] = { schema: schema!, rows: 0 };
      o.out(`Table '${project.id}:${ds.id}.${table}' successfully created.`);
      return;
    }
    case 'ls': {
      if (!pos[0]) {
        if (!p.datasets.length) return;
        o.out('  datasetId', ' -----------', ...p.datasets.map((d) => `  ${d.id}`));
        return;
      }
      const { ds } = dataset(s, p, 'ls', pos[0]);
      const names = Object.keys(ds.tables);
      if (!names.length) return;
      o.table(['tableId', 'type', 'labels', 'time partitioning'], names.map((n) => [n, 'TABLE', '', '']));
      return;
    }
    case 'show': {
      if (!pos[0]) fail('show', 'Missing reference.');
      const { ds, table, project } = dataset(s, p, 'show', pos[0]);
      if (!table) {
        o.out(`Dataset ${project.id}:${ds.id}`, '', '   Last modified           ACLs                 Labels    Type     Max time travel (Hours)', ` 16 Oct 09:41:07   Owners: ${s.account}             DEFAULT   168`, '', `Location: ${ds.location}`);
        return;
      }
      const t = ds.tables[table];
      if (!t) fail('show', `Not found: Table ${project.id}:${ds.id}.${table}`);
      o.out(`Table ${project.id}:${ds.id}.${table}`, '', '   Last modified         Schema                         Total Rows   Total Bytes', ` 16 Oct 09:41:07   ${t.schema.split(',').map((c) => `|- ${c.replace(':', ': ').toLowerCase()}`).join('\n                   ')}   ${t.rows}   ${t.rows * 64}`);
      return;
    }
    case 'load': {
      const [target, source, schemaArg] = pos;
      if (!target || !source) fail('load', 'Usage: bq load [--source_format=CSV] [--autodetect] DATASET.TABLE gs://BUCKET/OBJECT [SCHEMA]');
      const { ds, table } = dataset(s, p, 'load', target);
      if (!table) fail('load', 'Missing table name in destination.');
      const u = splitUrl(source);
      if (!u) fail('load', `Source must be a Cloud Storage URI (gs://…), got '${source}'.`, 'bq load membaca dari Cloud Storage. Upload file lokal dulu dengan gsutil cp.');
      const hit = findBucket(s, u!.bucket);
      if (!hit) fail('load', `Not found: URI ${source}`);
      const names = u!.path.includes('*') ? Object.keys(hit!.bucket.objects).filter((n) => new RegExp(`^${u!.path.replace(/[.]/g, '\\.').replace(/\*/g, '.*')}$`).test(n)) : hit!.bucket.objects[u!.path] ? [u!.path] : [];
      if (!names.length) fail('load', `Not found: URI ${source}`, 'Cek nama objek dengan gsutil ls.');
      if (!compatible(hit!.bucket.location, ds.location))
        fail('load', `Cannot read and write in different locations: source: ${hit!.bucket.location}, destination: ${ds.location}`, 'Bucket sumber dan dataset tujuan harus di lokasi yang sama (atau multi-region yang mencakupnya).');
      const existing = ds.tables[table!];
      const schema = schemaArg ?? flag(a, 'schema') ?? (bool(a, 'autodetect') ? 'order_id:INTEGER,customer:STRING,amount:NUMERIC,order_date:DATE' : existing?.schema);
      if (!schema) fail('load', 'No schema specified on job or table.', 'Tambahkan --autodetect atau skema seperti name:STRING,amount:NUMERIC.');
      const fmt = (flag(a, 'source_format') ?? 'CSV').toUpperCase();
      if (!['CSV', 'NEWLINE_DELIMITED_JSON', 'AVRO', 'PARQUET', 'ORC', 'DATASTORE_BACKUP'].includes(fmt)) fail('load', `Invalid source format ${fmt}.`);
      const rows = names.reduce((n, k) => n + (hit!.bucket.objects[k].rows ?? Math.max(1, Math.round(hit!.bucket.objects[k].size / 60))), 0);
      ds.tables[table!] = { schema: schema!, rows: bool(a, 'replace') || !existing ? rows : existing.rows + rows, source };
      o.out(`Upload complete.`, `Waiting on bqjob_r${suffix(s, 6)}_0000019${suffix(s, 4)}_1 ... (1s) Current status: DONE`);
      return;
    }
    case 'extract': {
      const [source, dest] = pos;
      if (!source || !dest) fail('extract', 'Usage: bq extract DATASET.TABLE gs://BUCKET/OBJECT');
      const { ds, table } = dataset(s, p, 'extract', source);
      const t = table ? ds.tables[table] : undefined;
      if (!t) fail('extract', `Not found: Table ${source}`);
      const u = splitUrl(dest);
      const hit = u && findBucket(s, u.bucket);
      if (!u || !hit) fail('extract', `Not found: URI ${dest}`);
      if (!compatible(hit!.bucket.location, ds.location)) fail('extract', `Cannot read and write in different locations: source: ${ds.location}, destination: ${hit!.bucket.location}`);
      hit!.bucket.objects[u!.path] = { size: t!.rows * 48, storageClass: hit!.bucket.storageClass, rows: t!.rows };
      o.out(`Waiting on bqjob_r${suffix(s, 6)}_1 ... (0s) Current status: DONE`);
      return;
    }
    case 'query': {
      const sql = pos.join(' ').trim();
      if (!sql) fail('query', 'No query string provided.');
      const legacy = !(flag(a, 'use_legacy_sql') === 'false' || bool(a, 'nouse_legacy_sql') || /^#standardSQL/i.test(sql));
      const job = `${p.id}:bqjob_r${suffix(s, 6)}_1`;
      if (legacy && /`|\b[\w-]+\.[\w]+\.[\w]+\b/.test(sql.replace(/'[^']*'/g, '')))
        throw new CliError(
          `Error in query string: Error processing job '${job}': Invalid table name: ${/`[^`]+`/.exec(sql)?.[0] ?? /\b[\w-]+\.[\w]+\.[\w]+\b/.exec(sql)?.[0]}\n[Try using standard SQL (https://cloud.google.com/bigquery/docs/reference/standard-sql/enabling-standard-sql)]`,
          'bq query memakai legacy SQL secara default. Tambahkan --use_legacy_sql=false untuk GoogleSQL (standard SQL).'
        );
      const refs = [...sql.matchAll(/\b(?:FROM|JOIN)\s+(`[^`]+`|\[[^\]]+\]|[\w:.-]+)/gi)].map((m) => m[1].replace(/[[\]`]/g, ''));
      if (!refs.length) fail('query', `Error processing job '${job}': a FROM clause is required in this lab.`);
      let rows = 0;
      let schema = '';
      for (const r of refs) {
        const { ds, table, project } = dataset(s, p, 'query', r);
        const t = table ? ds.tables[table] : undefined;
        if (!t) throw new CliError(`Error in query string: Error processing job '${job}': Not found: Table ${project.id}:${ds.id}.${table ?? ''} was not found in location ${ds.location}`);
        const loc = flag(a, 'location');
        if (loc && normLoc(loc).toLowerCase() !== ds.location.toLowerCase())
          throw new CliError(`BigQuery error in query operation: Not found: Dataset ${project.id}:${ds.id} was not found in location ${normLoc(loc)}`, `Job harus berjalan di lokasi dataset (${ds.location}).`);
        rows += t.rows;
        schema = t.schema;
      }
      const bytes = rows * 64 * Math.max(1, (sql.match(/,/g)?.length ?? 0) + 1);
      if (bool(a, 'dry_run')) {
        s.events.push('bq.dryrun');
        o.out(`Query successfully validated. Assuming the tables are not modified, running this query will process ${bytes} bytes of data.`);
        return;
      }
      s.events.push(legacy ? 'bq.query.legacy' : 'bq.query.standard');
      o.out(`Waiting on bqjob_r${suffix(s, 6)}_1 ... (0s) Current status: DONE`);
      if (/COUNT\s*\(/i.test(sql)) asciiTable(o, ['f0_'], [[rows]]);
      else {
        const lim = Number(/LIMIT\s+(\d+)/i.exec(sql)?.[1] ?? 3);
        const { head, rows: data } = sample(schema, Math.min(lim, rows, 5));
        asciiTable(o, head, data);
      }
      return;
    }
    case 'rm': {
      const name = pos[0];
      if (!name) fail('rm', 'Missing reference.');
      const { ds, table, project } = dataset(s, p, 'rm', name);
      if (table) {
        if (!ds.tables[table]) fail('rm', `Not found: Table ${project.id}:${ds.id}.${table}`);
        delete ds.tables[table];
        return;
      }
      if (Object.keys(ds.tables).length && !bool(a, 'r', 'recursive'))
        fail('rm', `Dataset ${project.id}:${ds.id} is still in use`, 'Dataset masih berisi tabel. Pakai bq rm -r -f DATASET.');
      project.datasets = project.datasets.filter((d) => d !== ds);
      return;
    }
    case 'head': {
      const { ds, table } = dataset(s, p, 'head', pos[0] ?? '');
      const t = table ? ds.tables[table] : undefined;
      if (!t) fail('head', `Not found: Table ${pos[0] ?? ''}`);
      const { head, rows } = sample(t!.schema, Math.min(Number(flag(a, 'n', 'max_rows') ?? 5), t!.rows));
      asciiTable(o, head, rows);
      return;
    }
    default:
      fail(cmd, `Unknown command '${cmd}'.`, `Perintah bq di lab ini: ${BQ_COMMANDS.join(', ')}.`);
  }
}

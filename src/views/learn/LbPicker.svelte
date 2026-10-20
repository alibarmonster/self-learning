<script lang="ts">
  /**
   * The load balancer picker: three questions (two for internal passthrough),
   * then the product Google would point you to — under its current name, with
   * the name it used to have, and what the backends' firewall must allow.
   */
  import { lbPick, lbQuestions, type LbAnswers, type LbQuestion } from '@/lessons/lb';

  let { title }: { title: string } = $props();

  let answers = $state<LbAnswers>({});
  const questions = $derived(lbQuestions(answers));
  const product = $derived(lbPick(answers));

  /** Answering a question clears the ones after it, since they may no longer apply. */
  function answer(q: LbQuestion, value: string) {
    const keys = questions.map((x) => x.key);
    const next: LbAnswers = {};
    for (const k of keys.slice(0, keys.indexOf(q.key))) next[k] = answers[k];
    next[q.key] = value;
    answers = next;
  }

  const FAMILY = { application: 'Application Load Balancer · layer 7 proxy', proxy: 'Proxy Network Load Balancer · layer 4 proxy', passthrough: 'Passthrough Network Load Balancer · layer 4, no proxy' };
</script>

<div class="picker">
  <div class="head">
    <p class="title">{title}</p>
    {#if Object.keys(answers).length}<button class="link" onclick={() => (answers = {})}>start over</button>{/if}
  </div>

  {#each questions as q, i (q.key + i)}
    <fieldset>
      <legend><span class="n mono">{i + 1}</span>{q.q}</legend>
      <div class="choices">
        {#each q.choices as c (c.value)}
          <button class="choice" class:on={answers[q.key] === c.value} aria-pressed={answers[q.key] === c.value} onclick={() => answer(q, c.value)}>
            <strong>{c.label}</strong>
            <span>{c.hint}</span>
          </button>
        {/each}
      </div>
    </fieldset>
  {/each}

  {#if product}
    <div class="result" aria-live="polite">
      <p class="family">{FAMILY[product.family]}</p>
      <p class="name">{product.name}{#if product.preview}<span class="badge">Preview</span>{/if}</p>
      <p class="was">{product.previously ? `Previously: ${product.previously}` : 'A newer product — it had no earlier name'}</p>
      <dl>
        <div><dt>Scheme</dt><dd class="mono">{product.scheme}</dd></div>
        <div><dt>Scope</dt><dd>{product.scope}</dd></div>
        <div><dt>Network tier</dt><dd>{product.tier}</dd></div>
        <div><dt>Protocols</dt><dd>{product.protocols}</dd></div>
        <div><dt>Backend sees</dt><dd>{product.clientIp}</dd></div>
        <div><dt>Backends</dt><dd>{product.backends}</dd></div>
        <div class="wide"><dt>Firewall must allow</dt><dd><ul>{#each product.firewall as f (f)}<li>{f}</li>{/each}</ul></dd></div>
        {#if product.proxyOnlySubnet}<div class="wide"><dt>Proxy-only subnet</dt><dd>{product.proxyOnlySubnet}</dd></div>{/if}
        {#if product.extras}<div class="wide"><dt>Also</dt><dd>{product.extras}</dd></div>{/if}
        <div class="wide"><dt>Good for</dt><dd>{product.useFor}</dd></div>
      </dl>
    </div>
  {/if}
</div>

<style>
  .picker {
    margin-top: 20px;
    padding: 18px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 21px;
    line-height: 1.25;
  }

  .link {
    border: 0;
    background: none;
    padding: 0;
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 3px;
    font: inherit;
    font-size: 13.5px;
  }

  fieldset {
    margin: 16px 0 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }

  legend {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0;
    font-size: 14.5px;
    font-weight: 600;
  }

  .n {
    display: inline-grid;
    place-items: center;
    width: 22px;
    height: 22px;
    background: var(--mint);
    color: #1a1a1a;
    font-size: 12px;
    font-weight: 700;
  }

  .choices {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 6px;
  }

  .choice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    padding: 10px 12px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    text-align: left;
    font-size: 14px;
    line-height: 1.4;
  }

  .choice span {
    font-size: 12.5px;
    color: var(--text-secondary);
  }

  .choice:hover {
    border-color: var(--ink);
  }

  .choice.on {
    border-color: var(--ink);
    background: var(--mint-soft);
    box-shadow: inset 3px 0 0 var(--mint);
  }

  .result {
    margin-top: 18px;
    padding: 16px;
    border-left: 3px solid var(--mint);
    background: var(--bg-elevated);
  }

  .family {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .name {
    margin-top: 4px;
    font-family: var(--font-display);
    font-size: 23px;
    line-height: 1.2;
  }

  .badge {
    margin-left: 8px;
    padding: 2px 7px;
    vertical-align: middle;
    font-family: var(--font);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: 1px solid var(--amber);
    color: var(--amber);
  }

  .was {
    margin-top: 4px;
    font-size: 14px;
    color: var(--text-secondary);
  }

  dl {
    margin: 14px 0 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 18px;
  }

  dl .wide {
    grid-column: 1 / -1;
  }

  dt {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  dd {
    margin: 3px 0 0;
    font-size: 14px;
    line-height: 1.5;
  }

  dd.mono {
    font-size: 13px;
  }

  dd ul {
    margin: 0;
    padding-left: 18px;
  }

  @media (max-width: 640px) {
    dl {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>

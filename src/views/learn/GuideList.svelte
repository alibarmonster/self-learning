<script lang="ts">
  /**
   * One exam guide subsection as a list of considerations. Each opens to what
   * it means, how it is done, how the exam asks about it, and where to go
   * deeper; one button opens or closes them all.
   */
  import type { GuideItem } from '@/types';
  import { fmt } from './inline';

  let { ref, items }: { ref: string; items: GuideItem[] } = $props();

  let open = $state<Record<number, boolean>>({});
  const allOpen = $derived(items.every((_, i) => open[i]));

  function toggleAll() {
    const to = !allOpen;
    open = Object.fromEntries(items.map((_, i) => [i, to]));
  }
</script>

<div class="guide">
  <div class="head">
    <p class="count mono">{items.length} considerations</p>
    <button class="link" onclick={toggleAll}>{allOpen ? 'Close all' : 'Open all'}</button>
  </div>
  <ol>
    {#each items as it, i (it.topic)}
      <li>
        <details bind:open={open[i]}>
          <summary>
            <span class="ref mono">{ref}.{i + 1}</span>
            <span class="topic">{@html fmt(it.topic)}</span>
            <span class="chev" aria-hidden="true">›</span>
          </summary>
          <div class="body">
            <p>{@html fmt(it.what)}</p>
            {#if it.how}<pre class="mini">{it.how.join('\n')}</pre>{/if}
            {#if it.exam}<p class="exam"><span>On the exam</span>{@html fmt(it.exam)}</p>{/if}
            {#if it.see?.length}
              <p class="see">
                <span>Go deeper</span>
                {#each it.see as l, k (l.href)}{#if k}<span class="sep" aria-hidden="true">·</span>{/if}<a href={l.href}>{l.label}</a>{/each}
              </p>
            {/if}
          </div>
        </details>
      </li>
    {/each}
  </ol>
</div>

<style>
  .guide {
    margin-top: 16px;
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--line-strong);
  }

  .count {
    font-size: 12.5px;
    color: var(--text-tertiary);
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

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    border-bottom: 1px solid var(--line);
  }

  summary {
    display: grid;
    grid-template-columns: 3.6em minmax(0, 1fr) auto;
    gap: 10px;
    align-items: baseline;
    padding: 11px 4px;
    cursor: pointer;
    list-style: none;
    font-size: 15px;
    line-height: 1.45;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary:hover .topic {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .ref {
    font-size: 12.5px;
    color: var(--text-tertiary);
  }

  .topic {
    font-weight: 600;
  }

  .chev {
    color: var(--text-tertiary);
    transition: transform var(--dur-micro) var(--ease);
  }

  details[open] .chev {
    transform: rotate(90deg);
  }

  .body {
    padding: 0 4px 14px calc(3.6em + 14px);
    font-size: 15px;
    line-height: 1.65;
  }

  .body :global(code) {
    font-family: var(--font-mono);
    font-size: 0.88em;
    padding: 1px 4px;
    background: var(--bg-sunken);
  }

  pre.mini {
    margin: 10px 0 0;
    padding: 10px 12px;
    overflow-x: auto;
    background: #161614;
    color: #e9e6dd;
    font-family: var(--font-mono);
    font-size: 12.5px;
    line-height: 1.6;
    white-space: pre;
  }

  .exam,
  .see {
    margin-top: 10px;
    font-size: 14px;
  }

  .exam {
    padding: 8px 12px;
    border-left: 3px solid var(--mint);
    background: var(--mint-soft);
  }

  .exam span,
  .see > span:first-child {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .see a {
    color: var(--text);
    text-underline-offset: 3px;
  }

  .sep {
    margin: 0 6px;
    color: var(--text-tertiary);
  }

  @media (max-width: 640px) {
    summary {
      grid-template-columns: 3.2em minmax(0, 1fr) auto;
    }

    .body {
      padding-left: 4px;
    }
  }
</style>

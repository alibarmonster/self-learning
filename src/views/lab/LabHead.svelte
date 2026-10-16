<script lang="ts">
  import type { LabMeta } from '@/lab/types';
  import type { Snippet } from 'svelte';

  let { sc, mode, story, children }: { sc: LabMeta; mode: string; story: string; children?: Snippet } = $props();
</script>

<header class="lab-head">
  <p class="eyebrow">{mode} · {sc.level}</p>
  <h1>{sc.title}</h1>
  <p class="story">{story}</p>
  {#if children}<div class="extra">{@render children()}</div>{/if}
</header>

<style>
  .lab-head {
    max-width: 820px;
    margin: 12px 0 28px;
  }

  h1 {
    margin-top: 10px;
    font-size: var(--type-h2);
    line-height: 1.15;
  }

  .story {
    margin-top: 12px;
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .extra {
    margin-top: 16px;
  }
</style>

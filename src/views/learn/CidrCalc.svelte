<script lang="ts">
  /**
   * Subnet calculator for the networking lesson: type a range, or switch the
   * prefix, and see the locked network bits, the size, and the four addresses
   * Google keeps for itself.
   */
  import { untrack } from 'svelte';
  import { cidrInfo } from '@/lessons/net';

  let { value, note }: { value: string; note?: string } = $props();

  // The lesson gives the starting range; from then on the input is the reader's.
  let input = $state(untrack(() => value));

  const info = $derived(cidrInfo(input));
  const bits = $derived(info.ok ? Number(info.cidr.split('/')[1]) : null);
  const PREFIXES = [29, 28, 26, 24, 22, 20, 16];
  const n = (x: number) => x.toLocaleString('id-ID');

  function setPrefix(p: number) {
    input = `${input.split('/')[0].trim() || '10.0.0.0'}/${p}`;
  }

  const uid = $props.id();
  const id = `cidr-${uid}`;
</script>

<div class="calc">
  <div class="calc-head">
    <label for={id}>Kalkulator subnet</label>
    <input {id} class="mono" bind:value={input} spellcheck="false" autocomplete="off" autocapitalize="off" />
  </div>
  <div class="prefixes" role="group" aria-label="Ganti panjang prefix">
    {#each PREFIXES as p (p)}
      <button class="mono" class:on={bits === p} aria-pressed={bits === p} onclick={() => setPrefix(p)}>/{p}</button>
    {/each}
  </div>

  {#if info.ok && bits !== null}
    <div class="bits" role="img" aria-label={`${bits} bit network dikunci, ${32 - bits} bit host bebas`}>
      {#each { length: 4 } as _, o (o)}
        <span class="octet">
          {#each { length: 8 } as _, k (k)}
            <span class="bit" class:net={o * 8 + k < bits}></span>
          {/each}
        </span>
      {/each}
    </div>
    <p class="legend">
      <span class="sw net" aria-hidden="true"></span>{bits} bit network (dikunci)
      <span class="sw" aria-hidden="true"></span>{32 - bits} bit host → 2<sup>{32 - bits}</sup> = {n(info.total)} alamat
    </p>

    <dl class="facts">
      <div><dt>Rentang</dt><dd class="mono">{info.cidr}</dd></div>
      <div><dt>Netmask</dt><dd class="mono">{info.mask}</dd></div>
      <div><dt>Total alamat</dt><dd>{n(info.total)}</dd></div>
      <div class="hl"><dt>Bisa dipakai VM</dt><dd>{n(info.usable)}</dd></div>
    </dl>

    {#if bits <= 30}
      <ul class="reserved">
        <li><span class="mono">{info.network}</span><span>alamat network</span></li>
        <li><span class="mono">{info.gateway}</span><span>default gateway</span></li>
        <li class="use">
          <span class="mono">{info.usable ? `${info.firstUsable} – ${info.lastUsable}` : 'tidak ada'}</span><span>untuk VM dan resource lain</span>
        </li>
        <li><span class="mono">{info.googleReserved}</span><span>dicadangkan Google</span></li>
        <li><span class="mono">{info.broadcast}</span><span>broadcast</span></li>
      </ul>
    {/if}

    {#if info.normalised}
      <p class="msg warn">Alamat awal rentang ini adalah <span class="mono">{info.network}</span>; saat membuat subnet tulis <span class="mono">{info.cidr}</span>.</p>
    {/if}
    {#if info.subnetProblem}
      <p class="msg warn">{info.subnetProblem}</p>
    {:else}
      <p class="msg ok">Bisa dipakai sebagai rentang primer subnet — asal tidak bertumpuk dengan subnet lain, jaringan yang di-peer, atau jaringan kantor.</p>
    {/if}
  {:else if !info.ok}
    <p class="msg warn">{info.error}</p>
  {/if}

  {#if note}<p class="note">{note}</p>{/if}
</div>

<style>
  .calc {
    margin-top: 20px;
    padding: 18px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
  }

  .calc-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 14px;
  }

  label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  input {
    flex: 1 1 200px;
    min-width: 0;
    padding: 9px 12px;
    font-size: 16px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-control);
    background: var(--bg);
    color: var(--text);
  }

  input:focus {
    outline: 2px solid var(--mint);
    outline-offset: 1px;
    border-color: var(--ink);
  }

  .prefixes {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .prefixes button {
    padding: 4px 9px;
    font-size: 13px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    color: var(--text-secondary);
  }

  .prefixes button:hover {
    border-color: var(--ink);
    color: var(--text);
  }

  .prefixes button.on {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--accent-text);
  }

  .bits {
    margin-top: 16px;
    display: flex;
    gap: 6px;
  }

  .octet {
    flex: 1;
    display: flex;
    gap: 2px;
  }

  .bit {
    flex: 1;
    height: 18px;
    background: var(--mint-soft);
    border: 1px solid var(--line-strong);
  }

  .bit.net {
    background: var(--ink);
    border-color: var(--ink);
  }

  .legend {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 6px;
    font-size: 13.5px;
    color: var(--text-secondary);
  }

  .sw {
    width: 12px;
    height: 12px;
    background: var(--mint-soft);
    border: 1px solid var(--line-strong);
  }

  .sw.net {
    background: var(--ink);
    border-color: var(--ink);
  }

  .sw:not(:first-child) {
    margin-left: 10px;
  }

  .facts {
    margin: 16px 0 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
  }

  .facts div {
    padding: 10px 12px;
    background: var(--surface);
  }

  .facts .hl {
    background: var(--mint-soft);
  }

  dt {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  dd {
    margin: 4px 0 0;
    font-size: 17px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  dd.mono {
    font-size: 15px;
  }

  .reserved {
    list-style: none;
    margin: 14px 0 0;
    padding: 0;
    font-size: 14px;
  }

  .reserved li {
    display: grid;
    grid-template-columns: minmax(0, 15em) minmax(0, 1fr);
    gap: 12px;
    padding: 5px 0;
    border-bottom: 1px solid var(--line);
    color: var(--text-secondary);
  }

  .reserved li.use {
    color: var(--text);
    font-weight: 600;
  }

  .reserved .mono {
    overflow-wrap: anywhere;
  }

  .msg {
    margin-top: 12px;
    padding: 9px 12px;
    font-size: 14px;
    line-height: 1.55;
  }

  .msg.warn {
    background: var(--amber-soft);
  }

  .msg.ok {
    background: var(--green-soft);
  }

  .note {
    margin-top: 12px;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-secondary);
  }

  @media (max-width: 640px) {
    .facts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .reserved li {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
  }
</style>

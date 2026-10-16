/** IPv4 helpers for the network lab: parse, CIDR membership, overlap, allocation. */

export function ipToInt(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

export function intToIp(n: number): string {
  return [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join('.');
}

export interface Cidr {
  base: number;
  bits: number;
  size: number;
}

/** Parses `10.0.0.0/24`; a bare address is a /32. Returns null when malformed. */
export function parseCidr(text: string): Cidr | null {
  const [ip, len = '32'] = text.trim().split('/');
  const n = ipToInt(ip);
  if (n === null || !/^\d{1,2}$/.test(len)) return null;
  const bits = Number(len);
  if (bits > 32) return null;
  const size = 2 ** (32 - bits);
  return { base: n - (n % size), bits, size };
}

export function isValidCidr(text: string): boolean {
  return parseCidr(text) !== null;
}

/** Whether `ip` falls inside `cidr`. */
export function inCidr(ip: string, cidr: string): boolean {
  const n = ipToInt(ip);
  const c = parseCidr(cidr);
  if (n === null || !c) return false;
  return n >= c.base && n < c.base + c.size;
}

export function inAny(ip: string, cidrs: string[]): boolean {
  return cidrs.some((c) => inCidr(ip, c));
}

export function overlaps(a: string, b: string): boolean {
  const x = parseCidr(a);
  const y = parseCidr(b);
  if (!x || !y) return false;
  return x.base < y.base + y.size && y.base < x.base + x.size;
}

/** Normalises `10.0.0.5/24` to `10.0.0.0/24`. */
export function normaliseCidr(text: string): string {
  const c = parseCidr(text);
  return c ? `${intToIp(c.base)}/${c.bits}` : text.trim();
}

/**
 * The next free host address of a subnet. Google Cloud reserves the network
 * address, .1 (the gateway), the second-to-last and the broadcast address,
 * so hosts start at .2.
 */
export function nextHost(cidr: string, taken: string[]): string | null {
  const c = parseCidr(cidr);
  if (!c) return null;
  const used = new Set(taken);
  for (let n = c.base + 2; n < c.base + c.size - 2; n++) {
    const ip = intToIp(n);
    if (!used.has(ip)) return ip;
  }
  return null;
}

/** Usable addresses in a subnet once Google Cloud's four reserved ones are taken out. */
export function usableHosts(cidr: string): number {
  const c = parseCidr(cidr);
  return c ? Math.max(0, c.size - 4) : 0;
}

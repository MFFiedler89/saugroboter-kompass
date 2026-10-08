// Kleiner Client für die Amazon Creators API (Nachfolger der PA-API 5).
// Doku: https://affiliate-program.amazon.com/creatorsapi/docs/en-us/introduction
// Zugangsdaten NIE in den Code schreiben, nur über .env bzw. GitHub Secrets.

import { existsSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile('.env');

const API = 'https://creatorsapi.amazon/catalog/v1';
// EU-Region (gilt für DE), Credential-Version 3.2
const TOKEN_URL = process.env.AMAZON_TOKEN_URL || 'https://api.amazon.co.uk/auth/o2/token';
export const MARKETPLACE = 'www.amazon.de';

export function config() {
  const id = process.env.AMAZON_CREDENTIAL_ID;
  const secret = process.env.AMAZON_CREDENTIAL_SECRET;
  const tag = process.env.AMAZON_PARTNER_TAG;
  const missing = [!id && 'AMAZON_CREDENTIAL_ID', !secret && 'AMAZON_CREDENTIAL_SECRET', !tag && 'AMAZON_PARTNER_TAG'].filter(Boolean);
  if (missing.length) throw new Error(`Fehlende Umgebungsvariablen: ${missing.join(', ')} (siehe .env.example)`);
  return { id, secret, tag };
}

let cached = null;
export async function getToken() {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const { id, secret } = config();
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: id, client_secret: secret, scope: 'creatorsapi::default' }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) throw new Error(`Token-Anfrage fehlgeschlagen (${res.status}): ${JSON.stringify(body)}`);
  cached = { token: body.access_token, exp: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return cached.token;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Amazon drosselt frisch freigeschaltete Konten hart. Deshalb laufen alle
// Aufrufe nacheinander, mit Mindestabstand und wachsender Wartezeit nach 429.
const MIN_GAP_MS = Number(process.env.AMAZON_MIN_GAP_MS || 2500);
const MAX_ATTEMPTS = Number(process.env.AMAZON_MAX_ATTEMPTS || 5);
const GIVE_UP_AFTER = Number(process.env.AMAZON_GIVE_UP_AFTER || 3);
const MAX_WAIT_MS = Number(process.env.AMAZON_MAX_WAIT_MS || 60_000);

let queue = Promise.resolve();
let lastCallEnded = 0;
let exhausted = 0;

export class ThrottledOut extends Error {
  constructor() {
    super('Amazon drosselt alle Anfragen. Entweder ist das Tageskontingent aufgebraucht oder der API-Zugriff ist noch nicht freigeschaltet.');
    this.name = 'ThrottledOut';
  }
}

export const isThrottledOut = () => exhausted >= GIVE_UP_AFTER;

/** Reiht eine Anfrage in die globale Warteschlange ein. */
function schedule(fn) {
  const run = queue.then(async () => {
    const wait = lastCallEnded + MIN_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    try {
      return await fn();
    } finally {
      lastCallEnded = Date.now();
    }
  });
  queue = run.then(() => {}, () => {});
  return run;
}

async function call(operation, payload) {
  if (isThrottledOut()) throw new ThrottledOut();
  return schedule(async () => {
    if (isThrottledOut()) throw new ThrottledOut();
    for (let attempt = 1; ; attempt++) {
      const token = await getToken();
      const res = await fetch(`${API}/${operation}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-marketplace': MARKETPLACE,
        },
        body: JSON.stringify({ marketplace: MARKETPLACE, partnerTag: config().tag, ...payload }),
      });
      if (res.status === 429 && attempt < MAX_ATTEMPTS) {
        const retryAfter = Number(res.headers.get('retry-after'));
        const wait = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : Math.min(MAX_WAIT_MS, MIN_GAP_MS * 2 ** attempt) + Math.floor(Math.random() * 750);
        console.warn(`   ⏳ ${operation}: gedrosselt, warte ${Math.round(wait / 1000)}s (Versuch ${attempt} von ${MAX_ATTEMPTS})`);
        await sleep(wait);
        continue;
      }
      if (res.status === 429) exhausted++;
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`${operation} fehlgeschlagen (${res.status}): ${JSON.stringify(body)}`);
      exhausted = 0;
      return body;
    }
  });
}

const RESOURCES = [
  'itemInfo.title',
  'itemInfo.features',
  'itemInfo.byLineInfo',
  'images.primary.large',
  'offersV2.listings.price',
  'offersV2.listings.availability',
  'offersV2.listings.isBuyBoxWinner',
  'browseNodeInfo.websiteSalesRank',
];

/** Holt bis zu beliebig viele ASINs (intern in 10er-Blöcken). */
export async function getItems(asins) {
  const out = [];
  const errors = [];
  for (let i = 0; i < asins.length; i += 10) {
    const chunk = asins.slice(i, i + 10);
    const body = await call('getItems', { itemIds: chunk, itemIdType: 'ASIN', condition: 'New', resources: RESOURCES });
    const result = body.itemsResult ?? body.itemResults ?? body.ItemsResult ?? {};
    out.push(...(result.items ?? []));
    errors.push(...(body.errors ?? []));
  }
  return { items: out, errors };
}

export async function searchItems(keywords, itemCount = 10, itemPage = 1) {
  const body = await call('searchItems', { keywords, itemCount, itemPage, resources: RESOURCES });
  const result = body.searchResult ?? body.SearchResult ?? {};
  return result.items ?? [];
}

/** Normalisiert ein API-Item auf das, was die Website braucht. */
export function normalize(item) {
  const listings = item.offersV2?.listings ?? [];
  const offer = listings.find((l) => l.isBuyBoxWinner) ?? listings[0];
  const money = offer?.price?.money;
  const img = item.images?.primary?.large;
  const rank = item.browseNodeInfo?.websiteSalesRank;
  return {
    title: item.itemInfo?.title?.displayValue,
    brand: item.itemInfo?.byLineInfo?.brand?.displayValue ?? item.itemInfo?.byLineInfo?.manufacturer?.displayValue,
    features: item.itemInfo?.features?.displayValues ?? [],
    salesRank: rank?.salesRank ?? rank?.SalesRank ?? null,
    amount: typeof money?.amount === 'number' ? money.amount : undefined,
    display: money?.displayAmount ?? (typeof money?.amount === 'number' ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: money.currency || 'EUR' }).format(money.amount) : undefined),
    savingsPercent: offer?.price?.savings?.percentage || undefined,
    availability: offer?.availability?.type,
    image: img?.url ? { url: img.url, width: img.width, height: img.height } : undefined,
    url: item.detailPageURL,
  };
}

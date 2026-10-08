import "server-only";
import { addDays, formatMonthLabel, formatWeekLabel, parseDate, toISO } from "@/lib/format";

/**
 * Synthetic App 1 (warehouse) demo data, in the field shapes of spec §9.3.
 * TODO(spec): replace with the team's real CSVs (app1_warehouse_weekly/monthly.csv)
 * or the backend once it exists. Numbers are seeded, so they are the same on every load.
 */

const DAY_MS = 86400000;

export const DEMO_META = {
  data_start: "2023-09-04",
  data_end: "2026-08-30",
  forecast_start: "2026-08-31",
  current_week_start: "2026-10-05",
  data_age_weeks: 5,
  // TODO(spec): these caps come from the system information once the backend exists.
  max_horizon_weeks: 12,
  max_horizon_months: 6,
  model_version: "2026-10-07-full",
  trained_until: "2026-08-30",
  currency: "AUD",
  revenue_note: "Cashless sales only, at current prices",
};

const WEEKS = 12;
const MONTH_STARTS = ["2026-11-01", "2026-12-01", "2027-01-01", "2027-02-01", "2027-03-01", "2027-04-01"];

const SERVICE_LEVEL = { High: 0.95, Medium: 0.9, Low: 0.8 };
const Z = { 0.95: 1.645, 0.9: 1.2816, 0.8: 0.8416 };
const Z80_BAND = 1.2816; // P10 / P90

const DRINK_BASES = [
  "COCA-COLA", "COCA-COLA ZERO", "FANTA ORANGE", "SPRITE", "PEPSI", "PEPSI MAX", "MOUNT FRANKLIN WATER",
  "POWERADE MOUNTAIN BLAST", "POWERADE BERRY ICE", "RED BULL", "V ENERGY", "MONSTER ENERGY", "GATORADE BLUE",
  "SCHWEPPES LEMON", "LIPTON ICE TEA PEACH", "NESTEA LEMON", "FUZE TEA", "PURA MILK CHOCOLATE", "BUNDABERG GINGER BEER",
  "MINUTE MAID APPLE", "FRUIT JUICE 100% APPLE", "PUMP WATER", "CAPRI SUN", "L&P", "SOLO", "LEMON LIME BITTERS",
  "SPARKLING WATER LEMON", "COCONUT WATER", "COLD BREW COFFEE", "DR PEPPER",
];

const SNACK_BASES = [
  "AERO MINT", "KIT KAT", "MARS BAR", "SNICKERS", "TWIX", "BOUNTY", "CADBURY DAIRY MILK", "CADBURY CARAMELLO",
  "TIM TAM ORIGINAL", "ARNOTTS SHAPES PIZZA", "ARNOTTS CHOC RIPPLE", "SMITHS CHIPS ORIGINAL", "SMITHS CHIPS CHICKEN",
  "SMITHS CHIPS SALT/VINEGAR", "DORITOS CHEESE SUPREME", "DORITOS NACHO", "CCS NACHO CHEESE", "DOUGLAS BARS",
  "NATURAL CONFECTIONERY SNAKES", "ALLEN'S JELLY BEANS", "M&M PEANUT", "M&M CHOCOLATE", "SKITTLES", "STARBURST",
  "NUTRI-GRAIN BAR", "UNCLE TOBY'S MUESLI BAR", "FRUIT TINGLES", "TOBLERONE", "LINDT MILK", "PRINGLES ORIGINAL",
  "PRINGLES SOUR CREAM", "THINS ORIGINAL", "TWISTIES", "CHEEZELS", "BURGER RINGS", "FRITOS", "POPCORN SWEET/SALTY",
  "ROASTED ALMONDS", "TRAIL MIX", "BEEF JERKY", "WRIGLEYS EXTRA", "MENTOS FRESH MINT", "TIC TAC ORANGE",
  "TRIDENT SPEARMINT", "JELLY BABIES", "SOUR WORMS", "CHOC CHIP COOKIE", "OAT & HONEY BAR",
];

function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng) {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/** Seasonal multiplier: drinks peak in the Australian summer, snacks vary less. */
function season(ptype, dateMs) {
  const dayOfYear = (dateMs - Date.UTC(new Date(dateMs).getUTCFullYear(), 0, 1)) / DAY_MS;
  const amplitude = ptype === "Drink" ? 0.2 : 0.06;
  return 1 + amplitude * Math.cos((2 * Math.PI * (dayOfYear - 15)) / 365);
}

function horizonConfidence(startMs, spanDays) {
  const middle = startMs + (spanDays / 2) * DAY_MS;
  const weeksAhead = Math.floor((middle - parseDate(DEMO_META.data_end)) / (7 * DAY_MS)) + 1;
  if (weeksAhead <= 4) return "High";
  if (weeksAhead <= 12) return "Medium";
  return "Planning estimate";
}

function makePeriod({ startISO, label, weeklyMean, weeks, cv, step, price, serviceLevel, confidence, monthly }) {
  const mean = weeklyMean * weeks;
  const sigma = weeklyMean * cv * (1 + 0.04 * step) * Math.sqrt(weeks);
  const p10 = Math.max(0, mean - Z80_BAND * sigma);
  const p90 = mean + Z80_BAND * sigma;
  const minQty = Math.floor(p10);
  const safeQty = Math.ceil(mean + Z[serviceLevel] * sigma);
  return {
    period_start: startISO,
    period_label: label,
    p10: monthly ? null : round2(p10),
    p50: round2(mean),
    p90: round2(p90),
    min_qty: minQty,
    safe_qty: safeQty,
    service_level: serviceLevel,
    revenue_p50: round2(mean * price),
    revenue_p90: round2(p90 * price),
    revenue_min: round2(minQty * price),
    revenue_safe: round2(safeQty * price),
    horizon_confidence: confidence,
  };
}

function buildCatalogue() {
  const names = [];
  for (const base of DRINK_BASES) {
    names.push({ item: `${base} 600ML`, ptype: "Drink" }, { item: `${base} 375ML`, ptype: "Drink" });
  }
  for (const base of SNACK_BASES) {
    names.push({ item: `${base} 45G`, ptype: "Snack/food" }, { item: `${base} 90G`, ptype: "Snack/food" });
  }

  // First pass: popularity and price, so priority can be ranked by sales value.
  const draft = names.map(({ item, ptype }) => {
    const rng = makeRng(hashString(item));
    const popularity = rng();
    const base = 4 + (ptype === "Drink" ? 240 : 190) * Math.pow(popularity, 3);
    const price = round2((ptype === "Drink" ? 3.4 : 2.4) + rng() * (ptype === "Drink" ? 2.6 : 3));
    const cv = 0.12 + rng() * 0.3;
    return { item, ptype, base, price, cv, seed: hashString(`${item}#history`) };
  });

  const ranked = [...draft].sort((a, b) => b.base * b.price - a.base * a.price);
  const totalValue = ranked.reduce((sum, p) => sum + p.base * p.price, 0);
  let running = 0;
  const abc = new Map();
  for (const p of ranked) {
    running += p.base * p.price;
    const share = running / totalValue;
    abc.set(p.item, share <= 0.8 ? "A" : share <= 0.95 ? "B" : "C");
  }

  return draft.map((p) => {
    const letter = abc.get(p.item);
    const priority = letter === "A" ? "High" : letter === "B" ? "Medium" : "Low";
    const xyz = p.cv < 0.22 ? "X" : p.cv < 0.32 ? "Y" : "Z";
    return buildProduct({ ...p, priority, cls: `${letter}${xyz}` });
  });
}

function buildProduct({ item, ptype, base, price, cv, seed, priority, cls }) {
  const serviceLevel = SERVICE_LEVEL[priority];
  const rng = makeRng(seed);
  const currentWeekMs = parseDate(DEMO_META.current_week_start);

  // Last 12 weeks of actual sales, ending the week of 24 Aug 2026.
  const lastHistoryWeek = parseDate("2026-08-24");
  const history = [];
  for (let i = 0; i < 12; i++) {
    const startMs = lastHistoryWeek - (11 - i) * 7 * DAY_MS;
    const units = Math.max(0, Math.round(base * season(ptype, startMs) * Math.exp(gaussian(rng) * cv * 0.7)));
    history.push({ week_start: toISO(startMs), units });
  }

  const weekly = [];
  for (let i = 0; i < WEEKS; i++) {
    const startMs = currentWeekMs + i * 7 * DAY_MS;
    const startISO = toISO(startMs);
    weekly.push(
      makePeriod({
        startISO,
        label: formatWeekLabel(startISO),
        weeklyMean: base * season(ptype, startMs + 3 * DAY_MS),
        weeks: 1,
        cv,
        step: i,
        price,
        serviceLevel,
        confidence: horizonConfidence(startMs, 7),
        monthly: false,
      }),
    );
  }

  const monthly = MONTH_STARTS.map((startISO, i) => {
    const startMs = parseDate(startISO);
    const start = new Date(startMs);
    const days = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
    return makePeriod({
      startISO,
      label: formatMonthLabel(startISO),
      weeklyMean: base * season(ptype, startMs + (days / 2) * DAY_MS),
      weeks: days / 7,
      cv,
      step: 6 + i * 4,
      price,
      serviceLevel,
      confidence: horizonConfidence(startMs, days),
      monthly: true,
    });
  });

  return { item, ptype, priority, class: cls, price_recent: price, history, weekly, monthly };
}

let catalogue;
function getCatalogue() {
  if (!catalogue) catalogue = buildCatalogue();
  return catalogue;
}

/** Full forecast for one product, or null if the name is unknown. */
export function getProduct(item) {
  return getCatalogue().find((p) => p.item === item) ?? null;
}

function slimSeries(periods) {
  return {
    units: periods.map((p) => p.p50),
    rev: periods.map((p) => p.revenue_p50),
    safe: periods.map((p) => p.safe_qty),
    safeRev: periods.map((p) => p.revenue_safe),
  };
}

/** Everything the warehouse dashboard needs, in a compact shape. */
export function getWarehouseDashboard() {
  const products = getCatalogue().map((p) => ({
    item: p.item,
    ptype: p.ptype,
    priority: p.priority,
    class: p.class,
    price: p.price_recent,
    w: slimSeries(p.weekly),
    m: slimSeries(p.monthly),
  }));

  const sample = getCatalogue()[0];
  const weekPeriods = sample.weekly.map((p) => ({ start: p.period_start, label: p.period_label, weeks: 1 }));
  const monthPeriods = sample.monthly.map((p) => {
    const start = new Date(parseDate(p.period_start));
    const days = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
    return {
      start: p.period_start,
      label: p.period_label,
      weeks: days / 7,
      end: addDays(p.period_start, days - 1),
    };
  });

  // Top 5 / bottom 5 by expected units over the default 4-week horizon.
  const byUnits = products
    .map((p) => ({ name: p.item, value: Math.round(p.w.units.slice(0, 4).reduce((a, b) => a + b, 0)) }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value);

  return {
    meta: DEMO_META,
    weekPeriods,
    monthPeriods,
    products,
    bestSellers: byUnits.slice(0, 5),
    leastSellers: byUnits.slice(-5).reverse(),
  };
}

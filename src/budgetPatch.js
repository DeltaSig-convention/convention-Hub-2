/* =====================================================================
   Budget update — Nov 5, 2026
   ---------------------------------------------------------------------
   Brings the Hub budget in line with what is being proposed:
   Foundation budget v6 (Pillar Street, No. 1 Pillar Street, Alcove,
   Saturday experiences, MC split), the Michelle's Closet / Men's
   Wearhouse proposal, and the schedule changes (1899 Society cut,
   bourbon dropped, dance party, off-site undergrad education).

   Like the schedule update, every op finds lines by name, is safe to
   re-run, and nothing is saved until "Apply" is clicked in Admin →
   Budget. Lines with Expense Tracker entries tagged to them are zeroed
   instead of deleted, so no actuals lose their line.
   ===================================================================== */

export const BUDGET_PATCH_ID = "budget-2026-11-05";
export const BUDGET_PATCH_LABEL = "Nov 5, 2026 budget update";

/* Foundation budget v6 (Oct 27, 2026), base case: total money out. */
export const FDN_V6_TOTAL_OUT = 99671;

const norm = (s) => (s || "").toLowerCase();
const rid = (p) => p + Math.random().toString(36).slice(2, 8);
const est = (r) => ((r.quantity > 0 && r.unitCost > 0) ? r.quantity * r.unitCost : (r.estimated || 0));

const line = (over) => ({
  category: "", item: "", attendeeType: "Foundation", entity: "Foundation", description: "",
  quantity: 1, unitCost: 0, estimated: 0, actual: 0, grantable: false, grantPct: 0,
  approval: "Draft", approver: "", scales: false, id: rid("e"), ...over,
});
const money = (amt) => ({ quantity: 1, unitCost: amt, estimated: amt });

/* ---- helpers over the working state {exp, inc, tagged} ---- */
const find = (st, re) => st.exp.find((r) => re.test(norm(r.item)));
const patchLine = (st, re, fn) => {
  const hit = find(st, re);
  if (!hit) return { st, missing: true };
  return { st: { ...st, exp: st.exp.map((r) => r === hit ? { ...r, ...fn(r) } : r) } };
};
const upsert = (st, re, over) => {
  const hit = find(st, re);
  if (hit) return { st: { ...st, exp: st.exp.map((r) => r === hit ? { ...r, ...over } : r) } };
  return { st: { ...st, exp: [...st.exp, line(over)] } };
};
const drop = (st, re, why) => {
  let missing = true;
  const exp = [];
  for (const r of st.exp) {
    if (!re.test(norm(r.item))) { exp.push(r); continue; }
    missing = false;
    if (st.tagged.has(r.id)) exp.push({ ...r, quantity: 0, unitCost: 0, estimated: 0, description: why });
  }
  return { st: { ...st, exp }, missing };
};

const SAT_ADDONS = /wine tasting|justin|cigar/;

const OPS = [
  { n: 1, label: "Pillar Street catering → 459 guests × $95, in-house food stations in the Majestic Foyer",
    run: (st) => patchLine(st, /foundation reception catering|pillar street catering/, () => ({
      item: "Pillar Street Catering (Majestic Foyer food stations)", entity: "Foundation", attendeeType: "Foundation",
      quantity: 459, unitCost: 95, estimated: 43605, scales: false,
      description: "In-house food stations, Majestic Foyer (not off-site). $95/person per Foundation budget v6; Diane + Lana to confirm menu. Counts toward the hotel F&B minimum." })) },
  { n: 2, label: "Pillar Street silent auction vendor → $6,120 (Qtego fee + staff travel)",
    run: (st) => patchLine(st, /^foundation reception$|silent auction/, () => ({
      item: "Pillar Street — Silent auction vendor (Qtego)", entity: "Foundation", ...money(6120),
      description: "Qtego fee ~$4,620 + ~$1,500 staff travel; items donated only. Lever: Givebutter instead saves the full $6,120." })) },
  { n: 3, label: "Pillar Street program build → $5,500 (storefronts, passports, activities)",
    run: (st) => upsert(st, /pillar street — storefronts/, {
      category: "Event Production & General Program Needs", item: "Pillar Street — storefronts, passports & activities",
      ...money(5500), description: "4 pillar storefronts @ $750 ($3,000), passport cards + prizes ($1,000), storefront activities ($1,500). Per Foundation budget v6." }) },
  { n: 4, label: "Paddles → $500",
    run: (st) => patchLine(st, /ribbons ?\/ ?paddles|^paddles/, () => ({ item: "Paddles + donor ribbons", ...money(500) })) },
  { n: 5, label: "AV — Foundation → $6,381 (Pinnacle foyer package, Friday half + evening operator)",
    run: (st) => upsert(st, /^av\b.*foundation|foundation.*\bav\b|av — foundation/, {
      category: "Convention Technology & Digital Infrastructure", item: "AV — Foundation (Pinnacle foyer package, Friday half + evening operator)",
      entity: "Foundation", attendeeType: "Foundation", ...money(6381),
      description: "From the Pinnacle Live quote; Courtney + tax counsel to confirm the allocation." }) },
  { n: 6, label: "Professional MC, Thu–Sat → $3,900 split 50/50 (Fraternity $1,950 · Foundation $1,950)",
    run: (st) => {
      let r = upsert(st, /keynote speaker|professional mc.*fraternity/, {
        category: "Event Production & General Program Needs",
        item: "Professional MC, Thu–Sat (Fraternity 50%)", entity: "Fraternity", attendeeType: "All", scales: false,
        grantable: false, grantPct: 0, ...money(1950), description: "One voice Thu–Sat: fee, 3 nights, airfare ($3,900), split 50/50 with the Foundation. No keynote this year." });
      r = upsert(r.st, /professional mc.*foundation/, {
        category: "Foundation Stewardship & Advancement", item: "Professional MC, Thu–Sat (Foundation 50%)",
        ...money(1950), description: "Foundation half of the $3,900 MC." });
      return r;
    } },
  { n: 7, label: "Remove both 1899 Society lines (event cut)",
    run: (st) => drop(st, /1899 society/, "Cut — 1899 Society event removed (Oct 2026)") },
  { n: 8, label: "Alcove Society Reception & Lunch (Palmetto 7) → $5,000",
    run: (st) => patchLine(st, /alcove/, () => ({ item: "Alcove Society Reception & Lunch (Palmetto 7)", entity: "Foundation",
      ...money(5000), description: "Friday 12:30–2:00, reception into seated lunch. $5,000 per Foundation budget v6; 2025's top-donor event ran $10,000, so watch this once it's a full lunch." })) },
  { n: 9, label: "No. 1 Pillar Street → $4,000 (lounge $1,500 · wall, signage, coffee & water $2,500)",
    run: (st) => {
      let r = patchLine(st, /vip lounge|no\. ?1 pillar street — lounge/, () => ({ item: "No. 1 Pillar Street — lounge furniture & décor", ...money(1500),
        description: "Hotel lounge furniture + rugs and plants, Majestic Foyer, Wed–Sat." }));
      const r2 = patchLine(r.st, /stewardship station|no\. ?1 pillar street — next era/, () => ({ item: "No. 1 Pillar Street — Next Era wall, signage, coffee & water", ...money(2500),
        description: "One printed Next Era wall ($1,000); campaign progress on a screen; morning coffee + water ($1,500)." }));
      return { st: r2.st, missing: r.missing && r2.missing };
    } },
  { n: 10, label: "Saturday experiences → one fixed-cost line $3,924 (wine $2,800 · cigar $1,124); drop Final Night VIP Events",
    run: (st) => {
      let r = upsert(st, /justin baldwin wine tasting|saturday alumni experiences/, {
        category: "Event Production & General Program Needs", item: "Saturday Alumni Experiences — fixed costs (wine + cigar)",
        entity: "Foundation", attendeeType: "Foundation", ...money(3924),
        description: "Wine: Justin honorarium $1,500, screen + mic $800 (only if he presents), tablescape $500. Cigar: Miami Tobacco Traders quote $973.70 + ~$150 ashtrays. Per-guest costs sit on the Income add-ons." });
      return drop(r.st, /final night vip events/, "Replaced by the Saturday Alumni Experiences line");
    } },
  { n: 11, label: "Michelle's Closet → Men's Wearhouse kits $54,206 + Thursday tailoring $3,200 (Foundation fund)",
    run: (st) => {
      let r = patchLine(st, /^michelle'?s closet(?! — tailoring)/, () => ({
        item: "Michelle's Closet — Men's Wearhouse kits (fund cost)", entity: "Foundation", attendeeType: "Students", ...money(54206),
        description: "135 kits @ $464.49 = $62,706, less $100 buy-ins paid at checkout. Base case 50 need-based (range $52.7K–$56.2K). Paid from the Foundation's Michelle's Closet fund; Courtney to confirm balance + billing." }));
      const r2 = upsert(r.st, /michelle'?s closet — tailoring/, {
        category: "Event Production & General Program Needs", item: "Michelle's Closet — tailoring (Thursday)", attendeeType: "Students",
        ...money(3200), description: "~4 tailors × 8 hrs @ $100/hr, Thursday 10–6 only." });
      return { st: r2.st, missing: r.missing };
    } },
  { n: 12, label: "Foundation staff expense ($3,000) and donor thank-yous ($1,200)",
    run: (st) => {
      const r = upsert(st, /foundation staff expense/, { category: "Foundation Stewardship & Advancement", item: "Foundation staff expense", ...money(3000) });
      return upsert(r.st, /thank-?you/, { category: "Foundation Stewardship & Advancement", item: "Donor thank-yous — framed portraits (top 20)",
        quantity: 20, unitCost: 60, estimated: 1200 });
    } },
  { n: 13, label: "Closing Dance Party line (was Final Night Social Activity)",
    run: (st) => patchLine(st, /final night social|dance party/, () => ({ item: "Closing Dance Party (tentative) — DJ & lighting",
      description: "Sat 9–11 PM, Majestic Foyer. Tentative." })) },
  { n: 14, label: "Undergrad Educational Sessions note → off-site Explore/Apply incl. coaches",
    run: (st) => patchLine(st, /^educational sessions/, () => ({ description: "Off-site Explore (Fri) + Apply (Sat) partner fees and 305 Transportation coaches." })) },
  { n: 15, label: "Income add-ons: drop bourbon; wine 34 × $500 (cost $170); add cigar 43 × $250 (cost $14)",
    run: (st) => {
      let add = (st.inc.addons || []).filter((a) => !/bourbon/.test(norm(a.event)));
      const wine = add.find((a) => /wine|justin/.test(norm(a.event)));
      const wineRow = { event: "Wine Tasting — Justin Baldwin (Sat, Palmetto 7)", attendees: 34, cost: 170, price: 500 };
      add = wine ? add.map((a) => a === wine ? { ...a, ...wineRow } : a)
        : [...add, { id: rid("a"), actualAttendees: 0, actualRevenue: 0, ...wineRow }];
      const cig = add.find((a) => /cigar/.test(norm(a.event)));
      const cigRow = { event: "Cigar Rolling — Miami Tobacco Traders (Sat, Magnolia Courtyard)", attendees: 43, cost: 14, price: 250 };
      add = cig ? add.map((a) => a === cig ? { ...a, ...cigRow } : a)
        : [...add, { id: rid("a"), actualAttendees: 0, actualRevenue: 0, ...cigRow }];
      return { st: { ...st, inc: { ...st.inc, addons: add } } };
    } },
  { n: 16, label: "Other Foundation v6 lines (signage, donor gifts, fees, contingency) — fills to the $99,671 v6 total",
    run: (st) => {
      const isMC = (r) => /michelle/.test(norm(r.item));
      const isPlug = (r) => /foundation budget v6 — other lines/.test(norm(r.item));
      const satVar = (st.inc.addons || []).filter((a) => SAT_ADDONS.test(norm(a.event))).reduce((s, a) => s + a.attendees * a.cost, 0);
      const itemized = st.exp.filter((r) => r.entity === "Foundation" && !isMC(r) && !isPlug(r)).reduce((s, r) => s + est(r), 0);
      const plug = Math.max(0, Math.round(FDN_V6_TOTAL_OUT - itemized - satVar));
      return upsert(st, /foundation budget v6 — other lines/, {
        category: "Foundation Stewardship & Advancement", item: "Foundation budget v6 — other lines (signage, donor gifts, fees, contingency)",
        ...money(plug), description: "Brings Foundation spend (excluding Michelle's Closet, including Saturday per-guest costs) to the v6 base total of $99,671. Replace with itemized lines from Foundation_Convention_Budget_2027_v6.xlsx." });
    } },
  { n: 17, label: "Foundation Reimbursement = Foundation-tagged costs − Saturday add-on surplus",
    run: (st) => {
      const fdn = st.exp.filter((r) => r.entity === "Foundation").reduce((s, r) => s + est(r), 0);
      const satSurplus = (st.inc.addons || []).filter((a) => SAT_ADDONS.test(norm(a.event))).reduce((s, a) => s + a.attendees * (a.price - a.cost), 0);
      const amt = Math.round(fdn - satSurplus);
      const other = st.inc.other || [];
      const hit = other.find((o) => /foundation reimbursement/.test(norm(o.label)));
      const row = { budgeted: amt, note: "Foundation-tagged costs minus Saturday wine/cigar surplus (ticket revenue is the Foundation's)" };
      const next = hit ? other.map((o) => o === hit ? { ...o, ...row } : o)
        : [...other, { id: rid("o"), label: "Foundation Reimbursement", actual: 0, ...row }];
      return { st: { ...st, inc: { ...st.inc, other: next } } };
    } },
];

const sig = (st) => JSON.stringify({
  e: st.exp.map(({ id, ...r }) => r),
  a: (st.inc.addons || []).map(({ id, ...r }) => r),
  o: (st.inc.other || []).map(({ id, ...r }) => r),
});

/* est: optional estimator (e.g. App's effEstimated with settings) used only for the summary. */
export function previewBudgetPatch(expenses, income, tracker, estimator = est) {
  let st = { exp: expenses || [], inc: income || {}, tagged: new Set((tracker || []).map((t) => t.budgetLineId).filter(Boolean)) };
  const log = [];
  for (const op of OPS) {
    const before = sig(st);
    const res = op.run(st);
    const changed = sig(res.st) !== before;
    log.push({ n: op.n, label: op.label, status: changed ? "change" : res.missing ? "not found" : "already done" });
    st = res.st;
  }
  const expTotal = (list) => list.reduce((s, r) => s + estimator(r), 0);
  const addonNet = (inc) => (inc.addons || []).reduce((s, a) => s + a.attendees * (a.price - a.cost), 0);
  const otherTot = (inc) => (inc.other || []).reduce((s, o) => s + (o.budgeted || 0), 0);
  const dExp = expTotal(st.exp) - expTotal(expenses || []);
  const dInc = (addonNet(st.inc) + otherTot(st.inc)) - (addonNet(income || {}) + otherTot(income || {}));
  return { nextExpenses: st.exp, nextIncome: st.inc, log, pending: log.filter((l) => l.status === "change").length,
    delta: { expense: dExp, income: dInc, net: dInc - dExp } };
}

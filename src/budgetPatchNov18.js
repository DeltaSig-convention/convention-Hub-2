/* =====================================================================
   Budget update — Nov 18, 2026 (grantability per tax counsel)
   ---------------------------------------------------------------------
   Per John Christopher (tax counsel), 11/17/26. Same mechanics as the
   earlier patches: ops find lines by name, are safe to re-run, and nothing
   is saved until "Apply" in Admin → Budget. Shows only after the Nov 10
   budget update has been applied.

   1. Every line gets a grant tier: "Direct-Ed" (100%), "UG-Shared"
      (× the UG-Shared rate setting, default 50%) or "Non-grantable" (0%).
      Staff time counts only on lines flagged time-tracked.
   2. Tags the counsel's Direct-Ed and UG-Shared lines; everything else is
      set Non-grantable. Direct-Ed lines that don't exist yet are added at
      $0 so their quotes have a home (carve them out of "Educational
      Sessions" / "AV - Fraternity" as they land — don't double count).
   3. Adds "Staff Ed Time" ($0, Direct-Ed, needs daily time records).
   4. Adds "Direct Mail – Alumni Registration Drive" ($3,000, Fraternity).

   Income is NOT changed. The Foundation reimbursement vs. grantable
   comparison is a read-only display in App.jsx.
   ===================================================================== */

export const BUDGET_PATCH_ID = "budget-2026-11-18";
export const BUDGET_PATCH_LABEL = "Nov 18, 2026 budget update (grantability per tax counsel)";

export const GRANT_TIERS = ["Direct-Ed", "UG-Shared", "Non-grantable"];

const norm = (s) => (s || "").toLowerCase();
const rid = (p) => p + Math.random().toString(36).slice(2, 8);
const est = (r) => ((r.quantity > 0 && r.unitCost > 0) ? r.quantity * r.unitCost : (r.estimated || 0));
const money = (amt) => ({ quantity: 1, unitCost: amt, estimated: amt, scales: false });

/* Legacy grantable/grantPct are kept in step for anything still reading them. */
const tierFields = (tier) => ({
  grantTier: tier,
  grantable: tier !== "Non-grantable",
  grantPct: tier === "Direct-Ed" ? 100 : tier === "UG-Shared" ? 50 : 0,
});

const line = (over) => ({
  category: "", item: "", attendeeType: "All", entity: "Fraternity", description: "",
  quantity: 1, unitCost: 0, estimated: 0, actual: 0, ...tierFields("Non-grantable"),
  staffTime: false, timeTracked: false,
  approval: "Draft", approver: "", scales: false, id: rid("e"), ...over,
});

const find = (st, re) => st.exp.find((r) => re.test(norm(r.item)));
/* If the line already exists, only its grant fields are touched — amounts, notes and names someone
   has edited are left alone, so a re-run never fights a manual change. */
const GRANT_KEYS = ["grantTier", "grantable", "grantPct", "staffTime"];
const upsert = (st, re, over) => {
  const hit = find(st, re);
  if (hit) {
    const next = Object.fromEntries(GRANT_KEYS.filter((k) => k in over).map((k) => [k, over[k]]));
    return { st: { ...st, exp: st.exp.map((r) => r === hit ? { ...r, ...next } : r) } };
  }
  return { st: { ...st, exp: [...st.exp, line(over)] } };
};
const tag = (st, test, tier, extra = {}) => {
  let missing = true;
  const exp = st.exp.map((r) => {
    if (!test(r)) return r;
    missing = false;
    return { ...r, ...tierFields(tier), ...extra };
  });
  return { st: { ...st, exp }, missing };
};

const ED_CAT = "Event Production & General Program Needs";
const TECH_CAT = "Convention Technology & Digital Infrastructure";
const ED_NOTE = "Amount TBD. When the quote lands, enter it here and take the same amount out of “Educational Sessions” so it isn't counted twice.";
const AV_NOTE = "Amount TBD. When Pinnacle splits out the education-breakout AV, enter it here and take the same amount out of “AV - Fraternity”.";

/* Counsel's Direct-Ed lines. `re` matches existing names; `item` is the name used if the line is added. */
const DIRECT_ED = [
  { re: /^educational sessions/, existing: true,
    note: "Direct-Ed envelope for the off-site Explore/Apply blocks. Split into the UG Ed lines below as quotes land." },
  { re: /^ug ed — friday explore/, item: "UG Ed — Friday Explore program (Museum of Discovery & Science)", cat: ED_CAT, note: ED_NOTE },
  { re: /^ug ed — saturday service/, item: "UG Ed — Saturday service project supplies (HandsOn South Florida)", cat: ED_CAT, note: ED_NOTE },
  { re: /^ug ed — education facilitators/, item: "UG Ed — Education facilitators + roundtable presenters", cat: ED_CAT, note: ED_NOTE },
  { re: /^ug ed — undergrad buses/, item: "UG Ed — Undergrad buses (305 Transportation)", cat: ED_CAT, note: ED_NOTE },
  { re: /^ug ed — palmetto breakout/, item: "UG Ed — Palmetto breakout room rental (education sessions)", cat: ED_CAT, note: ED_NOTE },
  { re: /^ug ed — pinnacle live av/, item: "UG Ed — Pinnacle Live AV, education breakouts", cat: TECH_CAT, note: AV_NOTE },
];
const isDirectEd = (r) => DIRECT_ED.some((d) => d.re.test(norm(r.item))) || /^staff ed time/.test(norm(r.item));

/* Counsel's UG-Shared lines: all Undergraduate Travel Expense lines (hotel room nights, meals, stipends). */
const isUgShared = (r) => /^undergraduate travel/i.test(r.category || "") ||
  /meal stipend|undergrad(uate)? (hotel|room night|meal)/.test(norm(r.item));

const OPS = [
  { n: 1, label: "Direct-Ed (100%): Educational Sessions + six undergrad education lines (new ones added at $0)",
    run: (st) => {
      let cur = st;
      for (const d of DIRECT_ED) {
        if (d.existing) { cur = tag(cur, (r) => d.re.test(norm(r.item)), "Direct-Ed").st; continue; }
        cur = upsert(cur, d.re, { category: d.cat, item: d.item, attendeeType: "Students", entity: "Fraternity",
          description: d.note, ...money(0), ...tierFields("Direct-Ed") }).st;
      }
      return { st: cur };
    } },
  { n: 2, label: "UG-Shared (50%): Undergraduate Travel — hotel room nights and meals",
    run: (st) => tag(st, isUgShared, "UG-Shared") },
  { n: 3, label: "Add “Staff Ed Time” — $0, Direct-Ed, counts only once daily time records exist",
    run: (st) => upsert(st, /^staff ed time/, {
      category: "Staff & Volunteer Operations", item: "Staff Ed Time", attendeeType: "Students", entity: "Fraternity",
      description: "Requires daily time records. Leave at $0 until the records process exists, then tick “time-tracked”.",
      ...money(0), ...tierFields("Direct-Ed"), staffTime: true, timeTracked: false }) },
  { n: 4, label: "Add “Direct Mail – Alumni Registration Drive” — $3,000, Fraternity, Non-grantable",
    run: (st) => upsert(st, /^direct mail – alumni registration drive/, {
      category: "Marketing, Media & Promotions", item: "Direct Mail – Alumni Registration Drive", attendeeType: "Alumni", entity: "Fraternity",
      description: "2 drops (~700 pcs each): Jan 19 launch + spring reminder. Pledgemine @ $1.04/unit, billed to Fraternity (not Foundation contract). Track w/ unique QR/promo code.",
      ...money(3000), ...tierFields("Non-grantable") }) },
  { n: 5, label: "Everything else → Non-grantable (ICA, Bond Eternal, receptions, banquet, alumni lines, Pillar Street, marketing, Michelle's Closet)",
    run: (st) => tag(st, (r) => !isDirectEd(r) && !isUgShared(r) &&
      (r.grantTier !== "Non-grantable" || r.grantable || r.grantPct), "Non-grantable") },
];

const sig = (st) => JSON.stringify({ e: st.exp.map(({ id, ...r }) => r) });

export function previewBudgetPatch(expenses, income, tracker, estimator = est) {
  let st = { exp: expenses || [], inc: income || {} };
  const log = [];
  for (const op of OPS) {
    const before = sig(st);
    const res = op.run(st);
    const changed = sig(res.st) !== before;
    log.push({ n: op.n, label: op.label, status: changed ? "change" : res.missing ? "not found" : "already done" });
    st = res.st;
  }
  const expTotal = (list) => list.reduce((s, r) => s + estimator(r), 0);
  const dExp = expTotal(st.exp) - expTotal(expenses || []);
  return { nextExpenses: st.exp, nextIncome: st.inc, log, pending: log.filter((l) => l.status === "change").length,
    delta: { expense: dExp, income: 0, net: -dExp } };
}

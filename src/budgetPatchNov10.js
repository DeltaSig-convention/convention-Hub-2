/* =====================================================================
   Budget update — Nov 10, 2026 (Housing meeting)
   ---------------------------------------------------------------------
   Same mechanics as src/budgetPatch.js: ops find lines by name, are safe
   to re-run, and nothing is saved until "Apply" in Admin → Budget.
   Shows only after the Nov 5 budget update has been applied.

   Deliberately NOT included (still being decided, final by Jan 19):
   Saturday wine/cigar pricing, catering per-person, 1899 event, Michelle's
   Closet. Those wait for Phil/Justin and the Foundation team's numbers.
   ===================================================================== */

export const BUDGET_PATCH_ID = "budget-2026-11-10";
export const BUDGET_PATCH_LABEL = "Nov 10, 2026 budget update (Housing)";

const norm = (s) => (s || "").toLowerCase();
const rid = (p) => p + Math.random().toString(36).slice(2, 8);
const est = (r) => ((r.quantity > 0 && r.unitCost > 0) ? r.quantity * r.unitCost : (r.estimated || 0));
const money = (amt) => ({ quantity: 1, unitCost: amt, estimated: amt, scales: false });

const line = (over) => ({
  category: "", item: "", attendeeType: "All", entity: "Housing", description: "",
  quantity: 1, unitCost: 0, estimated: 0, actual: 0, grantable: false, grantPct: 0,
  approval: "Draft", approver: "", scales: false, id: rid("e"), ...over,
});

const find = (st, re) => st.exp.find((r) => re.test(norm(r.item)));
const upsert = (st, re, over) => {
  const hit = find(st, re);
  if (hit) return { st: { ...st, exp: st.exp.map((r) => r === hit ? { ...r, ...over } : r) } };
  return { st: { ...st, exp: [...st.exp, line(over)] } };
};

const OPS = [
  { n: 1, label: "Add Housing Experience + History Library room build → $5,000 (Housing pays; NHC reimburses from FY28)",
    run: (st) => upsert(st, /^housing experience/, {
      category: "Event Production & General Program Needs", item: "Housing Experience + History Library — room build (Palmetto 11)",
      entity: "Housing", attendeeType: "All", ...money(5000),
      description: "Convention's $5K line for the combined room; NHC reimburses it from FY28, so it nets to $0. Full build target $10–12K is sponsor/in-kind funded (Liz, Mark Kittenbrink, CSL; Lauren). Lookbook furniture returns to HQ after convention." }) },
  { n: 2, label: "History Library line → archive display inside the Housing Experience room (stays $1,000, Fraternity)",
    run: (st) => {
      const hit = find(st, /^history library/);
      if (!hit) return { st, missing: true };
      return { st: { ...st, exp: st.exp.map((r) => r !== hit ? r : { ...r,
        item: "History Library — archive display (in the Housing Experience room)",
        description: r.description || "Museum/archive pieces for the combined Housing Experience + History Library room (Palmetto 11)." }) } };
    } },
  { n: 3, label: "Income → Housing Corp Reimbursement = all Housing-tagged lines (nets Housing to $0)",
    run: (st) => {
      const amt = Math.round(st.exp.filter((r) => r.entity === "Housing").reduce((s, r) => s + est(r), 0));
      const other = st.inc.other || [];
      const hit = other.find((o) => /housing/.test(norm(o.label)));
      const row = { budgeted: amt, note: "All Housing-tagged costs, incl. the $5K Housing Experience line (NHC reimburses from FY28)" };
      const next = hit ? other.map((o) => o === hit ? { ...o, ...row } : o)
        : [...other, { id: rid("o"), label: "Housing Corp Reimbursement", actual: 0, ...row }];
      return { st: { ...st, inc: { ...st.inc, other: next } } };
    } },
];

const sig = (st) => JSON.stringify({
  e: st.exp.map(({ id, ...r }) => r),
  o: (st.inc.other || []).map(({ id, ...r }) => r),
});

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
  const addonNet = (inc) => (inc.addons || []).reduce((s, a) => s + a.attendees * (a.price - a.cost), 0);
  const otherTot = (inc) => (inc.other || []).reduce((s, o) => s + (o.budgeted || 0), 0);
  const dExp = expTotal(st.exp) - expTotal(expenses || []);
  const dInc = (addonNet(st.inc) + otherTot(st.inc)) - (addonNet(income || {}) + otherTot(income || {}));
  return { nextExpenses: st.exp, nextIncome: st.inc, log, pending: log.filter((l) => l.status === "change").length,
    delta: { expense: dExp, income: dInc, net: dInc - dExp } };
}

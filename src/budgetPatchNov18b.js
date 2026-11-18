/* =====================================================================
   Budget update — Nov 18, 2026 (b): follow-up to the counsel patch
   ---------------------------------------------------------------------
   The first Nov 18 upload was applied before its undergrad-travel step
   was added, so this carries that step on its own:
   - The Fraternity no longer pays undergrad travel. Any airfare line in
     the old "Undergraduate Travel Expense" category is removed (zeroed if
     it has tracked actuals) and the category is renamed
     "Undergraduate Delegate Hotel & Meals". Hotel + meals stay UG-Shared.
   Safe to re-run; nothing is saved until "Apply" in Admin → Budget.
   ===================================================================== */

export const BUDGET_PATCH_ID = "budget-2026-11-18b";
export const BUDGET_PATCH_LABEL = "Nov 18, 2026 follow-up (undergrad hotel & meals category)";

const norm = (s) => (s || "").toLowerCase();
const est = (r) => ((r.quantity > 0 && r.unitCost > 0) ? r.quantity * r.unitCost : (r.estimated || 0));
const UG_CAT = "Undergraduate Delegate Hotel & Meals";

const OPS = [
  { n: 1, label: "Remove any undergrad airfare line; rename “Undergraduate Travel Expense” → “Undergraduate Delegate Hotel & Meals”",
    run: (st) => {
      let missing = true;
      const exp = [];
      for (const r of st.exp) {
        const ugCat = /^undergraduate travel/i.test(r.category || "");
        if (!ugCat) { exp.push(r); continue; }
        missing = false;
        if (/airfare|flight|travel/.test(norm(r.item))) {
          if (st.tagged.has(r.id)) exp.push({ ...r, category: UG_CAT, quantity: 0, unitCost: 0, estimated: 0,
            grantTier: "Non-grantable", grantable: false, grantPct: 0,
            description: "Removed — the Fraternity no longer pays undergrad travel." });
          continue;
        }
        exp.push({ ...r, category: UG_CAT });
      }
      return { st: { ...st, exp }, missing };
    } },
];

const sig = (st) => JSON.stringify({ e: st.exp.map(({ id, ...r }) => r) });

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
  const dExp = expTotal(st.exp) - expTotal(expenses || []);
  return { nextExpenses: st.exp, nextIncome: st.inc, log, pending: log.filter((l) => l.status === "change").length,
    delta: { expense: dExp, income: 0, net: -dExp } };
}

/* =====================================================================
   Budget update — Nov 19, 2026 (grantability: J. Christopher method)
   ---------------------------------------------------------------------
   From the call with John Christopher, Courtney and Andrew on 11/19/26:
   1. Direct costs of a fully educational segment (e.g. the Explore site
      fee, buses, paid presenters) are 100% grantable ("Direct-Ed").
   2. Every other cost undergrads share in goes into the base and gets the
      educational % of programming proper ("Program %"). Programming proper
      is Fri 9 AM–Sat 5 PM; meals and breaks are left out of the hours, but
      their costs still count. Educational % = educational hrs ÷ (educational
      + fraternal hrs), set in the Budget header (default 8 ÷ 15.75 = 51%,
      counting the Closing Banquet as programming).
   3. Foundation- and Housing-paid lines (Pillar Street, Alcove, Michelle's
      Closet, the Housing room) are funded directly, so they stay
      Non-grantable here.
   Only grant tiers change. Amounts and Income are not touched.
   ===================================================================== */

export const BUDGET_PATCH_ID = "budget-2026-11-19";
export const BUDGET_PATCH_LABEL = "Nov 19, 2026 budget update (grantability per J. Christopher call)";

const norm = (s) => (s || "").toLowerCase();
const est = (r) => ((r.quantity > 0 && r.unitCost > 0) ? r.quantity * r.unitCost : (r.estimated || 0));

const tierFields = (tier) => ({
  grantTier: tier,
  grantable: tier !== "Non-grantable",
  grantPct: tier === "Direct-Ed" ? 100 : tier === "Program %" ? 50 : 0,
});
const tierOf = (r) => r.grantTier === "UG-Shared" ? "Program %" : r.grantTier;
const own = (r) => r.entity !== "Foundation" && r.entity !== "Housing";
const servesUndergrads = (r) => /^(all|students?)$/i.test(r.attendeeType || "");

/* What each line should be under the J. Christopher method. */
function wanted(r) {
  if (r.entity === "Foundation") return "Non-grantable";            // Foundation funds these directly
  if (r.entity === "Housing") return "Non-grantable";               // Housing Corp reimburses these; no double funding
  if (tierOf(r) === "Direct-Ed") return "Direct-Ed";                 // keep counsel's direct educational lines
  if (servesUndergrads(r)) return "Program %";                       // undergrad share × educational %
  return "Non-grantable";                                            // alumni / guest / individual-only lines
}

const OPS = [
  { n: 1, label: "Foundation- and Housing-paid lines → Non-grantable (funded directly: Pillar Street, Alcove, Michelle's Closet, Housing room…)",
    run: (st) => retag(st, (r) => r.entity === "Foundation" || r.entity === "Housing") },
  { n: 2, label: "Every other line serving undergrads (All / Students) → Program % (undergrad share × educational %), incl. banquet, receptions, hotel, meals, AV",
    run: (st) => retag(st, (r) => own(r) && tierOf(r) !== "Direct-Ed" && servesUndergrads(r)) },
  { n: 3, label: "Direct-Ed lines stay 100% (Educational Sessions, UG Ed lines, Headshots — undergrad share only, Staff Ed Time once time-tracked)",
    run: (st) => retag(st, (r) => own(r) && tierOf(r) === "Direct-Ed") },
  { n: 4, label: "Alumni-, guest- and individual-only lines → Non-grantable",
    run: (st) => retag(st, (r) => own(r) && tierOf(r) !== "Direct-Ed" && !servesUndergrads(r)) },
];

function retag(st, test) {
  let missing = true;
  const exp = st.exp.map((r) => {
    if (!test(r)) return r;
    missing = false;
    const t = wanted(r);
    if (r.grantTier === t) return r;
    return { ...r, ...tierFields(t) };
  });
  return { st: { ...st, exp }, missing };
}

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
  return { nextExpenses: st.exp, nextIncome: st.inc, log, pending: log.filter((l) => l.status === "change").length,
    delta: { expense: 0, income: 0, net: 0 } };
}

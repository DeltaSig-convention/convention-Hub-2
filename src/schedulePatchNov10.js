/* =====================================================================
   Schedule update — Nov 10, 2026 (Housing + Foundation meetings)
   ---------------------------------------------------------------------
   Same mechanics as the Nov 5 update (src/schedulePatch.js): each op
   finds events by day + name, is safe to re-run, and nothing is saved
   until "Apply to live schedule" is clicked in Admin → Schedule.
   This banner only appears after the Nov 5 update has been applied.
   ===================================================================== */

import { syncBlocks } from "./schedulePatch.js";

export const PATCH_ID = "schedule-2026-11-10";
export const PATCH_LABEL = "Nov 10, 2026 schedule update (Housing + Foundation)";

const THU = "2027-08-05", FRI = "2027-08-06", SAT = "2027-08-07";

const norm = (s) => (s || "").toLowerCase();
const onDay = (e, d) => !e.ongoing && e.date === d;
const named = (e, re) => re.test(norm(e.name));
const rid = (p) => p + Math.random().toString(36).slice(2, 8);

const blank = (over) => ({
  id: rid("ev"), date: "", start: "", end: "", allDay: false, name: "", category: "", owner: "",
  rooms: [], setup: "", avNote: "", avCompany: "TBD / Not yet assigned", avItems: [], assignees: [],
  ongoing: false, ongoingDates: [], description: "", ...over,
});

const HOUSING_ROOM = "Palmetto 11";
const isHousingRoom = (e) => e.ongoing && named(e, /housing experience/);
const isHistory = (e) => e.ongoing && named(e, /^history library/);

const OPS = [
  {
    n: 1, label: "Combine History Library + Housing Experience → one room in Palmetto 11 (Amy + Elizabeth), open Fri–Sat",
    run: (ev) => {
      const housing = ev.find(isHousingRoom);
      const history = ev.find(isHistory);
      if (!housing && !history) return { events: ev, missing: true };
      const base = housing || history;
      const assignees = Array.from(new Set([...(housing?.assignees || []), ...(history?.assignees || [])]));
      const combined = {
        ...base,
        name: "Housing Experience + History Library",
        category: "Programming",
        owner: "Amy Poklinkoski / Elizabeth Allouche (Housing)",
        rooms: [HOUSING_ROOM],
        ongoing: true, allDay: true, date: null, start: null, end: null,
        ongoingDates: [FRI, SAT],
        setup: "Future of Housing: museum artifacts + a mock chapter house front entry and living room. Green door and house sign outside; logo mat, etched mirror, branded chapter chairs, backlit trophy case (museum items + sponsor logos), couch/coffee table/rug; separate undergrad corner with the neon sign. Two doors for in/out flow; wall dividers. Sponsor-funded ($10–12K target); furniture returns to HQ.",
        avCompany: "Pinnacle Live (in-house)",
        avItems: Array.from(new Set([...(base.avItems || []), "Flat screen / TV (content loop)"])),
        avNote: "TV for the housing video loop; power for neon sign and sconces",
        assignees,
        description: "Opens Friday right after Ken's housing remarks in ICA Session 1 and stays open through Saturday. A walk-through of what a Delta Sig chapter house can look like, combined with the History Library's archive displays. Property management packets and giving society information on hand. Undergrads are welcome during Pillar Street.",
      };
      const out = ev.filter((e) => e === base || !(isHousingRoom(e) || isHistory(e)))
        .map((e) => e === base ? combined : e);
      return { events: out };
    },
  },
  {
    n: 2, label: "Singing Pilgrims rehearsals → Palmetto 10 (Palmetto 11 is now the Housing Experience)",
    run: (ev) => {
      let found = false;
      const out = ev.map((e) => {
        if (!named(e, /singing pilgrim/) || e.ongoing) return e;
        found = true;
        return (e.rooms || []).some((r) => /palmetto 11/i.test(r)) ? { ...e, rooms: ["Palmetto 10"] } : e;
      });
      return { events: out, missing: !found };
    },
  },
  {
    n: 3, label: "Thursday 11 AM → Housing Committee + Housing Board meet at the same time (Keys Boardroom + Palmetto 4)",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, THU) && named(e, /housing (corp(oration)? )?(board|committee)/));
      const row = { date: THU, start: "11:00", end: "12:00", name: "Housing Committee + Housing Board Meetings",
        category: "Logistics", owner: "Amy Poklinkoski (Housing)", rooms: ["Keys Boardroom", "Palmetto 4"],
        setup: "Two meetings at the same time: Housing Board (Keys Boardroom, boardroom set) and Housing Committee (Palmetto 4, conference set).",
        avCompany: "Pinnacle Live (in-house)", avNote: "Projection in each room",
        description: "Housing Committee and Housing Corporation board meet at the same time as the other committees." };
      if (!hit) return { events: [...ev, blank(row)] };
      return { events: ev.map((e) => e !== hit ? e : { ...e, ...row }) };
    },
  },
  {
    n: 4, label: "ICA Session 1 → note Ken's housing remarks launching the Housing Experience",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, FRI) && named(e, /^ica session 1|next era in action/));
      if (!hit) return { events: ev, missing: true };
      const add = "Ken's housing remarks launch the Housing Experience (Palmetto 11), open right after the session.";
      if ((hit.description || "").includes("Ken's housing remarks")) return { events: ev };
      return { events: ev.map((e) => e !== hit ? e : { ...e, description: [e.description, add].filter(Boolean).join(" ") }) };
    },
  },
  {
    n: 5, label: "Add Housing VIP Reception — Fri 5:00–5:45 PM, Palmetto 11 (private, sponsor-paid)",
    run: (ev) => {
      const row = { date: FRI, start: "17:00", end: "17:45", name: "Housing VIP Reception (Private, Invite Only)",
        category: "Donor/Society", owner: "Amy Poklinkoski (Housing)", rooms: [HOUSING_ROOM],
        setup: "Reception in the Housing Experience room: a cocktail or two, short remarks (Patrick, Nathan White). Invite list: ACBs + giving society donors. Paid by a sponsor (cocktail prospects: Upper Crust, Gil Grilling). 45 minutes max, then guests walk to Pillar Street.",
        avCompany: "Pinnacle Live (in-house)", avNote: "Handheld mic; TV loop already in room",
        description: "Private preview of the Housing Experience for ACBs and giving society donors: the next era of housing, \"open for business.\" Sponsor-paid and Housing-led. A thank-you, not an ask; it flows straight into Pillar Street at 6." };
      const hit = ev.find((e) => onDay(e, FRI) && named(e, /housing vip/));
      if (!hit) return { events: [...ev, blank(row)] };
      return { events: ev.map((e) => e !== hit ? e : { ...e, ...row }) };
    },
  },
  {
    n: 6, label: "Pillar Street → paddle raise is the only ask; silent auction runs all weekend (approved 11/10)",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, FRI) && named(e, /pillar street — a foundation|pillar street$|festival|foundation reception/));
      if (!hit) return { events: ev, missing: true };
      const setup = "Indoor street in the Majestic Foyer: stage + live music at one end, four pillar storefronts (video, a student story, an activity), passports, heavy hors d'oeuvres. ~75 min on the street, then ~20 min program incl. a 15-min paddle raise (unrestricted, MC-led) — the only live ask. Silent auction runs all weekend. No live auction. Watch music volume around speaking moments.";
      return { events: ev.map((e) => e !== hit ? e : { ...e, setup }) };
    },
  },
  {
    n: 7, label: "Saturday Alumni Experiences → ~$50 each, first come first served + waitlist (pending Phil/Justin)",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, SAT) && named(e, /alumni experience/));
      if (!hit) return { events: ev, missing: true };
      const setup = "Pick one: (1) Justin Baldwin Wine Tasting — Palmetto 7, ~50 seats; (2) Cigar Rolling — Magnolia Courtyard (Corsair lawn backup). Working price ~$50 each, first come first served with a waitlist (was $500 / $250). Pending Phil's conversation with Justin; possible Jim Larson sponsorship for cigars. Final by Jan 19.";
      return { events: ev.map((e) => e !== hit ? e : { ...e, setup }) };
    },
  },
];

const sig = (events) => JSON.stringify(events.map(({ id, ...rest }) => rest));

export function previewSchedulePatch(schedule, blocks) {
  let events = schedule;
  const log = [];
  for (const op of OPS) {
    const before = sig(events);
    const res = op.run(events);
    const changed = sig(res.events) !== before;
    log.push({ n: op.n, label: op.label, status: changed ? "change" : res.missing ? "not found" : "already done" });
    events = res.events;
  }
  const bs = syncBlocks(blocks, schedule, events);
  log.push({ n: OPS.length + 1, label: `Staff Plan: sync event blocks to new times/rooms${bs.unmatched.length ? ` (${bs.unmatched.length} block${bs.unmatched.length===1?"":"s"} need a manual look)` : ""}`, status: bs.changed ? "change" : "already done" });
  const undescribed = events.filter((e) => !(e.description || "").trim()).map((e) => e.name);
  return { next: events, nextBlocks: bs.blocks, unmatchedBlocks: bs.unmatched, undescribed, log,
    pending: log.filter((l) => l.status === "change").length };
}

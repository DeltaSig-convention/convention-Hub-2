/* =====================================================================
   Schedule update — Nov 5, 2026 ("final schedule" pass)
   ---------------------------------------------------------------------
   The live schedule lives in Supabase, not in the seed data, so these
   edits are written as operations that find each event by day + name
   and change it in place. Every op is idempotent: running it on an
   already-updated schedule reports "already done" and changes nothing.
   The Schedule tab shows a preview in Admin mode; nothing is written
   until "Apply to live schedule" is clicked.
   ===================================================================== */

export const PATCH_ID = "schedule-2026-11-05-v3";
export const PATCH_LABEL = "Nov 5, 2026 schedule update";

const WED = "2027-08-04", THU = "2027-08-05", FRI = "2027-08-06", SAT = "2027-08-07";

const norm = (s) => (s || "").toLowerCase();
const onDay = (e, d) => !e.ongoing && e.date === d;
const named = (e, re) => re.test(norm(e.name));
const rid = (p) => p + Math.random().toString(36).slice(2, 8);

const blank = (over) => ({
  id: rid("ev"), date: "", start: "", end: "", allDay: false, name: "", category: "", owner: "",
  rooms: [], setup: "", avNote: "", avCompany: "TBD / Not yet assigned", avItems: [], assignees: [],
  ongoing: false, ongoingDates: [], ...over,
});

/* Each op: (events) => { events, detail }  — status is computed by diffing. */
const OPS = [
  {
    n: 1, label: "Michelle's Closet → Thursday only, 10 AM–6 PM, run by Men's Wearhouse",
    run: (ev) => {
      const hit = ev.find((e) => named(e, /michelle/));
      if (!hit) return { events: ev, missing: true };
      return { events: ev.map((e) => e !== hit ? e : {
        ...e, ongoing: false, ongoingDates: [], allDay: false, date: THU, start: "10:00", end: "18:00",
        name: "Michelle's Closet — presented by Men's Wearhouse",
        category: "Programming", owner: "Men's Wearhouse (on site) / Andrew",
        rooms: (e.rooms && e.rooms.length) ? e.rooms : ["Palmetto 7"],
        setup: "Fitting room: 2 pipe-and-drape fitting booths, full-length mirrors, tie & shoe table, steamer power, lockable overnight storage. Kits bought on site: need-based at no cost, or $100 buy-in with the Foundation Michelle's Closet fund covering the rest. No rentals.",
        avCompany: "Pinnacle Live (in-house)", avNote: "Pipe & drape for 2 fitting booths; power for steamer",
      }) };
    },
  },
  {
    n: 2, label: "Remove Guest Craft Day",
    run: (ev) => { const out = ev.filter((e) => !named(e, /craft/)); return { events: out, missing: out.length === ev.length }; },
  },
  {
    n: 3, label: "Early Attendee Gathering → Hotel Lobby Bar",
    run: (ev) => {
      const hit = ev.find((e) => named(e, /early attendee/));
      if (!hit) return { events: ev, missing: true };
      return { events: ev.map((e) => e !== hit ? e : { ...e, rooms: ["Hotel Lobby Bar"], setup: "Reception / Casual (hotel lobby bar)", avCompany: "TBD / Not yet assigned", avNote: "None — hotel bar ambient" }) };
    },
  },
  {
    n: 4, label: "Housing → its own Housing Board Meeting, Thu 11 AM (committees still at 11)",
    run: (ev) => {
      let out = ev.map((e) => {
        if (!(onDay(e, THU) && named(e, /committee meetings/))) return e;
        const rooms = (e.rooms || []).filter((r) => !/palmetto 4$/i.test(r.trim()))
          .map((r) => /palmetto 1\s*[–-]\s*4/i.test(r) ? "Palmetto 1–3 (one each)" : r);
        return { ...e, name: "Committee Meetings (Ritual, DEI, Resolutions)", rooms };
      });
      if (!out.some((e) => onDay(e, THU) && named(e, /housing (corp(oration)? )?board/))) {
        out = [...out, blank({ date: THU, start: "11:00", end: "12:00", name: "Housing Board Meeting",
          category: "Logistics", owner: "Housing Corp", rooms: ["Keys Boardroom"], setup: "Conference / Boardroom",
          avCompany: "Pinnacle Live (in-house)", avNote: "Projection" })];
      }
      return { events: out };
    },
  },
  {
    n: 5, label: "Pilgrim Degree → 3:00–5:00 PM in the Majestic Ballroom only; remove Thursday transition block",
    run: (ev) => {
      const hasPD = ev.some((e) => onDay(e, THU) && named(e, /pilgrim degree/));
      const out = ev.filter((e) => !(onDay(e, THU) && named(e, /transition/)))
        .map((e) => onDay(e, THU) && named(e, /pilgrim degree/) ? { ...e, start: "15:00", end: "17:00", rooms: ["Majestic Ballroom (All)"] } : e);
      return { events: out, missing: !hasPD };
    },
  },
  {
    n: 6, label: "Friday lunch → Food Truck Friday, outdoors outside the Majestic Ballroom & Foyer",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, FRI) && named(e, /lunch|food truck/) && !named(e, /alcove|staff|board/));
      if (!hit) return { events: ev, missing: true };
      return { events: ev.map((e) => e !== hit ? e : { ...e, name: "Food Truck Friday — Lunch", category: "Meal", rooms: ["Outdoors — outside Majestic Ballroom & Foyer"],
        setup: "Food trucks parked outside the Majestic Ballroom & Foyer; shaded seating + weather call by 9 AM (backup: foyer). Promote it: menu reveal in pre-con comms, signage, music.",
        avNote: e.avNote && e.avNote !== "N/A" ? e.avNote : "Background music" }) };
    },
  },
  {
    n: 7, label: "Alumni Education Sessions → 2:00–4:00 PM in Palmetto 1–3",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, FRI) && named(e, /alumni ed/));
      if (!hit) return { events: ev, missing: true };
      return { events: ev.map((e) => e !== hit ? e : { ...e, start: "14:00", end: "16:00", category: e.category || "Programming", rooms: ["Palmetto 1", "Palmetto 2", "Palmetto 3"], setup: e.setup && !/^topics/i.test(e.setup) ? e.setup : "Classroom; one session per room", avCompany: "Pinnacle Live (in-house)", avNote: "Projection per room" }) };
    },
  },
  {
    n: 8, label: "Friday Singing Pilgrims rehearsal → 4:00–5:00 PM",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, FRI) && named(e, /singing pilgrim/));
      if (!hit) return { events: ev, missing: true };
      return { events: ev.map((e) => e !== hit ? e : { ...e, start: "16:00", end: "17:00" }) };
    },
  },
  {
    n: 9, label: "Festival of Impact → Pillar Street (indoor, Majestic Foyer)",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, FRI) && named(e, /festival|foundation reception|pillar street/));
      if (!hit) return { events: ev, missing: true };
      let rooms = (hit.rooms || []).filter((r) => !/porte coch/i.test(r));
      if (!rooms.length) rooms = ["Majestic South Foyer"];
      return { events: ev.map((e) => e !== hit ? e : { ...e, name: "Pillar Street — A Foundation Block Party", rooms,
        setup: "Indoor street: four pillar storefronts + promenade, two guest entrances, foyer stage, giving tower. ~75 min on the street, then ~20 min program incl. 15-min paddle raise.",
        avNote: "Stage + band sound, 4 storefront screens, giving-tower lighting, paddle-raise audio" }) };
    },
  },
  {
    n: 10, label: "Alcove Society Reception & Lunch → Palmetto 7",
    run: (ev) => {
      const hit = ev.find((e) => named(e, /alcove/));
      if (!hit) return { events: ev, missing: true };
      return { events: ev.map((e) => e !== hit ? e : { ...e, name: "Alcove Society Reception & Lunch",
        rooms: ["Palmetto 7"], setup: "Reception into seated lunch, rounds; top-donor stewardship. Michelle's Closet (Thu) and the wine tasting (Sat) use the same room." }) };
    },
  },
  {
    n: 11, label: "Remove Informal Socials",
    run: (ev) => { const out = ev.filter((e) => !named(e, /informal social/)); return { events: out, missing: out.length === ev.length }; },
  },
  {
    n: 12, label: "Saturday Singing Pilgrims rehearsal → 1:00 PM",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, SAT) && named(e, /singing pilgrim/));
      if (!hit) return { events: ev, missing: true };
      return { events: ev.map((e) => e !== hit ? e : { ...e, start: "13:00", end: "14:00" }) };
    },
  },
  {
    n: 13, label: "Undergrad education (Fri + Sat) → off-site",
    run: (ev) => {
      let found = false;
      const out = ev.map((e) => {
        if (!((onDay(e, FRI) || onDay(e, SAT)) && named(e, /undergrad/) && named(e, /educ/))) return e;
        found = true;
        const fri = e.date === FRI;
        return { ...e, name: fri ? "Undergraduate Education — Explore (Off-site)" : "Undergraduate Education — Apply (Off-site)",
          rooms: ["Offsite"], setup: "Off-site experiential block. Coaches (305 Transportation) load at the hotel before 1:00 PM and return by 5:00 PM.",
          avCompany: "TBD / Not yet assigned", avNote: "N/A — partner venues" };
      });
      return { events: out, missing: !found };
    },
  },
  {
    n: 14, label: "Saturday paid alumni experiences → one grouped block (wine tasting or cigar rolling)",
    run: (ev) => {
      const isPaid = (e) => onDay(e, SAT) && named(e, /justin|wine tasting|cigar|bourbon|alumni experience/);
      const keep = ev.filter((e) => !isPaid(e));
      const prior = ev.find(isPaid);
      const grouped = blank({ ...(prior ? { id: prior.id, assignees: prior.assignees || [], ...(prior.description ? { description: prior.description } : {}) } : {}),
        date: SAT, start: "15:00", end: "16:30", name: "Saturday Alumni Experiences (Paid Add-On)",
        category: "Donor/Society", owner: "Foundation / Andrew", rooms: ["Palmetto 7", "Magnolia Courtyard"],
        setup: "Pick one: (1) Justin Baldwin Wine Tasting — Palmetto 7, 30–50 guests, hotel cheese station; (2) Cigar Rolling with ETHOS — Magnolia Courtyard (Corsair lawn backup). Bourbon dropped.",
        avCompany: "Pinnacle Live (in-house)", avNote: "Wine: light AV only (no décor/AV package). Cigar: outdoor speaker optional." });
      if (!prior) return { events: [...keep, grouped] };
      return { events: ev.flatMap((e) => e === prior ? [grouped] : isPaid(e) ? [] : [e]) };
    },
  },
  {
    n: 15, label: "Remove Staff Pre-Banquet Meeting",
    run: (ev) => { const out = ev.filter((e) => !named(e, /staff pre-?banquet/)); return { events: out, missing: out.length === ev.length }; },
  },
  {
    n: 16, label: "ICA titles → Session 1: Next Era in Action (Fri) · Session 2: Next Era of Value (Sat)",
    run: (ev) => {
      let found = 0;
      const out = ev.map((e) => {
        if (onDay(e, FRI) && named(e, /^ica session|next era in action/)) { found++;
          return { ...e, name: "ICA Session 1: Next Era in Action" }; }
        if (onDay(e, SAT) && named(e, /^ica session|next era of value/)) { found++;
          return { ...e, name: "ICA Session 2: Next Era of Value" }; }
        return e;
      });
      return { events: out, missing: !found };
    },
  },
  {
    n: 17, label: "Saturday evening → Pre-Dinner Reception 5:30–6:30 in the foyer, Banquet 7:00–9:00",
    run: (ev) => {
      let found = 0;
      const out = ev.map((e) => {
        if (onDay(e, SAT) && named(e, /pre-?dinner reception/)) { found++; return { ...e, start: "17:30", end: "18:30", rooms: ["Majestic South Foyer"] }; }
        if (onDay(e, SAT) && named(e, /closing banquet/)) { found++; return { ...e, start: "19:00", end: "21:00" }; }
        return e;
      });
      return { events: out, missing: !found };
    },
  },
  {
    n: 18, label: "Evening Celebrations → Closing Dance Party 9:00–11:00 PM in the Majestic Foyer (tentative)",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, SAT) && named(e, /evening celebration|dance party/));
      const party = { date: SAT, start: "21:00", end: "23:00", name: "Closing Dance Party (Tentative)",
        category: "Social/Reception", owner: "Andrew", rooms: ["Majestic South Foyer"], setup: "DJ + dance floor in the foyer; ballroom stays in banquet set",
        avCompany: "Pinnacle Live (in-house)", avNote: "DJ support + dance lighting",
        description: "Closing dance party in the Majestic Foyer right after the banquet. Tentative." };
      if (!hit) return { events: [...ev, blank(party)] };
      return { events: ev.map((e) => e !== hit ? e : { ...e, ...party }) };
    },
  },
  {
    n: 19, label: "Welcome Reception notes → undergrad kickoff + awards",
    run: (ev) => {
      const hit = ev.find((e) => onDay(e, THU) && named(e, /welcome reception/));
      if (!hit) return { events: ev, missing: true };
      return { events: ev.map((e) => e !== hit ? e : { ...e,
        setup: "Reception (indoor/outdoor) with a short stage moment: four Next Era awards, Order of the Sphinx, Next Era chapter awards. Brotherhood Circles follow." }) };
    },
  },
  {
    n: 20, label: "Add No. 1 Pillar Street stewardship station in the Majestic Foyer (Wed–Sat)",
    run: (ev) => {
      if (ev.some((e) => named(e, /no\.? ?1 pillar street|stewardship station/)))
        return { events: ev.map((e) => named(e, /no\.? ?1 pillar street|stewardship station/) ? { ...e, rooms: ["Majestic South Foyer"] } : e) };
      return { events: [...ev, blank({ ongoing: true, allDay: true, ongoingDates: [WED, THU, FRI, SAT],
        name: "No. 1 Pillar Street — Foundation Stewardship Station", category: "Donor/Society", owner: "Foundation",
        rooms: ["Majestic South Foyer"], setup: "Staffed lounge: hotel lounge furniture, rugs and plants; Next Era wall; campaign progress on a screen",
        avCompany: "Pinnacle Live (in-house)", avNote: "1 screen for campaign progress" })] };
    },
  },
  {
    n: 21, label: "Add descriptions to every event",
    run: (ev) => {
      let found = 0;
      const out = ev.map((e) => {
        if (e.description && e.description.trim()) return e;
        const d = describe(e);
        if (!d) return e;
        found++; return { ...e, description: d };
      });
      return { events: out };
    },
  },
  {
    n: 22, label: "AV company matches the room: Pixel Point = Majestic Ballroom, Pinnacle Live = foyers & breakouts",
    run: (ev) => ({ events: ev.map((e) => {
      const rooms = e.rooms || [];
      if (!/pixel point|pinnacle/i.test(e.avCompany || "") || !rooms.length) return e;
      if (rooms.every((r) => /offsite|outdoors/i.test(r))) return e;
      const want = rooms.some((r) => /^majestic ballroom/i.test(r)) ? "Pixel Point LLC" : "Pinnacle Live (in-house)";
      return e.avCompany === want ? e : { ...e, avCompany: want };
    }) }),
  },
];

/* ---------------- event descriptions (filled only where an event has none) ---------------- */
const DESCRIPTIONS = [
  [/convention set ?up/, "Load-in day. Pixel Point builds the Majestic Ballroom; staff stage signage, registration materials and storage."],
  [/pre-?con walkthrough/, "Walk every space with the hotel event team to confirm sets, F&B, AV hand-offs and the Schedule of Events."],
  [/high level ica review/, "Staff run-through of the ICA agenda, scripts, voting process and floor logistics before delegates arrive."],
  [/staff meal/, "Staff dinner before the evening's first events."],
  [/initial staff meeting/, "Kickoff briefing: roles, the Staff Plan, radios/communication, escalation contacts and a walk of the key rooms."],
  [/boards? & staff welcome/, "Private welcome for Grand Council, Foundation board and HQ staff to open the week."],
  [/early attendee/, "Casual meet-up for brothers arriving Wednesday. No program; a chance to reconnect before things get busy."],
  [/staff morning meeting/, "Daily 30-minute staff huddle: the day's run-of-show, changes overnight, open issues and assignments."],
  [/grand council meeting/, "Grand Council business session ahead of convention."],
  [/registration opens|^convention registration/, "Attendees check in, pick up badges and convention materials, and get oriented."],
  [/foundation & campaign meeting/, "Foundation leadership meeting on the campaign and the weekend's donor plan."],
  [/committee meetings/, "Standing committees (Ritual, DEI, Resolutions) meet in parallel, one room each, to prepare business for the ICA."],
  [/housing board/, "Housing Corporation board meeting."],
  [/staff lunch/, "Staggered staff lunch; floating coverage stays on the radio."],
  [/singing pilgrims/, "Singing Pilgrims rehearse for upcoming ceremonies and the banquet."],
  [/alumni initiation/, "Ceremony initiating alumni initiates into Delta Sigma Phi. Ritual setting; room closed to non-members."],
  [/pilgrim degree/, "Pilgrim Degree ceremony. Ritual setting; room closed to non-members."],
  [/guest reception/, "Welcome reception for spouses and guests: meet the guest program team and preview the week's guest events."],
  [/welcome reception/, "Official program kickoff, including for undergraduate delegates. Short stage moment for the four Next Era awards, Order of the Sphinx and Next Era chapter awards, then Brotherhood Circles."],
  [/michelle/, "Men's Wearhouse fits undergraduates for convention attire on site. Need-based students are outfitted at no cost; others can buy a suit for $100, with the Foundation's Michelle's Closet fund covering the balance."],
  [/ica \/ business meeting room/, "The Majestic Ballroom in ICA configuration for business sessions and ceremonies, Thursday through Saturday morning."],
  [/business operations/, "HQ business operations workroom for the duration of convention."],
  [/housing experience/, "Housing Corporation space with resources and conversations for chapter housing volunteers."],
  [/registration experience/, "Registration desk and vendor/sponsor area. First stop for attendee questions."],
  [/staff office/, "Staff home base: storage, lost & found, first aid kit, vendor check-in."],
  [/history library/, "Displays from Delta Sig's archives and history, open for browsing."],
  [/no\.? ?1 pillar street|stewardship station/, "The Foundation's staffed stewardship lounge all weekend: a place for donors to stop in, be thanked, and see campaign progress."],
  [/guest event|offsite excursion/, "Off-site excursion for spouses and guests while delegates are in the ICA."],
  [/food truck|^lunch/, "Food Truck Friday: food trucks just outside the Majestic Ballroom and Foyer, lunch for all attendees between the ICA and afternoon programming."],
  [/undergrad.*explore|undergrad.*educ/, null], // handled by day below
  [/alcove/, "Reception and seated lunch thanking Alcove Society members, Delta Sig's top donors. Invitation only."],
  [/alumni ed/, "Alumni education sessions on fraternity operations, such as chapter advising, housing and alumni engagement."],
  [/pillar street/, "The Foundation's Friday night: an indoor street of four pillar storefronts telling the story of what brothers have built, followed by a short program and the weekend's only paddle raise."],
  [/^ica session 1/, "Business session one: reports and the state of the board, with operations and voting held to about an hour. Order of the Sphinx and chapter/undergraduate awards are presented here."],
  [/^ica session 2/, "Business session two, including a 20–25 minute Foundation segment announcing the new giving societies and alumni associations."],
  [/bond eternal/, "Memorial ceremony honoring brothers who have entered the Bond Eternal."],
  [/resolutions committee/, "Resolutions Committee meets to wrap up resolutions business."],
  [/board meeting: elections/, "Board meeting with elections, held over lunch."],
  [/alumni experiences/, "Paid add-on for alumni and guests; pick one. Justin Baldwin Wine Tasting (Palmetto 7, with a cheese station) or Cigar Rolling with ETHOS (Magnolia Courtyard)."],
  [/pre-?dinner reception/, "Cocktail reception before the Closing Banquet; the group photo happens during it."],
  [/group photo/, "All-attendee convention photo on the risers."],
  [/closing banquet/, "The convention finale: about five major alumni-weighted awards and the $40M campaign reveal. Pure celebration, no solicitation."],
  [/dance party|evening celebration/, "Closing dance party in the Majestic Foyer right after the banquet. Tentative."],
  [/load out|strike/, "Strike and load-out of all convention spaces."],
];
const UG_DESC = {
  [FRI]: "Explore: off-site experiential learning for undergraduate delegates. Part of 8 hours of education across Friday and Saturday; attendance tracked by QR scan.",
  [SAT]: "Apply: off-site block for undergraduate delegates, building on Friday's Explore. Attendance tracked by QR scan.",
};
function describe(e) {
  const n = norm(e.name);
  if (/undergrad/.test(n) && /educ/.test(n)) return UG_DESC[e.date] || null;
  for (const [re, text] of DESCRIPTIONS) if (text && re.test(n)) return text;
  return null;
}

/* ---------------- Staff Plan sync ----------------
   "event" blocks follow the event they cover: same date, times and rooms. Matched by
   eventId first, then by name on the same day (old names map to new ones). Blocks for
   removed events and event blocks with no match are listed, not deleted. Duty/floating
   blocks are left alone. */
const canon = (name) => {
  const n = norm(name);
  const alias = [[/undergrad.*educ/, "undergrad-ed"], [/festival|foundation reception|pillar street/, "pillar-street"],
    [/michelle/, "michelle"], [/^ica session 1|next era in action/, "ica-1"], [/^ica session (2|4)|next era of value/, "ica-2"],
    [/alcove/, "alcove"], [/evening celebration|dance party/, "dance"], [/committee meetings/, "committees"],
    [/justin|wine tasting|cigar|bourbon|alumni experience/, "paid-exp"], [/lunch|food truck/, "lunch"]];
  for (const [re, k] of alias) if (re.test(n)) return k;
  return n.replace(/\(.*?\)/g, "").replace(/[—:].*$/, "").trim();
};
export function syncBlocks(blocks, before, after) {
  const unmatched = [];
  let changed = 0;
  const findIn = (list, b) => {
    let ev = b.eventId && list.find((e) => e.id === b.eventId);
    if (!ev) {
      const k = canon(b.label);
      ev = list.find((e) => !e.ongoing && e.date === b.date && canon(e.name) === k);
    }
    return ev;
  };
  const same = (x, y) => JSON.stringify(x || []) === JSON.stringify(y || []);
  const out = (blocks || []).map((b) => {
    if (b.kind !== "event") return b;
    const old = findIn(before, b);
    const now = old ? after.find((e) => e.id === old.id) : findIn(after, b);
    if (!now) { unmatched.push(`${b.person}: ${b.label} (${b.date})`); return b; }
    const next = { ...b, eventId: now.id };
    /* Only carry over what this update changed, and only where the block still mirrored the
       old event — a block someone set early (e.g. arrive 30 min before) keeps its own time. */
    if (old) {
      if (old.start !== now.start && b.start === old.start) next.start = now.start;
      if (old.end !== now.end && b.end === old.end) next.end = now.end;
      if (!same(old.rooms, now.rooms) && same(b.rooms, old.rooms)) next.rooms = now.rooms;
      if (old.name !== now.name && b.label === old.name) next.label = now.name;
      if (old.date !== now.date && b.date === old.date) next.date = now.date;
    }
    if (JSON.stringify(next) !== JSON.stringify(b)) changed++;
    return next;
  });
  return { blocks: out, changed, unmatched };
}

/* Strip volatile ids from new events so the diff ignores them on re-runs. */
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

export const ADDED_ROOMS = ["Hotel Lobby Bar"];

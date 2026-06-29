# Convention Hub — refinement pass (Staff Plan, Calendar, Budget)

This update adds five requested features. **No Supabase schema change is needed** —
the new fields live inside the existing JSON blobs, so you can deploy this exactly
like before (push to GitHub → Netlify rebuilds). Existing saved data stays intact.

## 1. Staff Plan — bulk upload
- **Template** button downloads `staff_plan_template.csv` (columns: person, date,
  start, end, room, kind, label) pre-filled with three example rows.
- **Bulk upload CSV** parses a filled-in sheet and creates every block at once.
  - Accepts 24h (`14:00`) or 12h (`2:00 PM`) times, and `YYYY-MM-DD` or `M/D/YYYY` dates.
  - Multiple rooms in one cell: separate with `;`.
  - `kind` accepts event / duty / floating (anything else defaults to duty).
  - Rows missing a person or date are skipped, and you get a summary of how many
    were added vs. skipped.

## 2. Staff Plan — add to calendar (.ics)
- **Per block** — each block row has a "Calendar" button that downloads a single `.ics`.
- **Per day** — each day header has "Add day to calendar."
- **Whole plan** — "Add full plan to calendar" exports everything for the selected person.
- `.ics` is the universal format — opens in Apple Calendar, Google Calendar, Outlook,
  etc., no login or API connection required. Times are written as local time (Eastern
  on-site in Miami).

## 3. Budget — Overview dashboard
- New **Overview** sub-tab (now the default landing tab in Budget).
- Projected income vs. projected expense, net position (surplus/shortfall),
  grantable spend vs. target.
- Income-vs-expense chart + expense-by-category chart.
- An "Actuals — tracking against projections" strip: income to date, spend to date,
  net to date, and registration progress, each with a progress bar.

## 4. Budget — actuals locked, estimates stay editable
- The **Actual** column on the Budget tab is now **read-only**. It rolls up from
  Expense Tracker entries tagged to that line — real transactions drive actuals
  instead of hand-typed numbers.
- The **Expense Tracker** has a new **"Budget Line"** column: tag each logged
  expense to the budget line it belongs to, and it flows into that line's Actual,
  the category subtotal, the Overview "spend to date," and the Foundation
  reconciliation. A KPI shows how many entries are still untagged.
- **Estimates stay fully editable** — type a flat amount, or set qty × unit and flip
  on "scales" for lines that follow the attendee count. (The `scales` flag is the
  one to review per line for flat-cost items that shouldn't move with registration.)

## 5. Schedule — view options
- Toggle between **List** (the original), **Hour-by-hour** (a time-rail agenda), and
  **Day-of** (a calendar-style day grid with time-scaled, overlap-packed event blocks).
- All existing filters (by event / by person, day, search) apply to every view.

## Consistency note
- The Foundation reconciliation tab's "paid / settled" now also reads from the
  tracker rollup, so it stays consistent with the new actuals model.

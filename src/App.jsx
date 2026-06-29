import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { LayoutDashboard, Wallet, CalendarClock, HelpCircle, Map as MapIcon, Users, Search, Plus, Trash2, X, ChevronDown, MapPin, Phone, FileText, FileSpreadsheet, Upload, Image as ImageIcon, ArrowLeftRight, User, CalendarDays, Pencil, Check, Loader2, RefreshCw, Download, Copy, ExternalLink, History, ShieldCheck, AlertTriangle, Handshake, Building2, GraduationCap, Clock, Tv } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, CartesianGrid } from "recharts";
import { supabase, sget, sset, signInWithPassword, signOut, getSession, uploadMapImage } from "./supabase.js";

/* Storage + auth + image uploads come from Supabase. See src/supabase.js */
/* Storage + auth + image uploads now come from Supabase. See src/supabase.js */

/* ----------------------------- brand palette ----------------------------- */
const C = { ink:"#16201d", paper:"#f5f3ec", card:"#ffffff", line:"#e5e1d6", deep:"#0d3b34", nile:"#14564c", gold:"#c1973f", goldSoft:"#f4ecd9", pos:"#1f7a5c", warn:"#b9852a", neg:"#b34a30", muted:"#6c7269", chip:"#eef1ea" };
const CAT_COLORS = ["#0d3b34","#14564c","#2f7d6b","#c1973f","#9c6b2e","#5b8c7b","#7a9e57","#b34a30","#46615a","#86733f","#3a5d54"];
const ENTITY_COLORS = { Fraternity:"#0d3b34", Foundation:"#c1973f", Housing:"#2f7d6b" };
const ATTENDEE_TYPES = ["All","Students","Alumni","Guests","Individual","Foundation","Staff"];
const ENTITIES = ["Fraternity","Foundation","Housing"];
const APPROVAL = ["Draft","Submitted","Approved","Rejected"];
const APPROVAL_COLOR = { Draft:C.muted, Submitted:C.warn, Approved:C.pos, Rejected:C.neg };
const PAY_STATUS = ["Not started","Requested","Approved","Paid","Reimbursed"];
const PAY_METHOD = ["—","ACH/Wire","Card","Check","Invoice","Reimbursement"];
const SPONSOR_STAGES = ["Prospect","Contacted","Committed","Invoiced","Paid"];
const STAGE_COLOR = { Prospect:"#9aa39a", Contacted:"#5b8c7b", Committed:C.gold, Invoiced:C.nile, Paid:C.pos };
const EVENT_STATUS_COLOR = { confirmed:C.pos, tbd:C.muted, pending:C.warn };
const BLOCK_KIND_COLOR = { event:C.nile, duty:C.gold, floating:"#7a9e57" };

/* ----------------------------- room & AV reference lists ----------------------------- */
const ROOM_LIST = [
  "Banyan",
  "Cascata Pool",
  "Common Areas / Foyers",
  "Corsair Restaurant (Private Space)",
  "Garden 1",
  "Garden 2",
  "Garden Foyer",
  "Gold Office",
  "Historic Display",
  "Jenkins Suite",
  "Keys Boardroom",
  "King Ballroom 1",
  "King Ballroom 2",
  "King Ballroom 3",
  "King Ballroom South Foyer",
  "King East Foyer",
  "Magnolia Courtyard",
  "Majestic Ballroom (All)",
  "Majestic Ballroom 1",
  "Majestic Ballroom 2",
  "Majestic Ballroom 3",
  "Majestic Ballroom 4",
  "Majestic Ballroom 5",
  "Majestic Ballroom 6",
  "Majestic Ballroom 7",
  "Majestic Ballroom 8",
  "Majestic Corridor",
  "Majestic East Foyer",
  "Majestic South Foyer",
  "Majestic West Foyer",
  "North Convention Lobby",
  "Offsite",
  "Palmetto 1",
  "Palmetto 10",
  "Palmetto 11",
  "Palmetto 2",
  "Palmetto 3",
  "Palmetto 4",
  "Palmetto 5",
  "Palmetto 6",
  "Palmetto 7",
  "Palmetto 8",
  "Palmetto 9",
  "Pool / Tidal Cove / Beach",
  "Porte Cochere",
  "Royal Ballroom (All)",
  "Royal Ballroom 1",
  "Royal Ballroom 2",
  "Royal Ballroom 3",
  "Royal Ballroom 4",
  "Royal East Foyer",
  "Royal South Foyer",
  "Sabal 1",
  "Sabal 2",
  "Sabal 3",
  "Sabal 4",
  "Sabal Foyer",
  "Veranda 1",
  "Veranda 2"
];
const AV_COMPANIES = ["Pixel Point LLC", "Pinnacle Live (in-house)", "TBD / Not yet assigned"];
const AV_ITEMS = ["Podium mic", "Wireless mic(s)", "Floor/delegate mics on stands", "Lavalier mic", "Full audio mix", "Background music speaker", "Outdoor/weatherproof speakers", "Distributed foyer speakers", "Large projection screen(s)", "Projector(s)", "Confidence monitor", "Podium display", "Teleprompter", "IMAG (image magnification)", "Flat screen / TV (content loop)", "Full stage lighting", "Uplighting", "Canned lighting", "Branded gobos", "Spotlight", "Ceremony/dramatic lighting", "Outdoor lighting", "Live stream", "Recording / archive capture", "Stage backdrop drape", "Banner prints", "Podium/banner", "Power distribution", "AV load-in / setup crew", "AV strike / de-rig"];

/* ----------------------------- seed data ----------------------------- */
const SEED_SCHEDULE = [
  {
    "id": "ev1",
    "date": "2027-08-04",
    "start": "08:00",
    "end": "17:00",
    "allDay": false,
    "name": "Convention Set Up",
    "category": "Logistics",
    "owner": "Diane / Venue",
    "rooms": [
      "Majestic Ballroom (All)",
      "Foyers"
    ],
    "setup": "Load-In",
    "avNote": "N/A",
    "avCompany": "Pixel Point LLC",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev2",
    "date": "2027-08-04",
    "start": "14:00",
    "end": "15:30",
    "allDay": false,
    "name": "Hotel Pre-Con Walkthrough",
    "category": "Logistics",
    "owner": "Andrew / Diane",
    "rooms": [],
    "setup": "Walkthrough",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev3",
    "date": "2027-08-04",
    "start": "15:30",
    "end": "17:00",
    "allDay": false,
    "name": "High Level ICA Review",
    "category": "Logistics",
    "owner": "Andrew",
    "rooms": [
      "Gold Office"
    ],
    "setup": "Staff only",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev4",
    "date": "2027-08-04",
    "start": "15:30",
    "end": "17:00",
    "allDay": false,
    "name": "Staff Meal",
    "category": "Logistics",
    "owner": "Diane",
    "rooms": [],
    "setup": "",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev5",
    "date": "2027-08-04",
    "start": "17:00",
    "end": "18:00",
    "allDay": false,
    "name": "Initial Staff Meeting & Walkthrough",
    "category": "Logistics",
    "owner": "Andrew",
    "rooms": [
      "Gold Office"
    ],
    "setup": "Conference",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev6",
    "date": "2027-08-04",
    "start": "18:00",
    "end": "18:30",
    "allDay": false,
    "name": "Boards & Staff Welcome Reception",
    "category": "Social/Reception",
    "owner": "Andrew",
    "rooms": [
      "Keys Boardroom"
    ],
    "setup": "Reception / Cocktail",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev7",
    "date": "2027-08-04",
    "start": "18:30",
    "end": "20:30",
    "allDay": false,
    "name": "Early Attendee Gathering",
    "category": "Social/Reception",
    "owner": "Andrew",
    "rooms": [
      "Majestic South Foyer",
      "Royal South Foyer"
    ],
    "setup": "Reception / Casual",
    "avNote": "Music",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Background music speaker"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev8",
    "date": "2027-08-05",
    "start": "07:00",
    "end": "07:30",
    "allDay": false,
    "name": "Staff Morning Meeting",
    "category": "Logistics",
    "owner": "Andrew",
    "rooms": [
      "Gold Office"
    ],
    "setup": "Conference",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev9",
    "date": "2027-08-05",
    "start": "09:00",
    "end": "10:00",
    "allDay": false,
    "name": "Grand Council Meeting",
    "category": "Logistics",
    "owner": "Grand Council",
    "rooms": [
      "Keys Boardroom"
    ],
    "setup": "U-Shape",
    "avNote": "Projection",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Large projection screen(s)"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev10",
    "date": "2027-08-05",
    "start": "10:00",
    "end": "16:00",
    "allDay": false,
    "name": "Convention Registration Opens",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Royal South Foyer",
      "Historic Display"
    ],
    "setup": "Exhibit / Tables",
    "avNote": "Music",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Background music speaker"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev11",
    "date": "2027-08-05",
    "start": "10:00",
    "end": "11:00",
    "allDay": false,
    "name": "Foundation & Campaign Meeting",
    "category": "Logistics",
    "owner": "Foundation",
    "rooms": [
      "Keys Boardroom"
    ],
    "setup": "Conference",
    "avNote": "Projection",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Large projection screen(s)"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev12",
    "date": "2027-08-05",
    "start": "11:00",
    "end": "12:00",
    "allDay": false,
    "name": "Committee Meetings (Ritual, DEI, Resolutions, Housing)",
    "category": "Logistics",
    "owner": "Board",
    "rooms": [
      "Palmetto 1\u20134 (one each)"
    ],
    "setup": "U-Shape",
    "avNote": "Projection per room",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Large projection screen(s)"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev13",
    "date": "2027-08-05",
    "start": "11:30",
    "end": "13:00",
    "allDay": false,
    "name": "Staff Lunch",
    "category": "Logistics",
    "owner": "Diane",
    "rooms": [],
    "setup": "",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev14",
    "date": "2027-08-05",
    "start": "12:00",
    "end": "13:00",
    "allDay": false,
    "name": "Singing Pilgrims Rehearsal",
    "category": "Logistics",
    "owner": "Singing Pilgrims",
    "rooms": [
      "Palmetto 11"
    ],
    "setup": "Open / Special",
    "avNote": "Speaker / Music",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Background music speaker"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev15",
    "date": "2027-08-05",
    "start": "13:00",
    "end": "14:30",
    "allDay": false,
    "name": "Alumni Initiation Ceremony",
    "category": "Ceremony",
    "owner": "Andrew",
    "rooms": [
      "Royal Ballroom (All)"
    ],
    "setup": "Special / Empty",
    "avNote": "Projection + Audio",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Large projection screen(s)",
      "Full audio mix"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev16",
    "date": "2027-08-05",
    "start": "15:00",
    "end": "16:30",
    "allDay": false,
    "name": "Pilgrim Degree",
    "category": "Ceremony",
    "owner": "Andrew",
    "rooms": [
      "Royal Ballroom (All)"
    ],
    "setup": "Special / Empty",
    "avNote": "Projection + Audio",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Large projection screen(s)",
      "Full audio mix"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev17",
    "date": "2027-08-05",
    "start": "16:30",
    "end": "17:30",
    "allDay": false,
    "name": "Transition / Pool & Common Areas Open",
    "category": "Social/Reception",
    "owner": "Andrew",
    "rooms": [
      "Common Areas",
      "Pool"
    ],
    "setup": "Open",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev18",
    "date": "2027-08-05",
    "start": "17:30",
    "end": "18:00",
    "allDay": false,
    "name": "Raise the Fez Donor Meet & Greet",
    "category": "Donor/Society",
    "owner": "Foundation",
    "rooms": [
      "TBD"
    ],
    "setup": "Cocktail / Low Tops",
    "avNote": "Speaker / Music",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Background music speaker"
    ],
    "status": "tbd",
    "assignees": []
  },
  {
    "id": "ev19",
    "date": "2027-08-05",
    "start": "17:30",
    "end": "18:30",
    "allDay": false,
    "name": "Welcome ICA + Guest Reception",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Majestic Ballroom (All)",
      "Jenkins Suite"
    ],
    "setup": "ICA + Reception",
    "avNote": "Full A/V",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Large projection screen(s)",
      "Projector(s)",
      "Full audio mix",
      "Full stage lighting"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev20",
    "date": "2027-08-05",
    "start": "19:30",
    "end": "21:00",
    "allDay": false,
    "name": "Welcome Reception + Brotherhood Circles",
    "category": "Social/Reception",
    "owner": "Andrew",
    "rooms": [
      "Majestic South Foyer",
      "Royal South Foyer",
      "Porte Cochere"
    ],
    "setup": "Reception (Indoor/Outdoor)",
    "avNote": "Music + Live Music Setup",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Background music speaker"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev21",
    "date": "2027-08-05",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "ICA / Business Meeting Room",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "setup": "Full ICA Setup",
    "avNote": "Full A/V, Projection, Audio",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Large projection screen(s)",
      "Projector(s)",
      "Full audio mix",
      "Full stage lighting"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev22",
    "date": "2027-08-05",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Michelle's Closet",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Palmetto 7"
    ],
    "setup": "Exhibit",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev23",
    "date": "2027-08-05",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Business Operations",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Palmetto 8"
    ],
    "setup": "Exhibit",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev24",
    "date": "2027-08-05",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Housing Experience",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Palmetto 10"
    ],
    "setup": "Exhibit",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev25",
    "date": "2027-08-05",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Registration Experience + Vendors",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Royal South Foyer",
      "Majestic South Foyer"
    ],
    "setup": "Exhibit / Tables",
    "avNote": "Music",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Background music speaker"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev26",
    "date": "2027-08-05",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Staff Office",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Gold Office"
    ],
    "setup": "Conference / Storage",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev27",
    "date": "2027-08-06",
    "start": "07:00",
    "end": "07:30",
    "allDay": false,
    "name": "Staff Morning Meeting",
    "category": "Logistics",
    "owner": "Andrew",
    "rooms": [
      "Gold Office"
    ],
    "setup": "Conference",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev28",
    "date": "2027-08-06",
    "start": "09:00",
    "end": "10:00",
    "allDay": false,
    "name": "Keynote Speaker",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "setup": "Theater / Plenary",
    "avNote": "Full A/V, Stage, Lighting",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Large projection screen(s)",
      "Projector(s)",
      "Full audio mix",
      "Full stage lighting"
    ],
    "status": "pending",
    "assignees": []
  },
  {
    "id": "ev29",
    "date": "2027-08-06",
    "start": "10:00",
    "end": "12:00",
    "allDay": false,
    "name": "ICA Session 2",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "setup": "Full ICA Setup",
    "avNote": "Full A/V",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Large projection screen(s)",
      "Projector(s)",
      "Full audio mix",
      "Full stage lighting"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev30",
    "date": "2027-08-06",
    "start": "10:00",
    "end": "12:00",
    "allDay": false,
    "name": "Guest Event \u2014 Offsite Excursion",
    "category": "Guest Event",
    "owner": "Andrew / Diane",
    "rooms": [
      "Offsite"
    ],
    "setup": "N/A",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "tbd",
    "assignees": []
  },
  {
    "id": "ev31",
    "date": "2027-08-06",
    "start": "12:00",
    "end": "13:00",
    "allDay": false,
    "name": "Staff Lunch",
    "category": "Logistics",
    "owner": "Diane",
    "rooms": [],
    "setup": "",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev32",
    "date": "2027-08-06",
    "start": "13:00",
    "end": "17:00",
    "allDay": false,
    "name": "Undergraduate Educational Sessions",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Palmetto rooms (TBD)"
    ],
    "setup": "Classroom",
    "avNote": "Projection per room",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Large projection screen(s)"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev33",
    "date": "2027-08-06",
    "start": "13:15",
    "end": "14:15",
    "allDay": false,
    "name": "Alcove Society Reception",
    "category": "Donor/Society",
    "owner": "Foundation",
    "rooms": [
      "Corsair Restaurant (Private Space)"
    ],
    "setup": "Cocktail / Low Tops",
    "avNote": "Music",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Background music speaker"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev34",
    "date": "2027-08-06",
    "start": "14:00",
    "end": "15:00",
    "allDay": false,
    "name": "Singing Pilgrims Rehearsal",
    "category": "Logistics",
    "owner": "Singing Pilgrims",
    "rooms": [
      "Palmetto 11"
    ],
    "setup": "Open / Special",
    "avNote": "Speaker / Music",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Background music speaker"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev35",
    "date": "2027-08-06",
    "start": "17:30",
    "end": "18:30",
    "allDay": false,
    "name": "1899 Society Reception",
    "category": "Donor/Society",
    "owner": "Foundation",
    "rooms": [
      "Cascata Pool"
    ],
    "setup": "Cocktail / Outdoor",
    "avNote": "Music + Outdoor Audio",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Full audio mix",
      "Background music speaker",
      "Outdoor/weatherproof speakers"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev36",
    "date": "2027-08-06",
    "start": "18:30",
    "end": "21:00",
    "allDay": false,
    "name": "Foundation Reception + Auction",
    "category": "Donor/Society",
    "owner": "Foundation",
    "rooms": [
      "Royal Ballroom (All)",
      "Royal East Foyer",
      "Magnolia Courtyard"
    ],
    "setup": "Reception (Indoor/Outdoor)",
    "avNote": "Full A/V + Auction Setup",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Large projection screen(s)",
      "Projector(s)",
      "Full audio mix",
      "Full stage lighting",
      "Podium/banner"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev37",
    "date": "2027-08-06",
    "start": "21:00",
    "end": null,
    "allDay": false,
    "name": "Informal Socials / Brotherhood Circles",
    "category": "Social/Reception",
    "owner": "Andrew",
    "rooms": [
      "Common Areas",
      "Foyers"
    ],
    "setup": "Open",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev38",
    "date": "2027-08-06",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "ICA / Business Meeting Room",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "setup": "Full ICA Setup",
    "avNote": "Full A/V",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Large projection screen(s)",
      "Projector(s)",
      "Full audio mix",
      "Full stage lighting"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev39",
    "date": "2027-08-06",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Michelle's Closet",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Palmetto 7"
    ],
    "setup": "Exhibit",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev40",
    "date": "2027-08-06",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "History Library",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Palmetto 6"
    ],
    "setup": "Tables & TVs",
    "avNote": "TVs",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Flat screen / TV (content loop)"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev41",
    "date": "2027-08-06",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Business Operations",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Palmetto 8"
    ],
    "setup": "Exhibit",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev42",
    "date": "2027-08-06",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Housing Experience",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Palmetto 10"
    ],
    "setup": "Exhibit",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev43",
    "date": "2027-08-06",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Staff Office",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Gold Office"
    ],
    "setup": "Conference / Storage",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev44",
    "date": "2027-08-07",
    "start": "07:00",
    "end": "07:30",
    "allDay": false,
    "name": "Staff Morning Meeting",
    "category": "Logistics",
    "owner": "Andrew",
    "rooms": [
      "Gold Office"
    ],
    "setup": "Conference",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev45",
    "date": "2027-08-07",
    "start": "08:30",
    "end": "09:15",
    "allDay": false,
    "name": "Bond Eternal Ceremony",
    "category": "Ceremony",
    "owner": "Andrew",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "setup": "Special / Empty",
    "avNote": "Projection + Audio",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Large projection screen(s)",
      "Full audio mix"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev46",
    "date": "2027-08-07",
    "start": "09:30",
    "end": "11:30",
    "allDay": false,
    "name": "ICA Session 4",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "setup": "Full ICA Setup",
    "avNote": "Full A/V",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Large projection screen(s)",
      "Projector(s)",
      "Full audio mix",
      "Full stage lighting"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev47",
    "date": "2027-08-07",
    "start": "11:30",
    "end": "12:00",
    "allDay": false,
    "name": "Resolutions Committee Meeting",
    "category": "Logistics",
    "owner": "Board",
    "rooms": [
      "Keys Boardroom"
    ],
    "setup": "U-Shape",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev48",
    "date": "2027-08-07",
    "start": "11:30",
    "end": "12:00",
    "allDay": false,
    "name": "Singing Pilgrims Rehearsal",
    "category": "Logistics",
    "owner": "Singing Pilgrims",
    "rooms": [
      "Palmetto 11"
    ],
    "setup": "Open / Special",
    "avNote": "Speaker / Music",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Background music speaker"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev49",
    "date": "2027-08-07",
    "start": "12:00",
    "end": "13:00",
    "allDay": false,
    "name": "Board Meeting: Elections & Lunch",
    "category": "Logistics",
    "owner": "Board",
    "rooms": [
      "Keys Boardroom"
    ],
    "setup": "Conference Table",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev50",
    "date": "2027-08-07",
    "start": "12:00",
    "end": "13:00",
    "allDay": false,
    "name": "Staff Lunch",
    "category": "Logistics",
    "owner": "Diane",
    "rooms": [],
    "setup": "",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev51",
    "date": "2027-08-07",
    "start": "13:00",
    "end": "17:00",
    "allDay": false,
    "name": "Undergraduate Educational Sessions",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Palmetto rooms (TBD)"
    ],
    "setup": "Classroom",
    "avNote": "Projection per room",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Large projection screen(s)"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev52",
    "date": "2027-08-07",
    "start": "13:00",
    "end": "18:30",
    "allDay": false,
    "name": "Open / Resort Time \u2014 Beach & Pool Day",
    "category": "Social/Reception",
    "owner": "Andrew",
    "rooms": [
      "Pool",
      "Tidal Cove",
      "Beach",
      "Common Areas"
    ],
    "setup": "Open",
    "avNote": "Food Trucks on Property",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev53",
    "date": "2027-08-07",
    "start": "17:00",
    "end": "18:00",
    "allDay": false,
    "name": "Justin Baldwin Wine Tasting (Private)",
    "category": "Donor/Society",
    "owner": "Foundation",
    "rooms": [
      "Royal Ballroom (partial \u2014 ~100pp)"
    ],
    "setup": "Cocktail / Schoolroom",
    "avNote": "2 Projections",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Large projection screen(s)"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev54",
    "date": "2027-08-07",
    "start": "18:30",
    "end": "18:45",
    "allDay": false,
    "name": "Staff Pre-Banquet Meeting",
    "category": "Logistics",
    "owner": "Andrew",
    "rooms": [
      "Gold Office"
    ],
    "setup": "Conference",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev55",
    "date": "2027-08-07",
    "start": "18:45",
    "end": "19:30",
    "allDay": false,
    "name": "Pre-Dinner Reception",
    "category": "Social/Reception",
    "owner": "Andrew",
    "rooms": [
      "Majestic South Foyer",
      "Royal South Foyer",
      "Porte Cochere"
    ],
    "setup": "High Tops",
    "avNote": "Music Setup",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Background music speaker"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev56",
    "date": "2027-08-07",
    "start": "19:15",
    "end": "19:30",
    "allDay": false,
    "name": "Group Photo",
    "category": "Logistics",
    "owner": "Andrew",
    "rooms": [
      "Porte Cochere",
      "South Foyer Area"
    ],
    "setup": "Risers",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev57",
    "date": "2027-08-07",
    "start": "19:30",
    "end": "22:00",
    "allDay": false,
    "name": "Closing Banquet",
    "category": "Social/Reception",
    "owner": "Andrew",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "setup": "Rounds of 12",
    "avNote": "Full A/V + Lighting",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Large projection screen(s)",
      "Projector(s)",
      "Full audio mix",
      "Full stage lighting"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev58",
    "date": "2027-08-07",
    "start": "22:00",
    "end": null,
    "allDay": false,
    "name": "Evening Celebrations",
    "category": "Social/Reception",
    "owner": "Andrew",
    "rooms": [
      "Common Areas",
      "Foyers"
    ],
    "setup": "Open",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev59",
    "date": "2027-08-07",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Michelle's Closet",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Palmetto 7"
    ],
    "setup": "Exhibit",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev60",
    "date": "2027-08-07",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "History Library",
    "category": "Programming",
    "owner": "Andrew",
    "rooms": [
      "Palmetto 6"
    ],
    "setup": "Tables & TVs",
    "avNote": "TVs",
    "avCompany": "Pinnacle Live (in-house)",
    "avItems": [
      "Flat screen / TV (content loop)"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev61",
    "date": "2027-08-07",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Housing Experience",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Palmetto 10"
    ],
    "setup": "Exhibit",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev62",
    "date": "2027-08-07",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Registration Experience + Vendors",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Royal South Foyer",
      "Majestic South Foyer"
    ],
    "setup": "Exhibit / Tables",
    "avNote": "Music",
    "avCompany": "Pixel Point LLC",
    "avItems": [
      "Background music speaker"
    ],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev63",
    "date": "2027-08-07",
    "start": null,
    "end": null,
    "allDay": true,
    "name": "Staff Office",
    "category": "Logistics",
    "owner": "Staff",
    "rooms": [
      "Gold Office"
    ],
    "setup": "Conference / Storage",
    "avNote": "N/A",
    "avCompany": "TBD / Not yet assigned",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  },
  {
    "id": "ev64",
    "date": "2027-08-08",
    "start": "08:00",
    "end": "11:00",
    "allDay": false,
    "name": "Load Out / Strike",
    "category": "Logistics",
    "owner": "Diane / Venue",
    "rooms": [
      "Majestic Ballroom (All)",
      "Foyers"
    ],
    "setup": "Strike / Load-Out",
    "avNote": "N/A",
    "avCompany": "Pixel Point LLC",
    "avItems": [],
    "status": "confirmed",
    "assignees": []
  }
];
const SEED_PEOPLE = [
  {
    "name": "AJ Martlock",
    "role": "Senior Growth Coordinator",
    "dept": "Membership Growth",
    "contact": "",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Alejandro Sanchez",
    "role": "Coordinator of Membership Growth",
    "dept": "Membership Growth",
    "contact": "",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Andrew Thomas",
    "role": "Director of Membership Experience & Events",
    "dept": "Membership Experience",
    "contact": "260-668-5081",
    "leadership": true,
    "type": "Staff"
  },
  {
    "name": "Arianna Nutile",
    "role": "Chapter Leadership and Advising Coordinator",
    "dept": "Chapter Operations",
    "contact": "",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Aubrey Cala",
    "role": "Director of Health & Safety",
    "dept": "Health and Safety",
    "contact": "573-999-0757",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Brandon Garfinkel",
    "role": "Coordinator of Membership Growth",
    "dept": "Membership Growth",
    "contact": "",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Courtney Williams",
    "role": "Chief Financial Officer",
    "dept": "Executive",
    "contact": "317-313-5885",
    "leadership": true,
    "type": "Staff"
  },
  {
    "name": "Diane Larson",
    "role": "Special Projects Coordinator",
    "dept": "Membership Experience",
    "contact": "317-679-5525",
    "leadership": true,
    "type": "Staff"
  },
  {
    "name": "Elizabeth Allouche",
    "role": "Director of Communications",
    "dept": "Communications",
    "contact": "463-204-9466",
    "leadership": true,
    "type": "Staff"
  },
  {
    "name": "Emily Dudgeon",
    "role": "Accounting Specialist",
    "dept": "Finance",
    "contact": "317-679-8243",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Jorge Ochoa",
    "role": "Director of Chapter Business Operations",
    "dept": "Chapter Operations",
    "contact": "832-332-2415",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Kaitie Ferencik",
    "role": "Associate Creative Director",
    "dept": "Communications",
    "contact": "",
    "leadership": true,
    "type": "Staff"
  },
  {
    "name": "Laura Miller",
    "role": "Accounting Manager",
    "dept": "Finance",
    "contact": "317-426-0368",
    "leadership": true,
    "type": "Staff"
  },
  {
    "name": "Max Laux",
    "role": "Coordinator of Membership Growth",
    "dept": "Membership Growth",
    "contact": "",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Michaela Arthur",
    "role": "Associate Director of Health & Safety",
    "dept": "Health and Safety",
    "contact": "",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Mike VanOsdol",
    "role": "Accounting Manager",
    "dept": "Finance",
    "contact": "",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Nathan Stromberg",
    "role": "Chapter & Alumni Communications Coordinator",
    "dept": "Communications",
    "contact": "",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Nicholas Rodabaugh",
    "role": "Coordinator of Membership Growth",
    "dept": "Membership Growth",
    "contact": "425-409-4382",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Phil Rodriguez",
    "role": "Executive Director",
    "dept": "Executive",
    "contact": "618-971-8508",
    "leadership": true,
    "type": "Staff"
  },
  {
    "name": "Ry Beck",
    "role": "Assistant Executive Director",
    "dept": "Executive",
    "contact": "317-617-3792",
    "leadership": true,
    "type": "Staff"
  },
  {
    "name": "Sally Klimek",
    "role": "Associate Director of Health & Safety",
    "dept": "Health and Safety",
    "contact": "574-386-9074",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Tyler Gunn",
    "role": "Director of Growth",
    "dept": "Membership Growth",
    "contact": "318-837-0400",
    "leadership": true,
    "type": "Staff"
  },
  {
    "name": "Tyler Weiss",
    "role": "Associate Director of Technology",
    "dept": "Technology",
    "contact": "863-712-2766",
    "leadership": false,
    "type": "Staff"
  },
  {
    "name": "Brendan O'Connor",
    "role": "Registration",
    "dept": "Volunteer",
    "contact": "",
    "leadership": false,
    "type": "Volunteer"
  },
  {
    "name": "Casey Dwyer",
    "role": "Technology",
    "dept": "Volunteer",
    "contact": "",
    "leadership": false,
    "type": "Volunteer"
  },
  {
    "name": "Chris Williams",
    "role": "Education",
    "dept": "Volunteer",
    "contact": "",
    "leadership": false,
    "type": "Volunteer"
  },
  {
    "name": "Joe Falter",
    "role": "Excursions",
    "dept": "Volunteer",
    "contact": "",
    "leadership": false,
    "type": "Volunteer"
  },
  {
    "name": "Wyatt Young",
    "role": "Ritual",
    "dept": "Volunteer",
    "contact": "",
    "leadership": false,
    "type": "Volunteer"
  }
];
const SEED_BLOCKS = [
  {
    "id": "b8a4f27b3",
    "person": "Andrew Thomas",
    "date": "2027-08-06",
    "start": "08:30",
    "end": "09:00",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "kind": "duty",
    "label": "AV check-in before Keynote",
    "eventId": null
  },
  {
    "id": "b2ec1ccaa",
    "person": "Andrew Thomas",
    "date": "2027-08-06",
    "start": "09:00",
    "end": "10:00",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "kind": "event",
    "label": "Keynote Speaker",
    "eventId": "ev28"
  },
  {
    "id": "b49c566cc",
    "person": "Andrew Thomas",
    "date": "2027-08-06",
    "start": "10:00",
    "end": "12:00",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "kind": "event",
    "label": "ICA Session 2",
    "eventId": "ev29"
  },
  {
    "id": "b26f90178",
    "person": "Andrew Thomas",
    "date": "2027-08-06",
    "start": "12:00",
    "end": "13:00",
    "rooms": [
      ""
    ],
    "kind": "duty",
    "label": "Staff lunch / floating check-ins",
    "eventId": null
  },
  {
    "id": "b8a0c6052",
    "person": "Andrew Thomas",
    "date": "2027-08-06",
    "start": "14:00",
    "end": "17:00",
    "rooms": [
      ""
    ],
    "kind": "floating",
    "label": "Floating \u2014 available for any issue",
    "eventId": null
  },
  {
    "id": "bfeebedce",
    "person": "Diane Larson",
    "date": "2027-08-05",
    "start": "12:30",
    "end": "13:00",
    "rooms": [
      "Royal Ballroom (All)"
    ],
    "kind": "duty",
    "label": "Pre-ceremony room check",
    "eventId": null
  },
  {
    "id": "b0b484ccb",
    "person": "Diane Larson",
    "date": "2027-08-05",
    "start": "13:00",
    "end": "14:30",
    "rooms": [
      "Royal Ballroom (All)"
    ],
    "kind": "event",
    "label": "Alumni Initiation Ceremony",
    "eventId": "ev15"
  },
  {
    "id": "bd52a1ad7",
    "person": "Diane Larson",
    "date": "2027-08-05",
    "start": "15:00",
    "end": "16:30",
    "rooms": [
      "Royal Ballroom (All)"
    ],
    "kind": "event",
    "label": "Pilgrim Degree",
    "eventId": "ev16"
  },
  {
    "id": "bb8b1de9c",
    "person": "Brendan O'Connor",
    "date": "2027-08-05",
    "start": "09:45",
    "end": "10:00",
    "rooms": [
      "Royal South Foyer + Historic Display"
    ],
    "kind": "duty",
    "label": "Registration desk setup",
    "eventId": null
  },
  {
    "id": "bf7cd5ebd",
    "person": "Brendan O'Connor",
    "date": "2027-08-05",
    "start": "10:00",
    "end": "16:00",
    "rooms": [
      "Royal South Foyer + Historic Display"
    ],
    "kind": "event",
    "label": "Registration desk coverage",
    "eventId": "ev10"
  },
  {
    "id": "b107c4d76",
    "person": "Brendan O'Connor",
    "date": "2027-08-05",
    "start": "16:00",
    "end": "16:30",
    "rooms": [
      ""
    ],
    "kind": "floating",
    "label": "Floating \u2014 wrap-up / help where needed",
    "eventId": null
  },
  {
    "id": "bb812fb07",
    "person": "Casey Dwyer",
    "date": "2027-08-06",
    "start": "08:30",
    "end": "09:00",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "kind": "duty",
    "label": "AV/tech double-check before Keynote",
    "eventId": null
  },
  {
    "id": "b047061ce",
    "person": "Casey Dwyer",
    "date": "2027-08-06",
    "start": "09:00",
    "end": "12:00",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "kind": "duty",
    "label": "On-call tech support \u2014 Keynote + ICA 2",
    "eventId": null
  },
  {
    "id": "b4ac71194",
    "person": "Casey Dwyer",
    "date": "2027-08-06",
    "start": "13:00",
    "end": "17:00",
    "rooms": [
      "Palmetto rooms (TBD)"
    ],
    "kind": "duty",
    "label": "Tech support \u2014 Educational Sessions",
    "eventId": null
  },
  {
    "id": "b09aca120",
    "person": "Chris Williams",
    "date": "2027-08-06",
    "start": "13:00",
    "end": "17:00",
    "rooms": [
      "Palmetto rooms (TBD)"
    ],
    "kind": "event",
    "label": "Undergraduate Educational Sessions",
    "eventId": "ev32"
  },
  {
    "id": "b45742a8f",
    "person": "Wyatt Young",
    "date": "2027-08-05",
    "start": "13:00",
    "end": "14:30",
    "rooms": [
      "Royal Ballroom (All)"
    ],
    "kind": "event",
    "label": "Alumni Initiation Ceremony",
    "eventId": "ev15"
  },
  {
    "id": "b95321946",
    "person": "Wyatt Young",
    "date": "2027-08-05",
    "start": "15:00",
    "end": "16:30",
    "rooms": [
      "Royal Ballroom (All)"
    ],
    "kind": "event",
    "label": "Pilgrim Degree",
    "eventId": "ev16"
  },
  {
    "id": "b0ffd88e8",
    "person": "Wyatt Young",
    "date": "2027-08-07",
    "start": "08:00",
    "end": "09:15",
    "rooms": [
      "Majestic Ballroom (All)"
    ],
    "kind": "event",
    "label": "Bond Eternal Ceremony",
    "eventId": "ev45"
  },
  {
    "id": "bdb0b9a23",
    "person": "Joe Falter",
    "date": "2027-08-06",
    "start": "09:30",
    "end": "12:00",
    "rooms": [
      "Offsite"
    ],
    "kind": "event",
    "label": "Guest Event \u2014 Offsite Excursion",
    "eventId": "ev30"
  },
  {
    "id": "b492dd6a1",
    "person": "Joe Falter",
    "date": "2027-08-06",
    "start": "12:00",
    "end": "13:00",
    "rooms": [
      ""
    ],
    "kind": "floating",
    "label": "Floating \u2014 available after excursion return",
    "eventId": null
  }
];
const SEED_VENDORS = [{"id": "v1", "name": "Pixel Point LLC", "type": "Vendor", "category": "AV \u2014 Majestic Ballroom only", "contact": "Marcus Reyes", "phone": "(305) 555-0142", "note": "Outside AV restricted to Majestic Ballroom per hotel contract. All other rooms use in-house AV."}, {"id": "v2", "name": "Pinnacle Live", "type": "Vendor", "category": "AV \u2014 in-house, all other rooms", "contact": "Fiaz Hassan", "phone": "(305) 555-0177", "note": "Covers Royal Ballroom, Palmetto rooms, Keys Boardroom, and all breakout/reception spaces."}, {"id": "v3", "name": "305 Transportation", "type": "Vendor", "category": "Ground transportation", "contact": "Ashley Salcedo", "phone": "(305) 555-0118", "note": "Bus staging for excursions and Foundation Reception shuttles."}, {"id": "v4", "name": "Ethos Event Collective", "type": "Vendor", "category": "DMC / excursions", "contact": "Jenni Ginepri", "phone": "(305) 555-0193", "note": "Guest excursions \u2014 Little Havana & Wynwood tracks."}, {"id": "v5", "name": "Miami Culinary Tours", "type": "Vendor", "category": "Guest excursion alternative", "contact": "\u2014", "phone": "\u2014", "note": "Alternative to Ethos for guest excursion programming."}, {"id": "v6", "name": "JW Marriott Turnberry \u2014 Lana Sokoloff", "type": "Hotel", "category": "Event Manager", "contact": "Lana Sokoloff", "phone": "(305) 555-0110", "note": "Primary contact for room holds, BEOs, F&B minimums."}, {"id": "v7", "name": "JW Marriott Turnberry \u2014 Nataly Puente", "type": "Hotel", "category": "Sales contact", "contact": "Nataly Puente", "phone": "(305) 555-0121", "note": "Contract terms, space negotiation."}];
const SEED_DOCS = [
  {
    "id": "d1",
    "name": "AV Needs 2027 Convention (v3)",
    "type": "xlsx",
    "category": "AV",
    "updated": "Jun 2026",
    "owner": "Andrew Thomas",
    "url": ""
  },
  {
    "id": "d2",
    "name": "Hotel BEO \u2014 Schedule of Events",
    "type": "pdf",
    "category": "Hotel",
    "updated": "May 2026",
    "owner": "Lana Sokoloff",
    "url": ""
  },
  {
    "id": "d3",
    "name": "Catering Menus (reference)",
    "type": "pdf",
    "category": "F&B",
    "updated": "Sep 2024",
    "owner": "Diane Larson",
    "url": ""
  },
  {
    "id": "d4",
    "name": "Site Visit Recap \u2014 May 2026",
    "type": "pdf",
    "category": "Venue",
    "updated": "May 2026",
    "owner": "Andrew Thomas",
    "url": ""
  },
  {
    "id": "d5",
    "name": "Convention Website Roadmap",
    "type": "xlsx",
    "category": "Technology",
    "updated": "Jun 2026",
    "owner": "Casey",
    "url": ""
  }
];
const SEED_FAQ = [{"id": "f1", "q": "A guest needs the hotel wifi password", "a": "Network: JWTurnberry-Guest. Password is posted at every registration desk and on the room key sleeve. Staff wifi is separate \u2014 ask any Staff badge holder."}, {"id": "f2", "q": "Someone's locked out of their room", "a": "Direct them to the Front Desk in the main lobby with photo ID. Staff cannot issue room keys."}, {"id": "f3", "q": "A session room's AV isn't working", "a": "Majestic Ballroom \u2192 contact Pixel Point. Every other room \u2192 contact Pinnacle Live (Fiaz Hassan). Numbers are in the Directory tab."}, {"id": "f4", "q": "Where's Lost & Found", "a": "Staff Room (every day). Hand off any found item to whoever's at the Staff Room desk."}, {"id": "f5", "q": "A vendor or delivery shows up unannounced", "a": "Have them check in at the Staff Room \u2014 don't direct them straight to a ballroom. Confirm against the vendor directory first."}, {"id": "f6", "q": "Someone needs medical attention", "a": "For anything serious, call hotel security/front desk immediately (dial 0 from any house phone) and notify Diane Larson or Andrew Thomas. The Staff Room has a basic first aid kit."}];
const SEED_MAP = { imageUrl:"/floorplan-seed.png", note:"JW Marriott Turnberry — Conference Center, Floors 1 & 2. Majestic Ballroom 1-8 and Royal Ballroom 1-4 are Floor 1, off the Majestic/Royal corridors. Palmetto 1-8 and Keys Boardroom are Floor 2." };

/* ----------------------------- budget seed data (from Budget Hub artifact) ----------------------------- */
const SEED_EXPENSES = [{"category": "Staff & Volunteer Operations", "item": "Staff Transportation", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 17.78, "estimated": 8000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e1"}, {"category": "Staff & Volunteer Operations", "item": "Staff Lodging", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 66.67, "estimated": 30000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e2"}, {"category": "Staff & Volunteer Operations", "item": "Staff Per Diem", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 15.56, "estimated": 7000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e3"}, {"category": "Staff & Volunteer Operations", "item": "Staff Appreciation Gift", "attendeeType": "All", "entity": "Fraternity", "description": "???", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e4"}, {"category": "Staff & Volunteer Operations", "item": "Volunteer Room Blocks", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 8.89, "estimated": 4000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e5"}, {"category": "Staff & Volunteer Operations", "item": "Staff & Volunteer Clothing (Polos, Name Badges)", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 4.44, "estimated": 2000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e6"}, {"category": "Staff & Volunteer Operations", "item": "Tipping (hotel staff, drivers)", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e7"}, {"category": "Staff & Volunteer Operations", "item": "Volunteer Training Materials", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 0.22, "estimated": 100.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e8"}, {"category": "Staff & Volunteer Operations", "item": "Staff Transportation (Ground)", "attendeeType": "All", "entity": "Fraternity", "description": "Ubers to and from airport", "quantity": 450.0, "unitCost": 2.22, "estimated": 1000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e9"}, {"category": "Staff & Volunteer Operations", "item": "Valet at Hotel", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 2.22, "estimated": 1000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e10"}, {"category": "Staff & Volunteer Operations", "item": "Preperation Costs", "attendeeType": "All", "entity": "Fraternity", "description": "Covers site visit travel and expenses", "quantity": 450.0, "unitCost": 4.44, "estimated": 2000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e11"}, {"category": "Staff & Volunteer Operations", "item": "Staff Compensation", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 13.33, "estimated": 6000.0, "actual": 0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e12"}, {"category": "Staff & Volunteer Operations", "item": "Truck Driving/Logistics", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 4.44, "estimated": 2000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e13"}, {"category": "Convention Technology & Digital Infrastructure", "item": "Website and Attendee Hub", "attendeeType": "All", "entity": "Fraternity", "description": "Event App or Microsite Development", "quantity": 450.0, "unitCost": 75.56, "estimated": 34000.0, "actual": 0.0, "grantable": true, "grantPct": 50, "approval": "Draft", "approver": "", "scales": true, "id": "e14"}, {"category": "Convention Technology & Digital Infrastructure", "item": "Badge Printing Technology and Registration", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 20.0, "estimated": 9000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e15"}, {"category": "Convention Technology & Digital Infrastructure", "item": "Onsite Wi-Fi/Tech Rentals", "attendeeType": "All", "entity": "Fraternity", "description": "Encore Fees and Wifi", "quantity": 450.0, "unitCost": 33.33, "estimated": 15000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e16"}, {"category": "Convention Technology & Digital Infrastructure", "item": "AV for Main Programming", "attendeeType": "All", "entity": "Fraternity", "description": "Pixel Point", "quantity": 450.0, "unitCost": 122.22, "estimated": 55000.0, "actual": 0.0, "grantable": true, "grantPct": 50, "approval": "Draft", "approver": "", "scales": true, "id": "e17"}, {"category": "Attendee Experience & Gift Materials", "item": "Convention Gift Bag Items (Socks, Notebook, Pen, Pin, Stickers)", "attendeeType": "All", "entity": "Fraternity", "description": "No Tshirt", "quantity": 450.0, "unitCost": 35.0, "estimated": 18900.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e18"}, {"category": "Attendee Experience & Gift Materials", "item": "Product Orders (Fez, Badge, etc)", "attendeeType": "Individual", "entity": "Fraternity", "description": "", "quantity": 100.0, "unitCost": 50.0, "estimated": 5000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e19"}, {"category": "Attendee Experience & Gift Materials", "item": "Lanyards, Nametags, Ribbons", "attendeeType": "All", "entity": "Fraternity", "description": "2300 for 550", "quantity": 450.0, "unitCost": 7.0, "estimated": 3780.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e20"}, {"category": "Attendee Experience & Gift Materials", "item": "DSP Chapter Flags", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 2.22, "estimated": 1000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e21"}, {"category": "Attendee Experience & Gift Materials", "item": "Main Area Decor", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 22.22, "estimated": 10000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e22"}, {"category": "Attendee Experience & Gift Materials", "item": "Guest Gift Bags", "attendeeType": "Guests", "entity": "Fraternity", "description": "", "quantity": 70.0, "unitCost": 50.0, "estimated": 3500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e23"}, {"category": "Event Production & General Program Needs", "item": "Pre Con Golf Tournament", "attendeeType": "Individual", "entity": "Fraternity", "description": "", "quantity": 25.0, "unitCost": 150.0, "estimated": 3750.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e24"}, {"category": "Event Production & General Program Needs", "item": "Pilgrim\u2019s Degree Supplies", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e25"}, {"category": "Event Production & General Program Needs", "item": "Brotherhood Circles", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e26"}, {"category": "Event Production & General Program Needs", "item": "Welcome Night Decor", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e27"}, {"category": "Event Production & General Program Needs", "item": "Singing Pilgrims Support (accompanist, supplies)", "attendeeType": "All", "entity": "Fraternity", "description": "Sam Wayne Attendence", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e28"}, {"category": "Event Production & General Program Needs", "item": "Guest Experience Activities (Day 1/Day 2 Events)", "attendeeType": "Guests", "entity": "Fraternity", "description": "", "quantity": 70.0, "unitCost": 100.0, "estimated": 7000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e29"}, {"category": "Event Production & General Program Needs", "item": "Keynote Speaker", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 0.0, "estimated": 0.0, "actual": 0.0, "grantable": true, "grantPct": 100, "approval": "Draft", "approver": "", "scales": false, "id": "e30"}, {"category": "Event Production & General Program Needs", "item": "Educational Sessions", "attendeeType": "Students", "entity": "Fraternity", "description": "All costs including Transportation", "quantity": 130.0, "unitCost": 192.31, "estimated": 25000.0, "actual": 0.0, "grantable": true, "grantPct": 100, "approval": "Draft", "approver": "", "scales": false, "id": "e31"}, {"category": "Event Production & General Program Needs", "item": "1899 Society Event", "attendeeType": "Foundation", "entity": "Foundation", "description": "", "quantity": 0, "unitCost": 0, "estimated": 1000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e32"}, {"category": "Event Production & General Program Needs", "item": "Foundation Reception", "attendeeType": "Foundation", "entity": "Foundation", "description": "Auction Company Fees", "quantity": 0, "unitCost": 0, "estimated": 4000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e33"}, {"category": "Event Production & General Program Needs", "item": "Justin Baldwin Wine Tasting (Decor/AV) (Other Evening Options)", "attendeeType": "Foundation", "entity": "Foundation", "description": "", "quantity": 0, "unitCost": 0, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e34"}, {"category": "Event Production & General Program Needs", "item": "Final Night Social Activity", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e35"}, {"category": "Event Production & General Program Needs", "item": "Banquet Decor", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 6.67, "estimated": 3000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e36"}, {"category": "Event Production & General Program Needs", "item": "History Library", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 2.22, "estimated": 1000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e37"}, {"category": "Event Production & General Program Needs", "item": "Michelle's Closet", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 0.0, "estimated": 0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e38"}, {"category": "Food & Beverage (F&B)", "item": "Board Meeting Meals", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 55.56, "estimated": 25000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e39"}, {"category": "Food & Beverage (F&B)", "item": "Welcome Night Reception", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 75.0, "estimated": 40500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e40"}, {"category": "Food & Beverage (F&B)", "item": "Coffee & Snack Stations", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 12.0, "estimated": 12000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e41"}, {"category": "Food & Beverage (F&B)", "item": "Guest Reception", "attendeeType": "Guests", "entity": "Fraternity", "description": "", "quantity": 70.0, "unitCost": 28.57, "estimated": 2000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e42"}, {"category": "Food & Beverage (F&B)", "item": "Alcove Society Luncheon", "attendeeType": "Foundation", "entity": "Foundation", "description": "", "quantity": 0, "unitCost": 0, "estimated": 5000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e43"}, {"category": "Food & Beverage (F&B)", "item": "1899 Society", "attendeeType": "Foundation", "entity": "Foundation", "description": "", "quantity": 0, "unitCost": 0, "estimated": 15000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e44"}, {"category": "Food & Beverage (F&B)", "item": "Foundation Reception Catering", "attendeeType": "Foundation", "entity": "Foundation", "description": "Off Site", "quantity": 0, "unitCost": 80.0, "estimated": 48000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e45"}, {"category": "Food & Beverage (F&B)", "item": "Final Night VIP Events", "attendeeType": "Foundation", "entity": "Foundation", "description": "", "quantity": 0, "unitCost": 0, "estimated": 5000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e46"}, {"category": "Food & Beverage (F&B)", "item": "Final Night Banquet", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 190.0, "estimated": 86400.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e47"}, {"category": "Ceremony, Awards & Recognition", "item": "Pilgrim Certificates", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 0.44, "estimated": 200.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e48"}, {"category": "Ceremony, Awards & Recognition", "item": "Carnations for Bond Eternal", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e49"}, {"category": "Ceremony, Awards & Recognition", "item": "Color Guard Honorarium & Parking", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 0.44, "estimated": 200.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e50"}, {"category": "Marketing, Media & Promotions", "item": "Photographer & Videographer", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 8.89, "estimated": 4000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e51"}, {"category": "Marketing, Media & Promotions", "item": "Headshots", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 11.11, "estimated": 5000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e52"}, {"category": "Governance & Board Meetings", "item": "Board Meeting AV", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e53"}, {"category": "Governance & Board Meetings", "item": "Foundation Board Room Costs", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e54"}, {"category": "Governance & Board Meetings", "item": "Board Requests", "attendeeType": "All", "entity": "Fraternity", "description": "Tom Archer's water", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e55"}, {"category": "Governance & Board Meetings", "item": "Housing Corp Meeting Expenses", "attendeeType": "All", "entity": "Housing", "description": "", "quantity": 450.0, "unitCost": 1.11, "estimated": 500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e56"}, {"category": "Governance & Board Meetings", "item": "Board Meeting Products (Swag)", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 40.0, "unitCost": 50.0, "estimated": 2000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e57"}, {"category": "Foundation Stewardship & Advancement", "item": "VIP Lounge Materials", "attendeeType": "Foundation", "entity": "Foundation", "description": "", "quantity": 0, "unitCost": 0, "estimated": 2000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e58"}, {"category": "Foundation Stewardship & Advancement", "item": "Campaign Celebration", "attendeeType": "All", "entity": "Foundation", "description": "", "quantity": 0, "unitCost": 0, "estimated": 0, "actual": 0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e59"}, {"category": "Foundation Stewardship & Advancement", "item": "Stewardship Station", "attendeeType": "Foundation", "entity": "Foundation", "description": "", "quantity": 0, "unitCost": 0, "estimated": 2500.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e60"}, {"category": "Foundation Stewardship & Advancement", "item": "Room Drops for Donors", "attendeeType": "Foundation", "entity": "Foundation", "description": "???", "quantity": 0, "unitCost": 0, "estimated": 1000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e61"}, {"category": "Foundation Stewardship & Advancement", "item": "Ribbons / Paddles (Donor-specific)", "attendeeType": "Foundation", "entity": "Foundation", "description": "", "quantity": 0, "unitCost": 0, "estimated": 250.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e62"}, {"category": "Shipping, Supplies & Miscellaneous Logistics", "item": "General Shipping & Storage", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 8.89, "estimated": 4000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e63"}, {"category": "Shipping, Supplies & Miscellaneous Logistics", "item": "AV Equipment Rentals (if not attached to sessions)", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 4.44, "estimated": 2000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e64"}, {"category": "Shipping, Supplies & Miscellaneous Logistics", "item": "Miscellaneous", "attendeeType": "All", "entity": "Fraternity", "description": "", "quantity": 450.0, "unitCost": 22.22, "estimated": 10000.0, "actual": 0.0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": true, "id": "e65"}, {"category": "Undergraduate Travel Expense", "item": "Hotel", "attendeeType": "Students", "entity": "Fraternity", "description": "", "quantity": 130.0, "unitCost": 200.0, "estimated": 26000.0, "actual": 0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e66"}, {"category": "Undergraduate Travel Expense", "item": "Meals", "attendeeType": "Students", "entity": "Fraternity", "description": "", "quantity": 130.0, "unitCost": 100.0, "estimated": 13000.0, "actual": 0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e67"}, {"category": "Undergraduate Travel Expense", "item": "Airfare", "attendeeType": "Students", "entity": "Fraternity", "description": "", "quantity": 130.0, "unitCost": 500.0, "estimated": 65000.0, "actual": 0, "grantable": false, "grantPct": 0, "approval": "Draft", "approver": "", "scales": false, "id": "e68"}];
const SEED_INCOME = {"registration": [{"group": "Undergraduate", "tier": "Preregistrants (grantable)", "qty": 130, "price": 0, "actualQty": 0, "actualTotal": 0, "window": "Grant-covered", "id": "r1"}, {"group": "Undergraduate", "tier": "Early Bird", "qty": 0, "price": 650, "actualQty": 0, "actualTotal": 0, "window": "Jan 25 \u2013 Apr 1", "id": "r2"}, {"group": "Undergraduate", "tier": "Registration", "qty": 0, "price": 750, "actualQty": 0, "actualTotal": 0, "window": "Apr 1 \u2013 Jun 15", "id": "r3"}, {"group": "Undergraduate", "tier": "After June 15", "qty": 0, "price": 950, "actualQty": 0, "actualTotal": 0, "window": "After Jun 15", "id": "r4"}, {"group": "Undergraduate", "tier": "Host Chapter Discount", "qty": 0, "price": 600, "actualQty": 0, "actualTotal": 0, "window": "Iota Eps, Alpha Chi, Beta Zeta", "id": "r5"}, {"group": "Alumni", "tier": "Early Bird", "qty": 125, "price": 900, "actualQty": 0, "actualTotal": 0, "window": "Jan 25 \u2013 Apr 1", "id": "r6"}, {"group": "Alumni", "tier": "Registration", "qty": 100, "price": 900, "actualQty": 0, "actualTotal": 0, "window": "Apr 1 \u2013 Jun 15", "id": "r7"}, {"group": "Alumni", "tier": "After June 15", "qty": 0, "price": 1000, "actualQty": 0, "actualTotal": 0, "window": "After Jun 15", "id": "r8"}, {"group": "Alumni", "tier": "Former Staff", "qty": 20, "price": 600, "actualQty": 0, "actualTotal": 0, "window": "All times", "id": "r9"}, {"group": "Guests", "tier": "Early Bird", "qty": 45, "price": 900, "actualQty": 0, "actualTotal": 0, "window": "Jan 25 \u2013 Apr 1", "id": "r10"}, {"group": "Guests", "tier": "Registration", "qty": 30, "price": 900, "actualQty": 0, "actualTotal": 0, "window": "Apr 1 \u2013 Jun 15", "id": "r11"}, {"group": "Guests", "tier": "After June 15", "qty": 0, "price": 1000, "actualQty": 0, "actualTotal": 0, "window": "After Jun 15", "id": "r12"}], "discounts": [{"label": "Discounted Attendance", "qty": 5, "price": 400, "actualQty": 0, "actualTotal": 0, "id": "d1"}, {"label": "Staff Discount Guest", "qty": 4, "price": 0, "actualQty": 0, "actualTotal": 0, "id": "d2"}], "addons": [{"event": "Golf Tournament", "attendees": 25, "cost": 150, "price": 200, "actualAttendees": 0, "actualRevenue": 0, "id": "a1"}, {"event": "Justin Wine Event", "attendees": 5, "cost": 5, "price": 50, "actualAttendees": 0, "actualRevenue": 0, "id": "a2"}, {"event": "Final Night Banquet (upgrade)", "attendees": 30, "cost": 175, "price": 300, "actualAttendees": 0, "actualRevenue": 0, "id": "a3"}, {"event": "Bourbon Tasting", "attendees": 30, "cost": 65, "price": 100, "actualAttendees": 0, "actualRevenue": 0, "id": "a4"}, {"event": "Guest Excursion \u2013 Little Havana", "attendees": 0, "cost": 0, "price": 0, "actualAttendees": 0, "actualRevenue": 0, "id": "a5"}, {"event": "Guest Excursion \u2013 Wynwood Food & Art", "attendees": 0, "cost": 0, "price": 0, "actualAttendees": 0, "actualRevenue": 0, "id": "a6"}], "items": [{"item": "Budget hold", "qty": 0, "cost": 2500, "price": 5000, "actualQty": 0, "actualRevenue": 0, "id": "i1"}, {"item": "Fez", "qty": 40, "cost": 75, "price": 100, "actualQty": 0, "actualRevenue": 0, "id": "i2"}, {"item": "Golf Polo", "qty": 0, "cost": 0, "price": 0, "actualQty": 0, "actualRevenue": 0, "id": "i3"}, {"item": "Standard Jeweled Badge", "qty": 10, "cost": 60, "price": 100, "actualQty": 0, "actualRevenue": 0, "id": "i4"}, {"item": "10K Gold Jeweled Badge", "qty": 2, "cost": 400, "price": 625, "actualQty": 0, "actualRevenue": 0, "id": "i5"}, {"item": "Necktie", "qty": 50, "cost": 14.5, "price": 30, "actualQty": 0, "actualRevenue": 0, "id": "i6"}, {"item": "Hawaiian Shirt", "qty": 0, "cost": 0, "price": 0, "actualQty": 0, "actualRevenue": 0, "id": "i7"}], "other": [{"label": "Fraternity Funding", "budgeted": 150000, "actual": 0, "note": "HQ undergraduate delegate funding", "id": "o1"}, {"label": "FY26 Grant Support", "budgeted": 81995, "actual": 0, "note": "$200K grant model slice", "id": "o2"}, {"label": "Foundation Reimbursement", "budgeted": 84250, "actual": 0, "note": "Foundation-paid line offsets", "id": "o3"}, {"label": "Foundation \u2013 CVI Sponsorship", "budgeted": 0, "actual": 0, "note": "Discuss with CW", "id": "o4"}]};
const SEED_TRACKER = [];
const SEED_BUDGET_SETTINGS = { grantTarget:0.40, grantPool:200000, varianceThreshold:0.85 };
const SEED_SPONSORS = [
  { id:"s1", name:"Regional Bank Partner", tier:"Gold", amount:10000, stage:"Committed", contact:"", note:"Carry-over from prior cycle" },
  { id:"s2", name:"Insurance Group", tier:"Silver", amount:5000, stage:"Contacted", contact:"", note:"" },
  { id:"s3", name:"Alumni-owned Firm", tier:"Bronze", amount:2500, stage:"Prospect", contact:"", note:"" },
];

const KEYS = {
  sched:"dsp_hub_schedule_v3", people:"dsp_hub_people_v3", blocks:"dsp_hub_blocks_v3",
  vendors:"dsp_hub_vendors_v3", docs:"dsp_hub_docs_v3", faq:"dsp_hub_faq_v3", map:"dsp_hub_map_v3",
  exp:"dsp_hub_expenses_v3", inc:"dsp_hub_income_v3", tracker:"dsp_hub_tracker_v3",
  bset:"dsp_hub_budgetsettings_v3", spon:"dsp_hub_sponsors_v3", audit:"dsp_hub_audit_v3", meta:"dsp_hub_meta_v3",
};

const usd = (n)=> (n<0?"-":"")+"$"+Math.abs(Math.round(n||0)).toLocaleString();
const pct = (n)=> (isFinite(n)?Math.round(n*100):0)+"%";
const uid = (p)=> p+Math.random().toString(36).slice(2,8);
const initials = (name)=> name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const tstr = (ts)=> new Date(ts).toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
function timeToMin(t){ if(!t) return 9999; const [h,m]=t.split(":").map(Number); return h*60+m; }
function fmtTime(t){ if(!t) return "—"; const [h,m]=t.split(":").map(Number); const ap=h>=12?"PM":"AM"; const h12=h%12===0?12:h%12; return `${h12}:${String(m).padStart(2,"0")} ${ap}`; }
function fmtRange(a,b){ if(!a) return "All day"; return `${fmtTime(a)}${b?" – "+fmtTime(b):""}`; }
function fmtDate(d){ if(!d) return ""; const dt=new Date(d+"T00:00:00"); return dt.toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}); }

/* ============================== budget helper functions (from Budget Hub) ============================== */
function computeHeadcount(income){
  const reg = income.registration||[];
  const s = (g)=> reg.filter(r=>r.group===g).reduce((a,r)=>a+(r.qty||0),0);
  const sa = (g)=> reg.filter(r=>r.group===g).reduce((a,r)=>a+(r.actualQty||0),0);
  const undergrad=s("Undergraduate"), alumni=s("Alumni"), guest=s("Guests");
  const disc=(income.discounts||[]).reduce((a,r)=>a+(r.qty||0),0);
  const actual=reg.reduce((a,r)=>a+(r.actualQty||0),0)+(income.discounts||[]).reduce((a,r)=>a+(r.actualQty||0),0);
  return { undergrad, alumni, guest, disc, total:undergrad+alumni+guest+disc, students:undergrad, actual,
           actualUndergrad:sa("Undergraduate"), actualAlumni:sa("Alumni"), actualGuest:sa("Guests") };
}
function headPop(type, s){
  const hc=s._hc||{}; const t=(type||"").toLowerCase();
  if(t.startsWith("student")) return hc.students||0;
  if(t==="guests") return hc.guest||0;
  if(t==="alumni") return hc.alumni||0;
  if(t==="all"||t==="staff"||t==="individual") return hc.total||0;
  return 0;
}
function rowEstimated(r){ if((r.quantity>0)&&(r.unitCost>0)) return r.quantity*r.unitCost; return r.estimated||0; }
function effQty(r,s){ if(!r.scales) return r.quantity; const p=headPop(r.attendeeType,s); return p>0?p:r.quantity; }
function effEstimated(r,s){ const base=rowEstimated(r); if(!r.scales) return base; const p=headPop(r.attendeeType,s); return (p>0 && r.unitCost>0)? r.unitCost*p : base; }
function grantDollars(r,s){ return r.grantable ? effEstimated(r,s)*((r.grantPct||0)/100) : 0; }
function studentShare(r,s){
  const est=effEstimated(r,s); const at=(r.attendeeType||"").toLowerCase();
  if(at.startsWith("student")) return est;
  if(at==="all") return s.totalAttendees>0 ? est*((s.studentCount||0)/s.totalAttendees) : 0;
  return 0;
}

/* ============================== income rollup (shared by Overview) ============================== */
function computeIncome(income, sponsors){
  const reg=income.registration||[], add=income.addons||[], items=income.items||[], other=income.other||[], spon=sponsors||[];
  const regTotal=reg.reduce((a,r)=>a+(r.qty||0)*(r.price||0),0);
  const addonRev=add.reduce((a,r)=>a+(r.attendees||0)*(r.price||0),0);
  const itemRev=items.reduce((a,r)=>a+(r.qty||0)*(r.price||0),0);
  const otherBud=other.reduce((a,r)=>a+(r.budgeted||0),0);
  const sponCommitted=spon.filter(s=>["Committed","Invoiced","Paid"].includes(s.stage)).reduce((a,s)=>a+(s.amount||0),0);
  const sponPaid=spon.filter(s=>s.stage==="Paid").reduce((a,s)=>a+(s.amount||0),0);
  const actualIncome = reg.reduce((a,r)=>a+(r.actualTotal||0),0) + add.reduce((a,r)=>a+(r.actualRevenue||0),0)
    + items.reduce((a,r)=>a+(r.actualRevenue||0),0) + other.reduce((a,r)=>a+(r.actual||0),0) + sponPaid;
  const grand=regTotal+addonRev+itemRev+otherBud+sponCommitted;
  return { regTotal, addonRev, itemRev, otherBud, sponCommitted, sponPaid, actualIncome, grand };
}

/* ============================== category color (stable hash → palette) ============================== */
function catColor(cat){ const s=String(cat||""); let h=0; for(let i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))>>>0; } return CAT_COLORS[h%CAT_COLORS.length]; }

/* ============================== CSV helpers (Staff Plan mass-upload) ============================== */
const BLOCK_TEMPLATE_HEADER=["person","date","start","end","room","kind","label"];
function csvCell(x){ const s=String(x??""); return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s; }
function buildBlockTemplateCSV(people){
  const name=people[0]?.name||"Jane Doe";
  const rows=[
    [name,"2027-08-05","08:00","09:00","Majestic Ballroom (All)","duty","Registration desk setup"],
    [name,"2027-08-05","09:00","10:30","Royal Ballroom (All)","event","Opening ICA Session"],
    [name,"2027-08-05","12:00","13:00","","floating","Floating — available for anything"],
  ];
  return [BLOCK_TEMPLATE_HEADER.join(","),...rows.map(r=>r.map(csvCell).join(","))].join("\r\n");
}
function parseCSV(text){
  const rows=[]; let row=[], cur="", inQ=false;
  for(let i=0;i<text.length;i++){ const ch=text[i];
    if(inQ){ if(ch==='"'){ if(text[i+1]==='"'){cur+='"';i++;} else inQ=false; } else cur+=ch; }
    else { if(ch==='"') inQ=true; else if(ch===","){ row.push(cur); cur=""; }
      else if(ch==="\n"){ row.push(cur); rows.push(row); row=[]; cur=""; }
      else if(ch==="\r"){} else cur+=ch; }
  }
  if(cur!==""||row.length){ row.push(cur); rows.push(row); }
  return rows;
}
function normDate(s){ s=String(s||"").trim(); if(!s) return "";
  let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if(m) return `${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
  m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); if(m){ let y=m[3]; if(y.length===2) y="20"+y; return `${y}-${m[1].padStart(2,"0")}-${m[2].padStart(2,"0")}`; }
  return s; }
function normTime(s){ s=String(s||"").trim(); if(!s) return "";
  let m=s.match(/^(\d{1,2}):(\d{2})\s*([ap]m)?$/i);
  if(m){ let h=+m[1]; const mm=m[2]; if(m[3]){ h=h%12; if(/p/i.test(m[3])) h+=12; } return String(h).padStart(2,"0")+":"+mm; }
  m=s.match(/^(\d{1,2})\s*([ap]m)$/i); if(m){ let h=+m[1]%12; if(/p/i.test(m[2])) h+=12; return String(h).padStart(2,"0")+":00"; }
  return s; }
function normKind(s){ s=String(s||"").trim().toLowerCase(); return ["event","duty","floating"].includes(s)?s:"duty"; }
function parseBlocksFromCSV(text){
  const rows=parseCSV(text).filter(r=>r.some(c=>String(c).trim()!==""));
  if(rows.length===0) return {blocks:[],skipped:0,error:"That file looks empty."};
  const header=rows[0].map(h=>h.trim().toLowerCase());
  const idx=k=>header.indexOf(k);
  const iP=idx("person"),iD=idx("date"),iS=idx("start"),iE=idx("end"),iR=idx("room"),iK=idx("kind"),iL=idx("label");
  if(iP<0||iD<0) return {blocks:[],skipped:0,error:"The CSV needs at least 'person' and 'date' column headers. Start from the template."};
  const blocks=[]; let skipped=0;
  for(let i=1;i<rows.length;i++){ const r=rows[i];
    const person=(r[iP]||"").trim(); const date=normDate(r[iD]||"");
    if(!person||!date){ skipped++; continue; }
    const rooms=(iR>=0?(r[iR]||""):"").split(/[;|]/).map(x=>x.trim()).filter(Boolean);
    blocks.push({ id:uid("b"), person, date, start:iS>=0?normTime(r[iS]):"", end:iE>=0?normTime(r[iE]):"",
      rooms, kind:normKind(iK>=0?r[iK]:""), label:iL>=0?(r[iL]||"").trim():"", eventId:null });
  }
  return {blocks,skipped,error:null};
}

/* ============================== .ics calendar export (Staff Plan) ============================== */
function addMin(t,mins){ const m=timeToMin(t)+mins; const h=Math.floor(m/60)%24; const mm=m%60; return String(h).padStart(2,"0")+":"+String(mm).padStart(2,"0"); }
function icsEscape(s){ return String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n"); }
function icsDateTime(date,time){ return date.replace(/-/g,"")+"T"+(time||"00:00").replace(":","")+"00"; }
function blockToVEVENT(b){
  const uidStr=(b.id||uid("b"))+"@conventionhub.deltasig";
  const stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+Z$/,"Z");
  const summary=(b.label||"Convention block")+(b.person?` — ${b.person}`:"");
  const loc=(b.rooms||[]).join(", ");
  const kindLabel={event:"Event",duty:"Duty",floating:"Floating / Available"}[b.kind]||b.kind||"";
  const desc=`${kindLabel}${b.person?` · ${b.person}`:""} · Delta Sigma Phi 66th National Convention · Miami 2027`;
  const lines=["BEGIN:VEVENT",`UID:${uidStr}`,`DTSTAMP:${stamp}`];
  if(b.start){ const end=b.end||addMin(b.start,60);
    lines.push(`DTSTART:${icsDateTime(b.date,b.start)}`,`DTEND:${icsDateTime(b.date,end)}`); }
  else { lines.push(`DTSTART;VALUE=DATE:${b.date.replace(/-/g,"")}`); }
  lines.push(`SUMMARY:${icsEscape(summary)}`);
  if(loc) lines.push(`LOCATION:${icsEscape(loc)}`);
  lines.push(`DESCRIPTION:${icsEscape(desc)}`,"END:VEVENT");
  return lines.join("\r\n");
}
function downloadFile(content, filename, mime){
  const blob=new Blob([content],{type:mime}); const u=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=u; a.download=filename; a.click(); URL.revokeObjectURL(u);
}
function downloadICS(blocks, filename){
  const body=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Delta Sigma Phi//Convention Hub//EN","CALSCALE:GREGORIAN",
    ...blocks.map(blockToVEVENT),"END:VCALENDAR"].join("\r\n");
  downloadFile(body, filename, "text/calendar");
}
function safeName(s){ return String(s||"plan").replace(/[^a-z0-9]+/gi,"_").replace(/^_+|_+$/g,"").toLowerCase()||"plan"; }

/* ============================== ROOT ==================================== */
function Hub(){
  const [tab,setTab]=useState("schedule");
  const [loaded,setLoaded]=useState(false);
  const [mode,setMode]=useState("staff"); // staff | admin

  const [schedule,setSchedule]=useState(SEED_SCHEDULE);
  const [people,setPeople]=useState(SEED_PEOPLE);
  const [blocks,setBlocks]=useState(SEED_BLOCKS);
  const [vendors,setVendors]=useState(SEED_VENDORS);
  const [docs,setDocs]=useState(SEED_DOCS);
  const [faq,setFaq]=useState(SEED_FAQ);
  const [map,setMap]=useState(SEED_MAP);

  const [expenses,setExpenses]=useState(SEED_EXPENSES);
  const [income,setIncome]=useState(SEED_INCOME);
  const [tracker,setTracker]=useState(SEED_TRACKER);
  const [budgetSettings,setBudgetSettings]=useState(SEED_BUDGET_SETTINGS);
  const [sponsors,setSponsors]=useState(SEED_SPONSORS);
  const [audit,setAudit]=useState([]);

  const [editor,setEditor]=useState("");
  const [status,setStatus]=useState("idle");
  const saveTimer=useRef(null);
  const editorRef=useRef(""); editorRef.current=editor;
  const auditRef=useRef([]); auditRef.current=audit;

  useEffect(()=>{ const l=document.createElement("link"); l.rel="stylesheet";
    l.href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(l); },[]);

  useEffect(()=>{ (async()=>{
    const [sc,pe,bl,ve,dc,fq,mp,ex,inc,tr,bs,sp,au]=await Promise.all([
      sget(KEYS.sched),sget(KEYS.people),sget(KEYS.blocks),sget(KEYS.vendors),sget(KEYS.docs),sget(KEYS.faq),sget(KEYS.map),
      sget(KEYS.exp),sget(KEYS.inc),sget(KEYS.tracker),sget(KEYS.bset),sget(KEYS.spon),sget(KEYS.audit)
    ]);
    if(sc)setSchedule(sc); if(pe)setPeople(pe); if(bl)setBlocks(bl); if(ve)setVendors(ve); if(dc)setDocs(dc); if(fq)setFaq(fq); if(mp)setMap(mp);
    if(ex)setExpenses(ex); if(inc)setIncome(inc); if(tr)setTracker(tr); if(bs)setBudgetSettings({...SEED_BUDGET_SETTINGS,...bs}); if(sp)setSponsors(sp); if(au)setAudit(au);
    setLoaded(true);
  })(); },[]);

  const persist=useCallback((part,val)=>{ setStatus("saving");
    if(saveTimer.current)clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{ await sset(KEYS[part],val); setStatus("saved"); setTimeout(()=>setStatus("idle"),1200); },500);
  },[]);
  const log=useCallback((summary)=>{ const entry={id:uid("au"),ts:Date.now(),editor:editorRef.current||"Team member",summary};
    const next=[entry,...auditRef.current].slice(0,500); setAudit(next); persist("audit",next); },[persist]);

  const upd = {
    schedule:(v,note)=>{ setSchedule(v); persist("sched",v); if(note)log(note); },
    people:(v,note)=>{ setPeople(v); persist("people",v); if(note)log(note); },
    blocks:(v,note)=>{ setBlocks(v); persist("blocks",v); if(note)log(note); },
    vendors:(v)=>{ setVendors(v); persist("vendors",v); },
    docs:(v)=>{ setDocs(v); persist("docs",v); },
    faq:(v)=>{ setFaq(v); persist("faq",v); },
    map:(v)=>{ setMap(v); persist("map",v); },
    expenses:(v,note)=>{ setExpenses(v); persist("exp",v); if(note)log(note); },
    income:(v,note)=>{ setIncome(v); persist("inc",v); if(note)log(note); },
    tracker:(v,note)=>{ setTracker(v); persist("tracker",v); if(note)log(note); },
    budgetSettings:(v,note)=>{ setBudgetSettings(v); persist("bset",v); if(note)log(note); },
    sponsors:(v,note)=>{ setSponsors(v); persist("spon",v); if(note)log(note); },
  };

  const reloadAll = useCallback(async()=>{
    const [sc,pe,bl,ve,dc,fq,mp,ex,inc,tr,bs,sp,au]=await Promise.all([
      sget(KEYS.sched),sget(KEYS.people),sget(KEYS.blocks),sget(KEYS.vendors),sget(KEYS.docs),sget(KEYS.faq),sget(KEYS.map),
      sget(KEYS.exp),sget(KEYS.inc),sget(KEYS.tracker),sget(KEYS.bset),sget(KEYS.spon),sget(KEYS.audit)
    ]);
    if(sc)setSchedule(sc); if(pe)setPeople(pe); if(bl)setBlocks(bl); if(ve)setVendors(ve); if(dc)setDocs(dc); if(fq)setFaq(fq); if(mp)setMap(mp);
    if(ex)setExpenses(ex); if(inc)setIncome(inc); if(tr)setTracker(tr); if(bs)setBudgetSettings({...SEED_BUDGET_SETTINGS,...bs}); if(sp)setSponsors(sp); if(au)setAudit(au);
  },[]);

  useEffect(()=>{ if(mode==="staff" && tab==="budget") setTab("schedule"); },[mode, tab]);

  if(!loaded) return <Splash/>;

  const headcount = computeHeadcount(income);
  const budgetCtx = {...budgetSettings, totalAttendees:headcount.total, studentCount:headcount.students, _hc:headcount};

  const ADMIN_TABS = [
    {id:"schedule",label:"Schedule",icon:CalendarClock},
    {id:"staffplan",label:"Staff Plan",icon:Clock},
    {id:"budget",label:"Budget",icon:Wallet},
    {id:"directory",label:"Directory",icon:Users},
    {id:"map",label:"Hotel Map",icon:MapIcon},
    {id:"faq",label:"FAQ",icon:HelpCircle},
  ];
  const STAFF_TABS = ADMIN_TABS.filter(t=>t.id!=="budget");
  const TABS = mode==="admin" ? ADMIN_TABS : STAFF_TABS;

  return (
    <div style={{background:C.paper,color:C.ink,fontFamily:"Inter, system-ui, sans-serif",minHeight:"100vh"}}>
      <header style={{background:C.deep}} className="px-5 pt-5 pb-3 text-white">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div style={{color:C.gold,letterSpacing:".2em"}} className="text-[10px] font-semibold">DELTA SIGMA PHI · NEXT ERA IN ACTION</div>
            <h1 style={{fontFamily:"Fraunces, serif",fontWeight:600}} className="text-2xl mt-1">Convention Hub</h1>
            <div className="text-[13px]" style={{color:"#bcd2cb"}}>66th National Convention · Aug 4–8, 2027 · JW Marriott Turnberry, Miami</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-2 text-xs" style={{color:"#bcd2cb"}}><span>Editing as</span>
              <input value={editor} onChange={e=>setEditor(e.target.value)} placeholder="your name" className="px-2 py-1 rounded-md text-white text-xs outline-none" style={{background:"#0a2f29",border:"1px solid #1b4a42",width:104}}/></div>
            <SaveDot status={status}/>
            <button onClick={reloadAll} title="Sync" className="px-2.5 py-1.5 rounded-md text-xs font-semibold" style={{background:"#0a2f29",color:"#cfe0da",border:"1px solid #1b4a42"}}><RefreshCw size={13}/></button>
            <div className="flex items-center rounded-md overflow-hidden" style={{border:"1px solid #1b4a42"}}>
              <button onClick={()=>setMode("staff")} className="px-3 py-1.5 text-xs font-semibold" style={{background:mode==="staff"?C.gold:"#0a2f29",color:mode==="staff"?C.deep:"#cfe0da"}}>Staff view</button>
              <button onClick={()=>setMode("admin")} className="px-3 py-1.5 text-xs font-semibold" style={{background:mode==="admin"?C.gold:"#0a2f29",color:mode==="admin"?C.deep:"#cfe0da"}}>Admin</button>
            </div>
          </div>
        </div>
      </header>
      <nav className="px-5 flex gap-1 overflow-x-auto" style={{background:C.deep}}>
        {TABS.map(t=>{ const A=t.icon; const on=tab===t.id;
          return <button key={t.id} onClick={()=>setTab(t.id)} className="flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{color:on?C.gold:"#cfe0da",borderBottom:`3px solid ${on?C.gold:"transparent"}`}}><A size={16}/>{t.label}</button>; })}
      </nav>
      <main className="max-w-[1200px] mx-auto px-5 py-7">
        {tab==="schedule" && <Schedule schedule={schedule} setSchedule={upd.schedule} people={people} blocks={blocks} admin={mode==="admin"}/>}
        {tab==="staffplan" && <StaffPlan people={people} blocks={blocks} setBlocks={upd.blocks} schedule={schedule} admin={mode==="admin"}/>}
        {tab==="budget" && mode==="admin" && <BudgetSection expenses={expenses} setExpenses={upd.expenses} income={income} setIncome={upd.income} settings={budgetCtx} setSettings={upd.budgetSettings} sponsors={sponsors} setSponsors={upd.sponsors} audit={audit} tracker={tracker} setTracker={upd.tracker} editor={editor} headcount={headcount}/>}
        {tab==="directory" && <Directory people={people} setPeople={upd.people} vendors={vendors} setVendors={upd.vendors} docs={docs} setDocs={upd.docs} admin={mode==="admin"}/>}
        {tab==="map" && <HotelMap map={map} setMap={upd.map} admin={mode==="admin"}/>}
        {tab==="faq" && <Faq faq={faq} setFaq={upd.faq} admin={mode==="admin"}/>}
      </main>
      <footer className="text-center text-xs py-6" style={{color:C.muted}}>
        Delta Sigma Phi · 66th National Convention — Miami 2027 · Internal planning workspace · {mode==="admin"?"Admin mode — edits save for everyone":"Shared with the team — auto-saves for everyone"}
        <div className="mt-2"><button onClick={signOut} className="underline" style={{color:C.muted}}>Sign out</button></div>
      </footer>
    </div>
  );
}
function Splash(){ return <div style={{background:C.deep,minHeight:"100vh"}} className="flex items-center justify-center text-white"><div className="flex items-center gap-3"><Loader2 className="animate-spin" size={22}/><span style={{fontFamily:"Fraunces, serif"}} className="text-lg">Loading the Convention Hub…</span></div></div>; }
function SaveDot({status}){ if(status==="saving") return <span className="flex items-center gap-1.5 text-xs" style={{color:"#bcd2cb"}}><Loader2 size={13} className="animate-spin"/>Saving…</span>;
  if(status==="saved") return <span className="flex items-center gap-1.5 text-xs" style={{color:C.gold}}><Check size={13}/>Saved</span>;
  return <span className="text-xs" style={{color:"#7fa49a"}}>Auto-save</span>; }

/* ============================== shared bits ==================================== */
function Card({children,pad=true,style}){ return <div style={{background:C.card,border:`1px solid ${C.line}`,borderRadius:14,...style}} className={pad?"p-5":""}>{children}</div>; }
function SectionTitle({children,sub,right}){ return <div className="mb-5 flex items-start justify-between flex-wrap gap-3"><div><h2 style={{fontFamily:"Fraunces, serif",fontWeight:600}} className="text-xl">{children}</h2>{sub&&<p className="text-sm mt-0.5" style={{color:C.muted}}>{sub}</p>}</div>{right}</div>; }
function Pill({text,color}){ return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{background:color+"22",color}}>{text}</span>; }
function Avatar({name,size=30}){ return <div style={{width:size,height:size,borderRadius:size/2,background:C.deep,color:C.gold}} className="flex items-center justify-center text-[11px] font-semibold flex-shrink-0">{initials(name)}</div>; }
function TxtCell({value,onChange,w=140,placeholder}){ return <input value={value||""} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="px-2 py-1 text-sm outline-none rounded-md" style={{border:`1px solid ${C.line}`,background:"#fff",width:w}}/>; }
function NumCell({value,onChange,prefix,w=90,step="1"}){ return <div className="inline-flex items-center rounded-md" style={{border:`1px solid ${C.line}`,background:"#fff"}}>{prefix&&<span className="pl-2 text-xs" style={{color:C.muted}}>{prefix}</span>}<input type="number" step={step} value={value===0?0:value||""} onChange={e=>onChange(e.target.value===""?0:parseFloat(e.target.value))} className="px-2 py-1 text-sm outline-none bg-transparent text-right" style={{width:w}}/></div>; }
function Select({value,onChange,options,w=120,color}){ return <select value={value} onChange={e=>onChange(e.target.value)} className="px-2 py-1 text-sm outline-none rounded-md font-medium" style={{border:`1px solid ${C.line}`,background:"#fff",width:w,color:color||C.ink}}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>; }
function Stat({label,value,tone,accent,sub}){ return <div style={{background:accent?tone:C.card,border:`1px solid ${accent?tone:C.line}`,borderRadius:14}} className="p-4">
  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{color:accent?"#ffffffcc":C.muted}}>{label}</div>
  <div style={{fontFamily:"Fraunces,serif",fontWeight:700,color:accent?"#fff":tone}} className="text-[26px] leading-tight mt-1">{value}</div>
  {sub&&<div className="text-xs mt-0.5" style={{color:accent?"#ffffffcc":C.muted}}>{sub}</div>}</div>; }
function Field({label,children}){ return <div><div className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{color:C.muted}}>{label}</div>{children}</div>; }
function Kpi({label,value,sub,tone,accent}){ return <div style={{background:accent?tone:C.card,border:`1px solid ${accent?tone:C.line}`,borderRadius:14}} className="p-4"><div className="text-[11px] font-semibold uppercase tracking-wide" style={{color:accent?"#ffffffcc":C.muted}}>{label}</div><div style={{fontFamily:"Fraunces,serif",fontWeight:700,color:accent?"#fff":tone}} className="text-[26px] leading-tight mt-1">{value}</div>{sub&&<div className="text-xs mt-0.5" style={{color:accent?"#ffffffcc":C.muted}}>{sub}</div>}</div>; }
function ReadField({label,value,sub}){ return <div><div className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{color:C.muted}}>{label}</div><div style={{fontFamily:"Fraunces,serif",fontWeight:700,color:C.deep}} className="text-lg leading-none">{value}</div>{sub&&<div className="text-[10px] mt-0.5" style={{color:C.muted}}>{sub}</div>}</div>; }

/* ============================== multi-select control (rooms / AV items) ============================== */
function MultiSelect({values, onChange, options, placeholder, w=260}){
  const [open,setOpen]=useState(false);
  const toggle=(opt)=> onChange(values.includes(opt) ? values.filter(v=>v!==opt) : [...values, opt]);
  return <div className="relative" style={{width:w}}>
    <button onClick={()=>setOpen(!open)} className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between" style={{border:`1px solid ${C.line}`,background:"#fff"}}>
      <span className="truncate" style={{color:values.length?C.ink:C.muted}}>{values.length ? values.join(", ") : (placeholder||"Select…")}</span>
      <ChevronDown size={14} style={{color:C.muted,flexShrink:0}}/>
    </button>
    {open && <div className="absolute z-20 mt-1 w-full rounded-md shadow-lg overflow-y-auto" style={{background:"#fff",border:`1px solid ${C.line}`,maxHeight:260}}>
      {options.map(opt=> <label key={opt} className="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50">
        <input type="checkbox" checked={values.includes(opt)} onChange={()=>toggle(opt)} style={{accentColor:C.deep}}/>{opt}
      </label>)}
      <div className="px-3 py-1.5"><button onClick={()=>setOpen(false)} className="text-xs font-semibold" style={{color:C.nile}}>Done</button></div>
    </div>}
  </div>;
}

/* ============================== SCHEDULE ================================ */
function Schedule({schedule,setSchedule,people,blocks,admin}){
  const [filterMode,setFilterMode]=useState("event");
  const [person,setPerson]=useState("");
  const [dayFilter,setDayFilter]=useState("All days");
  const [q,setQ]=useState("");
  const [view,setView]=useState("list"); // list | timeline | calendar
  const [editing,setEditing]=useState(null);
  const [adding,setAdding]=useState(false);

  const dates = useMemo(()=>Array.from(new Set(schedule.map(e=>e.date))).sort(),[schedule]);
  const allNames = useMemo(()=>{ const s=new Set(); schedule.forEach(e=>(e.assignees||[]).forEach(n=>s.add(n))); people.forEach(p=>s.add(p.name)); return Array.from(s).sort(); },[schedule,people]);

  const filtered = useMemo(()=>{
    let list = [...schedule];
    if(dayFilter!=="All days") list = list.filter(e=>e.date===dayFilter);
    if(filterMode==="person" && person) list = list.filter(e=>(e.assignees||[]).includes(person));
    if(q) list = list.filter(e=>(e.name+(e.rooms||[]).join(" ")+(e.assignees||[]).join(" ")+e.category).toLowerCase().includes(q.toLowerCase()));
    return list.sort((a,b)=> a.date===b.date ? timeToMin(a.start)-timeToMin(b.start) : a.date.localeCompare(b.date));
  },[schedule,dayFilter,filterMode,person,q]);

  const grouped = useMemo(()=>{ const g={}; filtered.forEach(e=>{(g[e.date]=g[e.date]||[]).push(e);}); return g; },[filtered]);

  const save=(ev)=>{ if(ev.id && schedule.some(x=>x.id===ev.id)){ setSchedule(schedule.map(x=>x.id===ev.id?ev:x), `Updated "${ev.name}"`); } else { setSchedule([...schedule, {...ev, id:uid("ev")}], `Added "${ev.name}"`); } setEditing(null); setAdding(false); };
  const del=(ev)=> setSchedule(schedule.filter(x=>x.id!==ev.id), `Deleted "${ev.name}"`);

  return <div className="space-y-5">
    <SectionTitle sub="One schedule — room, AV company &amp; items, and who's responsible all live on each event." right={admin && <button onClick={()=>setAdding(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-white text-sm font-semibold" style={{background:C.deep}}><Plus size={15}/>Add event</button>}>Schedule</SectionTitle>

    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-md overflow-hidden" style={{border:`1px solid ${C.line}`}}>
          <button onClick={()=>setFilterMode("event")} className="px-3 py-2 text-sm font-semibold flex items-center gap-1.5" style={{background:filterMode==="event"?C.deep:"#fff",color:filterMode==="event"?"#fff":C.ink}}><CalendarDays size={14}/>By event</button>
          <button onClick={()=>setFilterMode("person")} className="px-3 py-2 text-sm font-semibold flex items-center gap-1.5" style={{background:filterMode==="person"?C.deep:"#fff",color:filterMode==="person"?"#fff":C.ink}}><User size={14}/>By person</button>
        </div>
        {filterMode==="person" && <Select value={person} onChange={setPerson} options={["",...allNames]} w={200}/>}
        <Select value={dayFilter} onChange={setDayFilter} options={["All days",...dates]} w={170}/>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md flex-1 min-w-[180px]" style={{background:"#fff",border:`1px solid ${C.line}`}}><Search size={15} style={{color:C.muted}}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search event, room, or name…" className="outline-none text-sm flex-1"/></div>
        <div className="flex items-center rounded-md overflow-hidden" style={{border:`1px solid ${C.line}`}}>
          {[["list","List",CalendarDays],["timeline","Hour-by-hour",Clock],["calendar","Day-of",CalendarClock]].map(([id,lbl,Ic])=>
            <button key={id} onClick={()=>setView(id)} className="px-3 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap" style={{background:view===id?C.nile:"#fff",color:view===id?"#fff":C.ink}}><Ic size={14}/>{lbl}</button>)}
        </div>
      </div>
      {filterMode==="person" && !person && <p className="text-xs mt-2" style={{color:C.muted}}>Pick a name above to see everything that person is responsible for.</p>}
    </Card>

    {Object.keys(grouped).length===0 && <Card><p className="text-sm" style={{color:C.muted}}>No events match. {filterMode==="person" && person ? `${person} has nothing assigned in this range.` : ""}</p></Card>}

    {view==="list" && Object.entries(grouped).map(([date,evs])=>
      <div key={date}>
        <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{color:C.nile}}>{fmtDate(date)}</h3>
        <div className="space-y-2">{evs.map(ev=><EventRow key={ev.id} ev={ev} admin={admin} onEdit={()=>setEditing(ev)} onDelete={()=>del(ev)}/>)}</div>
      </div>
    )}
    {view==="timeline" && Object.entries(grouped).map(([date,evs])=>
      <ScheduleTimeline key={date} date={date} evs={evs} admin={admin} onEdit={setEditing}/>
    )}
    {view==="calendar" && Object.entries(grouped).map(([date,evs])=>
      <ScheduleCalendar key={date} date={date} evs={evs} admin={admin} onEdit={setEditing}/>
    )}
    {(editing||adding) && <EventModal ev={editing} people={people} onClose={()=>{setEditing(null);setAdding(false);}} onSave={save}/>}
  </div>;
}
function EventRow({ev,admin,onEdit,onDelete}){
  return <Card>
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex-1 min-w-[240px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" style={{fontFamily:"Fraunces,serif"}}>{ev.name}</span>
          <Pill text={ev.status} color={EVENT_STATUS_COLOR[ev.status]||C.muted}/>
        </div>
        <div className="flex items-center gap-3 text-xs mt-1 flex-wrap" style={{color:C.muted}}>
          <span className="flex items-center gap-1"><CalendarClock size={12}/>{ev.allDay?"All day":fmtRange(ev.start,ev.end)}</span>
          {(ev.rooms||[]).map(r=><span key={r} className="flex items-center gap-1"><MapPin size={12}/>{r}</span>)}
        </div>
        {(ev.avCompany || (ev.avItems||[]).length>0) && <div className="text-xs mt-1.5 grid gap-0.5" style={{color:C.muted}}>
          {ev.avCompany && <div><b style={{color:C.ink}}>AV company:</b> {ev.avCompany}</div>}
          {(ev.avItems||[]).length>0 && <div><b style={{color:C.ink}}>AV items:</b> {ev.avItems.join(", ")}</div>}
          {ev.setup && <div><b style={{color:C.ink}}>Setup:</b> {ev.setup}</div>}
        </div>}
      </div>
      <div className="text-right flex flex-col items-end gap-2">
        {(ev.assignees||[]).length>0 ?
          <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-[180px]">{ev.assignees.map(n=><span key={n} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full" style={{background:C.chip}}><Avatar name={n} size={18}/>{n}</span>)}</div>
          : <Pill text="Unassigned" color={C.muted}/>}
        {admin && <div className="flex items-center gap-2 mt-1"><button onClick={onEdit} className="text-xs font-semibold flex items-center gap-1" style={{color:C.nile}}><Pencil size={12}/>Edit</button><button onClick={onDelete} style={{color:C.muted}}><Trash2 size={14}/></button></div>}
      </div>
    </div>
  </Card>;
}
function EventModal({ev,people,onClose,onSave}){
  const [f,setF]=useState(ev || {date:"",start:"",end:"",allDay:false,name:"",category:"",owner:"",rooms:[],setup:"",avNote:"",avCompany:"TBD / Not yet assigned",avItems:[],status:"confirmed",assignees:[]});
  const [newAssignee,setNewAssignee]=useState("");
  const addAssignee=()=>{ if(newAssignee && !f.assignees.includes(newAssignee)){ setF({...f,assignees:[...f.assignees,newAssignee]}); setNewAssignee(""); } };
  const removeAssignee=(n)=> setF({...f,assignees:f.assignees.filter(x=>x!==n)});
  return <div className="fixed inset-0 flex items-center justify-center px-4 py-8" style={{background:"#00000066",zIndex:50}}>
    <div style={{maxHeight:"90vh",overflowY:"auto"}} className="w-full">
    <Card style={{maxWidth:560,width:"100%",margin:"0 auto"}}>
      <div className="flex items-center justify-between mb-4"><h3 className="font-semibold" style={{fontFamily:"Fraunces,serif"}}>{ev?"Edit event":"Add event"}</h3><button onClick={onClose}><X size={18} style={{color:C.muted}}/></button></div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Date"><input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field>
        <Field label="Status"><Select value={f.status} onChange={v=>setF({...f,status:v})} options={["confirmed","tbd","pending"]} w={"100%"}/></Field>
        <Field label="Start time"><input type="time" disabled={f.allDay} value={f.start||""} onChange={e=>setF({...f,start:e.target.value})} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`,opacity:f.allDay?0.5:1}}/></Field>
        <Field label="End time"><input type="time" disabled={f.allDay} value={f.end||""} onChange={e=>setF({...f,end:e.target.value})} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`,opacity:f.allDay?0.5:1}}/></Field>
      </div>
      <label className="flex items-center gap-2 text-sm mb-3"><input type="checkbox" checked={f.allDay} onChange={e=>setF({...f,allDay:e.target.checked})} style={{accentColor:C.deep}}/>All day</label>
      <Field label="Event name"><input value={f.name} onChange={e=>setF({...f,name:e.target.value})} className="w-full mb-3 px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Category"><input value={f.category} onChange={e=>setF({...f,category:e.target.value})} placeholder="e.g. Ceremony" className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field>
        <Field label="Owner"><input value={f.owner} onChange={e=>setF({...f,owner:e.target.value})} placeholder="e.g. Andrew" className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field>
      </div>
      <Field label="Room(s) — multi-select"><MultiSelect values={f.rooms} onChange={v=>setF({...f,rooms:v})} options={ROOM_LIST} w="100%" placeholder="Select room(s)…"/></Field>
      <div className="mt-3"><Field label="Setup / layout"><input value={f.setup} onChange={e=>setF({...f,setup:e.target.value})} placeholder="e.g. Theater seating, rounds of 12" className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field></div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label="AV company"><Select value={f.avCompany} onChange={v=>setF({...f,avCompany:v})} options={AV_COMPANIES} w="100%"/></Field>
        <Field label="AV items — multi-select"><MultiSelect values={f.avItems} onChange={v=>setF({...f,avItems:v})} options={AV_ITEMS} w="100%" placeholder="Select AV items…"/></Field>
      </div>
      <div className="mt-3"><Field label="Assigned to">
        <div className="flex gap-2 mb-2"><input value={newAssignee} onChange={e=>setNewAssignee(e.target.value)} placeholder="Type a name…" className="flex-1 px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}} list="peoplenames"/>
          <datalist id="peoplenames">{people.map(p=><option key={p.name} value={p.name}/>)}</datalist>
          <button onClick={addAssignee} className="px-3 py-2 rounded-md text-sm font-semibold" style={{background:C.chip,color:C.deep}}>Add</button></div>
        <div className="flex flex-wrap gap-1.5">{f.assignees.map(n=><span key={n} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full" style={{background:C.chip}}>{n}<button onClick={()=>removeAssignee(n)}><X size={12}/></button></span>)}</div>
      </Field></div>
      <button onClick={()=>onSave(f)} className="w-full mt-4 py-2.5 rounded-md text-white font-semibold text-sm" style={{background:C.deep}}>{ev?"Save changes":"Add event"}</button>
    </Card></div>
  </div>;
}

/* ---- Schedule: hour-by-hour agenda (time rail) ---- */
function ScheduleTimeline({date,evs,admin,onEdit}){
  const sorted=[...evs].sort((a,b)=>timeToMin(a.start)-timeToMin(b.start));
  return <div>
    <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{color:C.nile}}>{fmtDate(date)}</h3>
    <Card pad={false}>
      <div className="divide-y" style={{borderColor:C.line}}>
        {sorted.map(ev=>{ const col=catColor(ev.category);
          return <div key={ev.id} className="flex items-stretch gap-3 px-3 py-2.5" style={{borderColor:C.line}}>
            <div className="flex-shrink-0 text-right pt-0.5" style={{width:104}}>
              <div className="text-sm font-semibold" style={{color:C.ink,fontFamily:"Fraunces,serif"}}>{ev.allDay?"All day":fmtTime(ev.start)}</div>
              {!ev.allDay && ev.end && <div className="text-[11px]" style={{color:C.muted}}>to {fmtTime(ev.end)}</div>}
            </div>
            <div className="w-1 rounded-full flex-shrink-0" style={{background:col}}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm" style={{fontFamily:"Fraunces,serif"}}>{ev.name}</span>
                <Pill text={ev.status} color={EVENT_STATUS_COLOR[ev.status]||C.muted}/>
                {admin && <button onClick={()=>onEdit(ev)} className="text-[11px] font-semibold flex items-center gap-1" style={{color:C.nile}}><Pencil size={11}/>Edit</button>}
              </div>
              <div className="flex items-center gap-3 text-xs mt-0.5 flex-wrap" style={{color:C.muted}}>
                {ev.category && <span className="font-medium" style={{color:col}}>{ev.category}</span>}
                {(ev.rooms||[]).map(r=><span key={r} className="flex items-center gap-1"><MapPin size={11}/>{r}</span>)}
                {(ev.assignees||[]).length>0 && <span className="flex items-center gap-1"><User size={11}/>{ev.assignees.join(", ")}</span>}
              </div>
            </div>
          </div>; })}
      </div>
    </Card>
  </div>;
}

/* ---- Schedule: day-of calendar (time-scaled columns) ---- */
function ScheduleCalendar({date,evs,admin,onEdit}){
  const PXPM=0.85; // px per minute
  const timed=evs.filter(e=>!e.allDay && e.start);
  const untimed=evs.filter(e=>e.allDay || !e.start);
  // layout: column packing for overlaps
  const items=timed.map(e=>({ev:e,s:timeToMin(e.start),e2:(e.end?timeToMin(e.end):timeToMin(e.start)+60)})).sort((a,b)=>a.s-b.s||a.e2-b.e2);
  const colEnds=[];
  items.forEach(it=>{ let placed=false; for(let c=0;c<colEnds.length;c++){ if(colEnds[c]<=it.s){ it.col=c; colEnds[c]=it.e2; placed=true; break; } } if(!placed){ it.col=colEnds.length; colEnds.push(it.e2); } });
  const ncols=Math.max(1,colEnds.length);
  const starts=items.map(i=>i.s), ends=items.map(i=>i.e2);
  const dayMin=items.length?Math.floor(Math.min(...starts)/60)*60:8*60;
  const dayMax=items.length?Math.ceil(Math.max(...ends)/60)*60:18*60;
  const height=Math.max(120,(dayMax-dayMin)*PXPM);
  const hours=[]; for(let m=dayMin;m<=dayMax;m+=60) hours.push(m);
  return <div>
    <h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{color:C.nile}}>{fmtDate(date)}</h3>
    {untimed.length>0 && <div className="flex flex-wrap gap-2 mb-2">{untimed.map(ev=>
      <span key={ev.id} onClick={()=>admin&&onEdit(ev)} className="text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{background:catColor(ev.category)+"22",color:catColor(ev.category),cursor:admin?"pointer":"default"}}><CalendarDays size={11}/>{ev.name}{ev.allDay?" · all day":""}</span>)}</div>}
    <Card pad={false}>
      <div className="overflow-x-auto p-3">
        <div className="flex" style={{minWidth:Math.max(320,140+ncols*150)}}>
          <div className="flex-shrink-0" style={{width:56,position:"relative",height}}>
            {hours.map(m=><div key={m} className="absolute text-[10px] font-semibold" style={{top:(m-dayMin)*PXPM-6,right:8,color:C.muted}}>{fmtTime(`${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`)}</div>)}
          </div>
          <div className="relative flex-1" style={{height,borderLeft:`1px solid ${C.line}`}}>
            {hours.map(m=><div key={m} className="absolute left-0 right-0" style={{top:(m-dayMin)*PXPM,borderTop:`1px solid ${C.line}`}}/>)}
            {items.map(it=>{ const ev=it.ev; const col=catColor(ev.category); const top=(it.s-dayMin)*PXPM; const h=Math.max(22,(it.e2-it.s)*PXPM-2);
              const widthPct=100/ncols; const leftPct=it.col*widthPct;
              return <div key={ev.id} onClick={()=>admin&&onEdit(ev)} title={`${ev.name} · ${fmtRange(ev.start,ev.end)}`}
                className="absolute rounded-md px-2 py-1 overflow-hidden" style={{top,height:h,left:`calc(${leftPct}% + 4px)`,width:`calc(${widthPct}% - 8px)`,background:col+"1f",borderLeft:`3px solid ${col}`,cursor:admin?"pointer":"default"}}>
                <div className="text-[11px] font-semibold leading-tight truncate" style={{color:C.ink}}>{ev.name}</div>
                <div className="text-[10px] truncate" style={{color:C.muted}}>{fmtRange(ev.start,ev.end)}</div>
                {h>54 && (ev.rooms||[]).length>0 && <div className="text-[10px] truncate flex items-center gap-1 mt-0.5" style={{color:col}}><MapPin size={9}/>{ev.rooms[0]}{ev.rooms.length>1?` +${ev.rooms.length-1}`:""}</div>}
              </div>; })}
            {items.length===0 && <div className="absolute inset-0 flex items-center justify-center text-sm" style={{color:C.muted}}>No timed events this day.</div>}
          </div>
        </div>
      </div>
    </Card>
  </div>;
}
function StaffPlan({people,blocks,setBlocks,schedule,admin}){
  const [person,setPerson]=useState(people[0]?.name||"");
  const [editing,setEditing]=useState(null);
  const [adding,setAdding]=useState(false);
  const [importMsg,setImportMsg]=useState(null);
  const fileRef=useRef(null);

  const myBlocks = useMemo(()=>blocks.filter(b=>b.person===person).sort((a,b)=> a.date===b.date? timeToMin(a.start)-timeToMin(b.start) : a.date.localeCompare(b.date)),[blocks,person]);
  const grouped = useMemo(()=>{ const g={}; myBlocks.forEach(b=>{(g[b.date]=g[b.date]||[]).push(b);}); return g; },[myBlocks]);

  const save=(b)=>{ if(b.id && blocks.some(x=>x.id===b.id)){ setBlocks(blocks.map(x=>x.id===b.id?b:x), `Updated ${b.person}'s plan`); } else { setBlocks([...blocks, {...b, id:uid("b"), person}], `Added a block for ${person}`); } setEditing(null); setAdding(false); };
  const del=(b)=> setBlocks(blocks.filter(x=>x.id!==b.id), `Removed a block for ${person}`);

  const downloadTemplate=()=> downloadFile(buildBlockTemplateCSV(people), "staff_plan_template.csv", "text/csv");
  const onFile=(e)=>{ const f=e.target.files?.[0]; if(!f){ return; } const rd=new FileReader();
    rd.onload=()=>{ const {blocks:nb,skipped,error}=parseBlocksFromCSV(String(rd.result||""));
      if(error){ setImportMsg({type:"error",text:error}); return; }
      if(nb.length===0){ setImportMsg({type:"error",text:`No valid rows found.${skipped?` ${skipped} row(s) skipped — each needs a person and a date.`:""}`}); return; }
      setBlocks([...blocks,...nb], `Imported ${nb.length} staff-plan block(s) via CSV`);
      const ppl=Array.from(new Set(nb.map(b=>b.person)));
      setImportMsg({type:"ok",text:`Added ${nb.length} block(s) across ${ppl.length} ${ppl.length===1?"person":"people"}.${skipped?` ${skipped} row(s) skipped (missing person or date).`:""}`});
    };
    rd.readAsText(f); e.target.value="";
  };
  const exportPerson=()=>{ if(myBlocks.length===0) return; downloadICS(myBlocks, `${safeName(person)}_convention_plan.ics`); };
  const exportDay=(date,bs)=> downloadICS(bs, `${safeName(person)}_${date}.ics`);

  return <div className="space-y-5">
    <SectionTitle sub="Hour-by-hour: where each person needs to be, whether that's a specific event, a duty, or floating/available time.">Staff Plan</SectionTitle>
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <Select value={person} onChange={setPerson} options={people.map(p=>p.name)} w={220}/>
        {admin && <button onClick={()=>setAdding(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-white text-sm font-semibold" style={{background:C.deep}}><Plus size={15}/>Add block</button>}
        <button onClick={exportPerson} disabled={myBlocks.length===0} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold" style={{background:myBlocks.length?C.chip:"#f0efe9",color:myBlocks.length?C.deep:C.muted}}><CalendarDays size={15}/>Add full plan to calendar</button>
        {admin && <div className="ml-auto flex items-center gap-2">
          <button onClick={downloadTemplate} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold" style={{background:C.chip,color:C.deep}}><Download size={15}/>Template</button>
          <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold" style={{background:C.gold,color:C.deep}}><Upload size={15}/>Bulk upload CSV</button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} style={{display:"none"}}/>
        </div>}
      </div>
      {admin && <p className="text-[11px] mt-2" style={{color:C.muted}}>Template columns: <b>person, date, start, end, room, kind, label</b>. Use 24h or “2:00 PM” times; separate multiple rooms with “;”. <b>kind</b> is event, duty, or floating. Rows without a person and date are skipped.</p>}
      {importMsg && <div className="mt-2 text-xs font-semibold px-3 py-2 rounded-md flex items-center justify-between gap-3" style={{background:importMsg.type==="ok"?"#eaf5ef":"#fdf0ea",color:importMsg.type==="ok"?C.pos:C.neg}}><span>{importMsg.text}</span><button onClick={()=>setImportMsg(null)}><X size={14}/></button></div>}
    </Card>
    {Object.keys(grouped).length===0 && <Card><p className="text-sm" style={{color:C.muted}}>No plan built for {person} yet.{admin? " Add a block, or bulk-upload a CSV to build several at once.":""}</p></Card>}
    {Object.entries(grouped).map(([date,bs])=>
      <div key={date}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wide" style={{color:C.nile}}>{fmtDate(date)}</h3>
          <button onClick={()=>exportDay(date,bs)} className="text-xs font-semibold flex items-center gap-1" style={{color:C.nile}}><CalendarDays size={12}/>Add day to calendar</button>
        </div>
        <div className="space-y-2">{bs.map(b=><BlockRow key={b.id} b={b} admin={admin} onEdit={()=>setEditing(b)} onDelete={()=>del(b)}/>)}</div>
      </div>
    )}
    {(editing||adding) && <BlockModal b={editing} person={person} schedule={schedule} onClose={()=>{setEditing(null);setAdding(false);}} onSave={save}/>}
  </div>;
}
function BlockRow({b,admin,onEdit,onDelete}){
  const kindLabel = {event:"Event",duty:"Duty",floating:"Floating / Available"}[b.kind]||b.kind;
  return <Card style={{borderLeft:`4px solid ${BLOCK_KIND_COLOR[b.kind]||C.muted}`}}>
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <div className="flex items-center gap-2"><Pill text={kindLabel} color={BLOCK_KIND_COLOR[b.kind]||C.muted}/><span className="font-semibold text-sm">{b.label}</span></div>
        <div className="flex items-center gap-3 text-xs mt-1.5 flex-wrap" style={{color:C.muted}}>
          <span className="flex items-center gap-1"><Clock size={12}/>{fmtRange(b.start,b.end)}</span>
          {(b.rooms||[]).map(r=><span key={r} className="flex items-center gap-1"><MapPin size={12}/>{r}</span>)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={()=>downloadICS([b], `${safeName(b.person)}_${safeName(b.label||"block")}.ics`)} title="Add to calendar (.ics)" className="text-xs font-semibold flex items-center gap-1" style={{color:C.nile}}><CalendarDays size={12}/>Calendar</button>
        {admin && <><button onClick={onEdit} className="text-xs font-semibold flex items-center gap-1" style={{color:C.nile}}><Pencil size={12}/>Edit</button><button onClick={onDelete} style={{color:C.muted}}><Trash2 size={14}/></button></>}
      </div>
    </div>
  </Card>;
}
function BlockModal({b,person,schedule,onClose,onSave}){
  const [f,setF]=useState(b || {date:schedule[0]?.date||"",start:"",end:"",rooms:[],kind:"duty",label:"",eventId:null,person});
  const linkEvent=(evId)=>{ const ev=schedule.find(e=>e.id===evId); if(ev){ setF({...f,kind:"event",eventId:ev.id,label:ev.name,date:ev.date,start:ev.start||f.start,end:ev.end||f.end,rooms:ev.rooms||f.rooms}); } else { setF({...f,eventId:null}); } };
  return <div className="fixed inset-0 flex items-center justify-center px-4 py-8" style={{background:"#00000066",zIndex:50}}>
    <div style={{maxHeight:"90vh",overflowY:"auto"}} className="w-full">
    <Card style={{maxWidth:480,width:"100%",margin:"0 auto"}}>
      <div className="flex items-center justify-between mb-4"><h3 className="font-semibold" style={{fontFamily:"Fraunces,serif"}}>{b?"Edit block":"Add block"} — {person}</h3><button onClick={onClose}><X size={18} style={{color:C.muted}}/></button></div>
      <Field label="Block type">
        <div className="flex gap-2 mt-1">
          {["event","duty","floating"].map(k=><button key={k} onClick={()=>setF({...f,kind:k, eventId: k==="event"?f.eventId:null})} className="px-3 py-1.5 rounded-md text-xs font-semibold capitalize" style={{background:f.kind===k?BLOCK_KIND_COLOR[k]:C.chip,color:f.kind===k?"#fff":C.ink}}>{k==="floating"?"Floating":k}</button>)}
        </div>
      </Field>
      {f.kind==="event" && <div className="mt-3"><Field label="Link to schedule event">
        <select value={f.eventId||""} onChange={e=>linkEvent(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}>
          <option value="">— choose event —</option>
          {schedule.map(ev=><option key={ev.id} value={ev.id}>{fmtDate(ev.date)} · {ev.name}</option>)}
        </select></Field></div>}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label="Date"><input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field>
        <div/>
        <Field label="Start"><input type="time" value={f.start||""} onChange={e=>setF({...f,start:e.target.value})} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field>
        <Field label="End"><input type="time" value={f.end||""} onChange={e=>setF({...f,end:e.target.value})} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field>
      </div>
      <div className="mt-3"><Field label="Label / description"><input value={f.label} onChange={e=>setF({...f,label:e.target.value})} placeholder={f.kind==="floating"?"e.g. Floating — available for anything":"e.g. Registration desk support"} className="w-full px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field></div>
      <div className="mt-3"><Field label="Room(s) — multi-select"><MultiSelect values={f.rooms} onChange={v=>setF({...f,rooms:v})} options={ROOM_LIST} w="100%" placeholder="Select room(s)…"/></Field></div>
      <button onClick={()=>onSave(f)} className="w-full mt-4 py-2.5 rounded-md text-white font-semibold text-sm" style={{background:C.deep}}>{b?"Save changes":"Add block"}</button>
    </Card></div>
  </div>;
}

/* ============================== DIRECTORY ================================ */
function Directory({people,setPeople,vendors,setVendors,docs,setDocs,admin}){
  const [tab,setTab]=useState("people");
  const [q,setQ]=useState("");
  const patchPerson=(i,f,v)=> setPeople(people.map((p,idx)=>idx===i?{...p,[f]:v}:p));
  const addPerson=()=> setPeople([...people,{name:"New person",role:"",dept:"",contact:"",leadership:false,type:"Staff"}]);
  const delPerson=(i)=> setPeople(people.filter((_,idx)=>idx!==i));
  const patchVendor=(id,f,v)=> setVendors(vendors.map(x=>x.id===id?{...x,[f]:v}:x));
  const addVendor=()=> setVendors([...vendors,{id:uid("v"),name:"New contact",type:"Vendor",category:"",contact:"",phone:"",note:""}]);
  const delVendor=(id)=> setVendors(vendors.filter(x=>x.id!==id));
  const patchDoc=(id,f,v)=> setDocs(docs.map(x=>x.id===id?{...x,[f]:v}:x));
  const addDoc=()=> setDocs([...docs,{id:uid("d"),name:"New document",type:"link",category:"",updated:"",owner:"",url:""}]);
  const delDoc=(id)=> setDocs(docs.filter(x=>x.id!==id));

  const fPeople = people.filter(p=>q===""||p.name.toLowerCase().includes(q.toLowerCase())||p.role.toLowerCase().includes(q.toLowerCase()));
  const fVendors = vendors.filter(v=>q===""||v.name.toLowerCase().includes(q.toLowerCase())||v.category.toLowerCase().includes(q.toLowerCase()));
  const staffList = fPeople.filter(p=>p.type==="Staff"); const volList = fPeople.filter(p=>p.type==="Volunteer");

  return <div className="space-y-5">
    <SectionTitle sub="Staff, volunteer, vendor, and hotel contacts — everything you'd need to call someone, in one searchable place">Directory</SectionTitle>
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-md overflow-hidden" style={{border:`1px solid ${C.line}`}}>
        {["people","vendors","documents"].map(t=><button key={t} onClick={()=>setTab(t)} className="px-3 py-2 text-sm font-semibold capitalize" style={{background:tab===t?C.deep:"#fff",color:tab===t?"#fff":C.ink}}>{t}</button>)}
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-md flex-1 min-w-[180px]" style={{background:"#fff",border:`1px solid ${C.line}`}}><Search size={15} style={{color:C.muted}}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" className="outline-none text-sm flex-1"/></div>
      {admin && tab==="people" && <button onClick={addPerson} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-white text-sm font-semibold" style={{background:C.deep}}><Plus size={15}/>Add person</button>}
      {admin && tab==="vendors" && <button onClick={addVendor} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-white text-sm font-semibold" style={{background:C.deep}}><Plus size={15}/>Add contact</button>}
      {admin && tab==="documents" && <button onClick={addDoc} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-white text-sm font-semibold" style={{background:C.deep}}><Plus size={15}/>Add document</button>}
    </div>

    {tab==="people" && <>
      {staffList.length>0 && <div><h3 className="text-sm font-bold uppercase tracking-wide mb-2" style={{color:C.nile}}>HQ Staff</h3>
        <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))"}}>{staffList.map(p=><PersonCard key={p.name} p={p} idx={people.indexOf(p)} admin={admin} patch={patchPerson} del={delPerson}/>)}</div></div>}
      {volList.length>0 && <div><h3 className="text-sm font-bold uppercase tracking-wide mb-2 mt-2" style={{color:C.nile}}>Convention Volunteers</h3>
        <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))"}}>{volList.map(p=><PersonCard key={p.name} p={p} idx={people.indexOf(p)} admin={admin} patch={patchPerson} del={delPerson}/>)}</div></div>}
    </>}

    {tab==="vendors" && <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))"}}>
      {fVendors.map(v=><Card key={v.id}>
        {!admin ? <>
          <div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold text-sm" style={{fontFamily:"Fraunces,serif"}}>{v.name}</h3><div className="text-xs" style={{color:C.muted}}>{v.category}</div></div><Pill text={v.type} color={v.type==="Hotel"?C.gold:C.nile}/></div>
          <div className="flex items-center gap-1.5 mt-3 text-sm" style={{color:C.nile}}><Phone size={13}/>{v.contact} · {v.phone}</div>
          {v.note && <div className="text-xs mt-2 px-2.5 py-2 rounded-md" style={{background:C.paper,color:C.muted}}>{v.note}</div>}
        </> : <div className="space-y-2">
          <div className="flex items-center justify-between"><TxtCell value={v.name} onChange={val=>patchVendor(v.id,"name",val)} w={160}/><button onClick={()=>delVendor(v.id)} style={{color:C.muted}}><Trash2 size={14}/></button></div>
          <Select value={v.type} onChange={val=>patchVendor(v.id,"type",val)} options={["Vendor","Hotel"]} w={200}/>
          <TxtCell value={v.category} onChange={val=>patchVendor(v.id,"category",val)} placeholder="Category" w={200}/>
          <TxtCell value={v.contact} onChange={val=>patchVendor(v.id,"contact",val)} placeholder="Contact name" w={200}/>
          <TxtCell value={v.phone} onChange={val=>patchVendor(v.id,"phone",val)} placeholder="Phone" w={200}/>
          <textarea value={v.note} onChange={e=>patchVendor(v.id,"note",e.target.value)} placeholder="Note" rows={2} className="w-full text-sm px-2 py-1 rounded-md outline-none" style={{border:`1px solid ${C.line}`}}/>
        </div>}
      </Card>)}
    </div>}

    {tab==="documents" && <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))"}}>
      {docs.map(d=><Card key={d.id}>
        {!admin ? <div className="flex items-start gap-3"><div className="p-2 rounded-md" style={{background:C.chip}}>{d.type==="xlsx"?<FileSpreadsheet size={18} style={{color:C.pos}}/>:<FileText size={18} style={{color:C.neg}}/>}</div>
          <div className="flex-1"><div className="font-medium text-sm">{d.name}</div><div className="text-xs mt-1" style={{color:C.muted}}>{d.category} · updated {d.updated}</div><div className="text-xs mt-0.5" style={{color:C.muted}}>Owner: {d.owner}</div>
          {d.url ? <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold" style={{color:C.nile}}>Open <ExternalLink size={12}/></a> : <div className="text-xs mt-2" style={{color:C.muted}}>No link attached yet</div>}</div></div>
        : <div className="space-y-2">
          <div className="flex items-center justify-between"><TxtCell value={d.name} onChange={v=>patchDoc(d.id,"name",v)} w={170}/><button onClick={()=>delDoc(d.id)} style={{color:C.muted}}><Trash2 size={14}/></button></div>
          <Select value={d.type} onChange={v=>patchDoc(d.id,"type",v)} options={["xlsx","pdf","docx","link"]} w={200}/>
          <TxtCell value={d.category} onChange={v=>patchDoc(d.id,"category",v)} placeholder="Category" w={200}/>
          <TxtCell value={d.owner} onChange={v=>patchDoc(d.id,"owner",v)} placeholder="Owner" w={200}/>
          <TxtCell value={d.updated} onChange={v=>patchDoc(d.id,"updated",v)} placeholder="Updated (e.g. Jun 2026)" w={200}/>
          <input value={d.url} onChange={e=>patchDoc(d.id,"url",e.target.value)} placeholder="https://drive.google.com/..." className="w-full text-sm px-2 py-1 rounded-md outline-none" style={{border:`1px solid ${C.line}`}}/>
        </div>}
      </Card>)}
    </div>}
  </div>;
}
function PersonCard({p,idx,admin,patch,del}){
  return <Card>
    {!admin ? <>
      <div className="flex items-center gap-3"><Avatar name={p.name}/><div><div className="font-semibold text-sm">{p.name}</div><div className="text-xs" style={{color:C.muted}}>{p.role}{p.dept?" · "+p.dept:""}</div></div></div>
      {p.contact && <div className="flex items-center gap-1.5 mt-3 text-sm" style={{color:C.nile}}><Phone size={13}/>{p.contact}</div>}
    </> : <div className="space-y-2">
      <div className="flex items-center justify-between"><TxtCell value={p.name} onChange={v=>patch(idx,"name",v)} w={150}/><button onClick={()=>del(idx)} style={{color:C.muted}}><Trash2 size={14}/></button></div>
      <Select value={p.type} onChange={v=>patch(idx,"type",v)} options={["Staff","Volunteer"]} w={200}/>
      <TxtCell value={p.role} onChange={v=>patch(idx,"role",v)} placeholder="Role" w={200}/>
      <TxtCell value={p.dept} onChange={v=>patch(idx,"dept",v)} placeholder="Department" w={200}/>
      <TxtCell value={p.contact} onChange={v=>patch(idx,"contact",v)} placeholder="Phone" w={200}/>
    </div>}
  </Card>;
}

/* ============================== HOTEL MAP ================================ */
function HotelMap({map,setMap,admin}){
  const fileRef=useRef();
  const [uploading,setUploading]=useState(false);
  const onFile=async(file)=>{ setUploading(true); const url = await uploadMapImage(file); setUploading(false); if(url) setMap({...map, imageUrl:url}); else alert("Upload failed — check your connection and try again."); };
  return <div className="space-y-5">
    <SectionTitle sub="Floor plan / property map for finding rooms fast">Hotel Map</SectionTitle>
    <Card>
      {map.imageUrl ? <img src={map.imageUrl} alt="Hotel map" className="w-full rounded-lg" style={{border:`1px solid ${C.line}`}}/> :
        <div className="flex flex-col items-center justify-center py-16 text-center" style={{color:C.muted}}>
          <MapIcon size={36} style={{color:C.muted}}/>
          <p className="text-sm mt-3 max-w-xs">No map uploaded yet.</p>
        </div>}
      {admin && <div className="mt-4 flex items-center gap-3">
        <button onClick={()=>fileRef.current.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-white text-sm font-semibold" style={{background:C.deep}}><Upload size={15}/>{map.imageUrl?"Replace map image":"Upload map image"}</button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>{ if(e.target.files[0]) onFile(e.target.files[0]); }}/>
        {map.imageUrl && <button onClick={()=>setMap({...map,imageUrl:""})} className="text-xs font-semibold" style={{color:C.neg}}>Remove</button>}
      </div>}
      {admin && <textarea value={map.note} onChange={e=>setMap({...map,note:e.target.value})} placeholder="Notes about the map" rows={2} className="w-full mt-3 text-sm px-3 py-2 rounded-md outline-none" style={{border:`1px solid ${C.line}`}}/>}
      {!admin && map.note && <p className="text-sm mt-3" style={{color:C.muted}}>{map.note}</p>}
    </Card>
  </div>;
}

/* ============================== FAQ ================================== */
function Faq({faq,setFaq,admin}){
  const [q,setQ]=useState(""); const [adding,setAdding]=useState(false);
  const filtered = faq.filter(f=>q===""||f.q.toLowerCase().includes(q.toLowerCase())||f.a.toLowerCase().includes(q.toLowerCase()));
  const patch=(id,field,v)=> setFaq(faq.map(f=>f.id===id?{...f,[field]:v}:f));
  const del=(id)=> setFaq(faq.filter(f=>f.id!==id));
  const add=(item)=>{ setFaq([...faq,{id:uid("f"),...item}]); setAdding(false); };
  return <div className="space-y-5">
    <SectionTitle sub="Scenario-based answers staff can search fast, on their phone" right={admin && <button onClick={()=>setAdding(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-white text-sm font-semibold" style={{background:C.deep}}><Plus size={15}/>Add FAQ</button>}>What do I do if…</SectionTitle>
    <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{background:"#fff",border:`1px solid ${C.line}`,maxWidth:360}}><Search size={15} style={{color:C.muted}}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search a scenario…" className="outline-none text-sm flex-1"/></div>
    <div className="space-y-2">{filtered.map(f=><Card key={f.id}>
      {!admin ? <><div className="font-semibold text-sm flex items-center gap-2"><HelpCircle size={15} style={{color:C.gold}}/>{f.q}</div><div className="text-sm mt-2" style={{color:C.muted}}>{f.a}</div></>
      : <div className="space-y-2">
          <div className="flex items-center gap-2"><TxtCell value={f.q} onChange={v=>patch(f.id,"q",v)} w={420}/><button onClick={()=>del(f.id)} style={{color:C.muted}}><Trash2 size={14}/></button></div>
          <textarea value={f.a} onChange={e=>patch(f.id,"a",e.target.value)} rows={2} className="w-full text-sm px-3 py-2 rounded-md outline-none" style={{border:`1px solid ${C.line}`}}/>
        </div>}
    </Card>)}</div>
    {adding && <FaqModal onClose={()=>setAdding(false)} onSave={add}/>}
  </div>;
}
function FaqModal({onClose,onSave}){
  const [q,setQ]=useState(""); const [a,setA]=useState("");
  return <div className="fixed inset-0 flex items-center justify-center px-4" style={{background:"#00000066",zIndex:50}}>
    <Card style={{maxWidth:440,width:"100%"}}>
      <div className="flex items-center justify-between mb-3"><h3 className="font-semibold" style={{fontFamily:"Fraunces,serif"}}>Add FAQ item</h3><button onClick={onClose}><X size={18} style={{color:C.muted}}/></button></div>
      <Field label="Scenario / question"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. A guest needs a wheelchair" className="w-full mb-3 px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field>
      <Field label="Answer"><textarea value={a} onChange={e=>setA(e.target.value)} rows={3} className="w-full mb-3 px-3 py-2 rounded-md text-sm outline-none" style={{border:`1px solid ${C.line}`}}/></Field>
      <button onClick={()=>onSave({q,a})} className="w-full py-2.5 rounded-md text-white font-semibold text-sm" style={{background:C.deep}}>Add</button>
    </Card>
  </div>;
}

/* ============================== BUDGET (full Budget Hub, rolled in) ============================== */
function BudgetSection({expenses,setExpenses,income,setIncome,settings,setSettings,sponsors,setSponsors,audit,tracker,setTracker,editor,headcount}){
  const [sub,setSub]=useState("overview");
  const SUBS=[{id:"overview",label:"Overview"},{id:"budget",label:"Budget"},{id:"tracker",label:"Expense Tracker"},{id:"income",label:"Income"},{id:"foundation",label:"Foundation"},{id:"activity",label:"Activity"}];
  return <div className="space-y-5">
    <div className="flex items-center rounded-md overflow-hidden w-fit" style={{border:`1px solid ${C.line}`}}>
      {SUBS.map(s=><button key={s.id} onClick={()=>setSub(s.id)} className="px-4 py-2 text-sm font-semibold" style={{background:sub===s.id?C.deep:"#fff",color:sub===s.id?"#fff":C.ink}}>{s.label}</button>)}
    </div>
    {sub==="overview" && <BudgetOverview expenses={expenses} income={income} tracker={tracker} settings={settings} sponsors={sponsors} headcount={headcount} go={setSub}/>}
    {sub==="budget" && <Budget expenses={expenses} setExpenses={setExpenses} settings={settings} setSettings={setSettings} editor={editor} tracker={tracker}/>}
    {sub==="tracker" && <Tracker tracker={tracker} setTracker={setTracker} expenses={expenses}/>}
    {sub==="income" && <Income income={income} setIncome={setIncome} sponsors={sponsors} setSponsors={setSponsors} headcount={headcount}/>}
    {sub==="foundation" && <Foundation expenses={expenses} income={income} settings={settings} tracker={tracker}/>}
    {sub==="activity" && <Activity audit={audit} expenses={expenses} setExpenses={setExpenses} editor={editor}/>}
  </div>;
}

/* ============================== BUDGET OVERVIEW (dashboard) ============================== */
function BudgetOverview({expenses,income,tracker,settings,sponsors,headcount,go}){
  const inc=useMemo(()=>computeIncome(income,sponsors),[income,sponsors]);
  const totalEst=useMemo(()=>expenses.reduce((a,r)=>a+effEstimated(r,settings),0),[expenses,settings]);
  const actualSpend=useMemo(()=>(tracker||[]).reduce((a,t)=>a+(t.cost||0),0),[tracker]);
  const byCat=useMemo(()=>{ const g={}; expenses.forEach(r=>{ g[r.category]=(g[r.category]||0)+effEstimated(r,settings); });
    return Object.entries(g).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value); },[expenses,settings]);
  const grantable=useMemo(()=>expenses.reduce((a,r)=>a+grantDollars(r,settings),0),[expenses,settings]);
  const net=inc.grand-totalEst;
  const actualNet=inc.actualIncome-actualSpend;
  const grantTargetPct=Math.round((settings.grantTarget||0)*100);
  const grantOfBudget=totalEst>0?grantable/totalEst:0;
  const incExp=[{name:"Income",Income:inc.grand,Expense:0},{name:"Expense",Income:0,Expense:totalEst}];

  return <div className="space-y-5">
    <SectionTitle sub="Budget vs. income at a glance — projected position now, and how actuals are tracking as real transactions get logged.">Budget Overview</SectionTitle>

    <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))"}}>
      <Kpi label="Projected income" value={usd(inc.grand)} tone={C.pos}/>
      <Kpi label="Projected expense" value={usd(totalEst)} tone={C.neg}/>
      <Kpi label="Net position" value={usd(net)} sub={net>=0?"Surplus":"Shortfall"} tone={net>=0?C.pos:C.neg} accent/>
      <Kpi label="Grantable spend" value={usd(grantable)} sub={`${pct(grantOfBudget)} of budget · target ${grantTargetPct}%`} tone={C.gold}/>
    </div>

    <div className="grid gap-4" style={{gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))"}}>
      <Card>
        <h3 className="text-sm font-bold mb-1" style={{fontFamily:"Fraunces,serif"}}>Income vs. expense</h3>
        <p className="text-xs mb-3" style={{color:C.muted}}>Projected totals. The gap is your net {net>=0?"surplus":"shortfall"} of <b style={{color:net>=0?C.pos:C.neg}}>{usd(Math.abs(net))}</b>.</p>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={incExp} margin={{top:6,right:8,left:8,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.line}/>
            <XAxis dataKey="name" tick={{fontSize:12,fill:C.muted}}/>
            <YAxis tickFormatter={v=>"$"+(v/1000)+"k"} tick={{fontSize:11,fill:C.muted}} width={48}/>
            <Tooltip formatter={v=>usd(v)}/>
            <Bar dataKey="Income" stackId="a" fill={C.pos} radius={[4,4,0,0]}/>
            <Bar dataKey="Expense" stackId="a" fill={C.neg} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <h3 className="text-sm font-bold mb-1" style={{fontFamily:"Fraunces,serif"}}>Expense by category</h3>
        <p className="text-xs mb-3" style={{color:C.muted}}>Where the projected budget concentrates.</p>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={byCat} layout="vertical" margin={{top:0,right:12,left:8,bottom:0}}>
            <XAxis type="number" tickFormatter={v=>"$"+(v/1000)+"k"} tick={{fontSize:10,fill:C.muted}}/>
            <YAxis type="category" dataKey="name" width={2} tick={false}/>
            <Tooltip formatter={v=>usd(v)}/>
            <Bar dataKey="value" radius={[0,4,4,0]}>{byCat.map((e,i)=><Cell key={i} fill={catColor(e.name)}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>

    <Card pad={false}>
      <Bar2 title="Actuals — tracking against projections" right={`${usd(actualSpend)} logged`} action={<button onClick={()=>go&&go("tracker")} className="text-xs flex items-center gap-1 font-semibold" style={{color:C.gold}}>Open tracker<ExternalLink size={12}/></button>}/>
      <div className="grid gap-px p-px" style={{gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",background:C.line}}>
        <OvCell label="Income to date" value={usd(inc.actualIncome)} sub={`of ${usd(inc.grand)} projected`} bar={inc.grand>0?inc.actualIncome/inc.grand:0} tone={C.pos}/>
        <OvCell label="Spend to date" value={usd(actualSpend)} sub={`of ${usd(totalEst)} budgeted`} bar={totalEst>0?actualSpend/totalEst:0} tone={C.neg}/>
        <OvCell label="Net to date" value={usd(actualNet)} sub={actualNet>=0?"Surplus so far":"Shortfall so far"} tone={actualNet>=0?C.pos:C.neg}/>
        <OvCell label="Registered" value={headcount.actual} sub={`of ${headcount.total} expected`} bar={headcount.total>0?headcount.actual/headcount.total:0} tone={C.nile}/>
      </div>
      <div className="px-4 py-2.5 text-[11px]" style={{color:C.muted}}>Spend to date rolls up from Expense Tracker entries tagged to a budget line. Tag each logged transaction to its line so per-line actuals stay accurate.</div>
    </Card>
  </div>;
}
function OvCell({label,value,sub,bar,tone}){ return <div className="px-4 py-3" style={{background:C.card}}>
  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{color:C.muted}}>{label}</div>
  <div style={{fontFamily:"Fraunces,serif",fontWeight:700,color:tone}} className="text-2xl leading-tight mt-0.5">{value}</div>
  {sub&&<div className="text-[11px] mt-0.5" style={{color:C.muted}}>{sub}</div>}
  {bar!==undefined&&<div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{background:C.chip}}><div style={{width:`${Math.min(100,Math.max(0,bar*100))}%`,height:"100%",background:tone}}/></div>}
</div>; }

function Budget({expenses,setExpenses,settings,setSettings,editor,tracker}){
  const [q,setQ]=useState(""); const [catFilter,setCatFilter]=useState("All categories"); const [apprFilter,setApprFilter]=useState("All");
  const cats=useMemo(()=>["All categories",...Array.from(new Set(expenses.map(e=>e.category)))],[expenses]);
  const hc=settings._hc;
  const actualByLine=useMemo(()=>{ const m={}; (tracker||[]).forEach(t=>{ if(t.budgetLineId){ m[t.budgetLineId]=(m[t.budgetLineId]||0)+(t.cost||0); } }); return m; },[tracker]);
  const lineActual=(r)=>actualByLine[r.id]||0;
  const patch=(id,field,val)=> setExpenses(expenses.map(r=>r.id===id?{...r,[field]:val}:r));
  const setApproval=(r,val)=> setExpenses(expenses.map(x=>x.id===r.id?{...x,approval:val,approver:(val==="Approved"||val==="Rejected")?(editor||"Team member"):x.approver}:x), `${val} budget line “${r.item}”`);
  const addRow=(cat)=>{ const c=cat==="All categories"?(cats[1]||"New"):cat; setExpenses([...expenses,{id:uid("e"),category:c,item:"New line item",attendeeType:"All",entity:"Fraternity",description:"",quantity:0,unitCost:0,estimated:0,actual:0,grantable:false,grantPct:0,approval:"Draft",approver:"",scales:false}], `Added budget line in ${c}`); };
  const dupRow=(r)=> setExpenses([...expenses, {...r, id:uid("e"), item:r.item+" (copy)", approval:"Draft", approver:""}], `Duplicated line “${r.item}”`);
  const delRow=(r)=> setExpenses(expenses.filter(x=>x.id!==r.id), `Deleted budget line “${r.item}”`);

  const filtered=expenses.filter(r=>(catFilter==="All categories"||r.category===catFilter)&&(apprFilter==="All"||r.approval===apprFilter)&&(q===""||(r.item+r.description+r.attendeeType+r.entity).toLowerCase().includes(q.toLowerCase())));
  const groups=useMemo(()=>{ const g={}; filtered.forEach(r=>{(g[r.category]=g[r.category]||[]).push(r);}); return g; },[filtered]);
  const totalEst=filtered.reduce((a,r)=>a+effEstimated(r,settings),0);
  const totalStudent=filtered.reduce((a,r)=>a+studentShare(r,settings),0);
  const totalGrant=filtered.reduce((a,r)=>a+grantDollars(r,settings),0);

  return <div className="space-y-5">
    <SectionTitle sub="Estimates are editable — type a flat amount, or set qty × unit and turn on “scales” to track attendee count from Income. Actuals are read-only here; they roll up from Expense Tracker entries tagged to each line.">Budget — Master Expenses</SectionTitle>
    <Card>
      <div className="flex flex-wrap items-end gap-6">
        <ReadField label="Total attendees" value={hc.total} sub="from Income"/>
        <ReadField label="Undergrad members" value={hc.students} sub="from Income"/>
        <Field label="Grant target %"><NumCell value={Math.round(settings.grantTarget*100)} onChange={v=>setSettings({...realSettings(settings),grantTarget:(v||0)/100})} w={64}/></Field>
        <Field label="Variance flag %"><NumCell value={Math.round(settings.varianceThreshold*100)} onChange={v=>setSettings({...realSettings(settings),varianceThreshold:(v||0)/100})} w={64}/></Field>
        <Field label="Grant pool"><NumCell value={settings.grantPool} onChange={v=>setSettings({...realSettings(settings),grantPool:v})} prefix="$" w={110}/></Field>
        <div className="ml-auto text-right"><div className="text-xs" style={{color:C.muted}}>Filtered estimate</div>
          <div style={{fontFamily:"Fraunces,serif",fontWeight:700,color:C.deep}} className="text-2xl">{usd(totalEst)}</div>
          <div className="text-xs" style={{color:C.gold}}>{usd(totalStudent)} students · {usd(totalGrant)} grantable</div></div>
      </div>
    </Card>
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{background:"#fff",border:`1px solid ${C.line}`}}><Search size={15} style={{color:C.muted}}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search line items…" className="outline-none text-sm" style={{width:190}}/></div>
      <Select value={catFilter} onChange={setCatFilter} options={cats} w={220}/>
      <Select value={apprFilter} onChange={setApprFilter} options={["All",...APPROVAL]} w={130}/>
      <button onClick={()=>addRow(catFilter)} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-white text-sm font-semibold" style={{background:C.deep}}><Plus size={15}/>Add line</button>
    </div>
    {Object.entries(groups).map(([cat,rows])=>{
      const sub=rows.reduce((a,r)=>a+effEstimated(r,settings),0); const act=rows.reduce((a,r)=>a+lineActual(r),0); const used=sub>0?act/sub:0; const over=act>sub;
      return <Card key={cat} pad={false}>
        <div className="flex items-center justify-between px-4 py-3" style={{background:C.deep,borderRadius:"14px 14px 0 0"}}>
          <h3 className="text-white font-semibold text-sm">{cat}</h3>
          <div className="flex items-center gap-3">{act>0 && <span className="text-[11px] font-semibold" style={{color:over?"#f0a58c":(used>=settings.varianceThreshold?C.gold:"#9fc3b8")}}>{pct(used)} used</span>}<span style={{color:C.gold}} className="font-semibold text-sm">{usd(sub)}</span></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-sm" style={{borderCollapse:"collapse"}}>
          <thead><tr style={{color:C.muted}} className="text-[11px] uppercase tracking-wide">{["Line item","Serves","Pays","Qty","Unit","Estimate","Actual ⤵ tracker","Remaining","Grant","Approval","To students",""].map((h,i)=><th key={i} className="text-left font-semibold px-3 py-2" style={{borderBottom:`1px solid ${C.line}`}}>{h}</th>)}</tr></thead>
          <tbody>{rows.map(r=>{ const eff=effEstimated(r,settings); const act=lineActual(r); const rem=eff-act; const ss=studentShare(r,settings); const lineOver=act>eff; const scaledQty=effQty(r,settings);
            return <tr key={r.id} style={{borderBottom:`1px solid ${C.line}`,background:lineOver?"#fdf3ef":"transparent"}}>
              <td className="px-3 py-2"><TxtCell value={r.item} onChange={v=>patch(r.id,"item",v)} w={180}/>
                <div className="flex items-center gap-2 mt-1"><input value={r.description||""} placeholder="note" onChange={e=>patch(r.id,"description",e.target.value)} className="text-xs outline-none px-2 py-0.5 rounded" style={{color:C.muted,border:`1px solid ${C.line}`,width:118,background:"#fafafa"}}/>
                  <label className="flex items-center gap-1 text-[10px] cursor-pointer" style={{color:r.scales?C.nile:C.muted}} title="Scales with attendee count from Income"><input type="checkbox" checked={!!r.scales} onChange={e=>patch(r.id,"scales",e.target.checked)} style={{accentColor:C.nile}}/>scales</label></div></td>
              <td className="px-3 py-2"><Select value={r.attendeeType} onChange={v=>patch(r.id,"attendeeType",v)} options={ATTENDEE_TYPES} w={98}/></td>
              <td className="px-3 py-2"><Select value={r.entity} onChange={v=>patch(r.id,"entity",v)} options={ENTITIES} w={108} color={ENTITY_COLORS[r.entity]}/></td>
              <td className="px-3 py-2">{r.scales ? <span title="Tracks attendee count from Income" className="inline-flex items-center gap-1 text-sm font-medium" style={{color:C.nile}}><Users size={12}/>{scaledQty}</span> : <NumCell value={r.quantity} onChange={v=>patch(r.id,"quantity",v)} w={60}/>}</td>
              <td className="px-3 py-2"><NumCell value={r.unitCost} onChange={v=>patch(r.id,"unitCost",v)} prefix="$" w={74} step="0.01"/></td>
              <td className="px-3 py-2">{(r.scales&&r.unitCost>0) ? <span className="font-semibold" style={{color:C.nile}}>{usd(eff)}</span> : ((r.quantity>0&&r.unitCost>0)?<span className="font-semibold">{usd(rowEstimated(r))}</span>:<NumCell value={r.estimated} onChange={v=>patch(r.id,"estimated",v)} prefix="$" w={88}/>)}</td>
              <td className="px-3 py-2" title="Read-only — rolls up from Expense Tracker entries tagged to this line">{act>0 ? <span className="font-semibold" style={{color:lineOver?C.neg:C.ink}}>{usd(act)}</span> : <span style={{color:C.muted}}>—</span>}</td>
              <td className="px-3 py-2 font-semibold" style={{color:rem<0?C.neg:C.ink}}>{usd(rem)}</td>
              <td className="px-3 py-2"><div className="flex items-center gap-1"><input type="checkbox" checked={!!r.grantable} onChange={e=>patch(r.id,"grantable",e.target.checked)} style={{accentColor:C.gold}}/>{r.grantable&&<NumCell value={r.grantPct} onChange={v=>patch(r.id,"grantPct",v)} w={48}/>}</div>{r.grantable&&<div className="text-[10px]" style={{color:C.gold}}>{usd(grantDollars(r,settings))}</div>}</td>
              <td className="px-3 py-2"><Select value={r.approval} onChange={v=>setApproval(r,v)} options={APPROVAL} w={108} color={APPROVAL_COLOR[r.approval]}/>{r.approver&&<div className="text-[10px]" style={{color:C.muted}}>by {r.approver}</div>}</td>
              <td className="px-3 py-2" style={{color:C.gold}}>{ss>0?usd(ss):"—"}</td>
              <td className="px-2 py-2"><div className="flex items-center gap-1"><button onClick={()=>dupRow(r)} title="Duplicate" style={{color:C.muted}}><Copy size={14}/></button><button onClick={()=>delRow(r)} title="Delete" style={{color:C.muted}}><Trash2 size={15}/></button></div></td>
            </tr>; })}</tbody>
        </table></div>
      </Card>; })}
  </div>;
}
/* strip derived fields before saving settings */
function realSettings(s){ const {totalAttendees,studentCount,_hc,...rest}=s; return rest; }

/* ============================== TRACKER ================================= */
const TRK_COLS=[["date","Date","date",120],["vendor","Vendor / Payee","txt",150],["cost","Total Cost","num",100],["desc","Description","txt",180],["category","Category","txt",150],["subcategory","Subcategory","txt",130],["dept","Dept","txt",90],["project","Project","txt",110],["account","QuickBooks Account Line","txt",170],["method","Payment Method","sel",140],["pstatus","Payment Status","sel",140],["requestedBy","Requested By","txt",120],["approvedBy","Approved By","txt",120],["approvalDate","Approval Date","date",120],["contractReq","Contract Req?","chk",90],["contractSigned","Signed?","chk",80],["grantable","Grantable?","chk",90],["grantPct","Grant %","num",80]];
function Tracker({tracker,setTracker,expenses}){
  const [q,setQ]=useState(""); const [statusF,setStatusF]=useState("All");
  const blank=()=>({id:uid("t"),date:"",vendor:"",cost:0,desc:"",category:"",subcategory:"",dept:"DSP",project:"Miami 2027 Convention",account:"",method:"—",pstatus:"Not started",requestedBy:"",approvedBy:"",approvalDate:"",contractReq:false,contractSigned:false,grantable:false,grantPct:0,budgetLineId:""});
  const add=()=> setTracker([blank(),...tracker], "Added expense-tracker entry");
  const patch=(id,f,v)=> setTracker(tracker.map(r=>r.id===id?{...r,[f]:v}:r));
  const del=(r)=> setTracker(tracker.filter(x=>x.id!==r.id), `Deleted tracker entry ${r.vendor||""}`);
  const expList=expenses||[];
  const lineLabel=(id)=>{ const e=expList.find(x=>x.id===id); return e?`${e.item}`:""; };
  const byCat=useMemo(()=>{ const g={}; expList.forEach(e=>{(g[e.category]=g[e.category]||[]).push(e);}); return g; },[expList]);
  const filtered=tracker.filter(r=>(statusF==="All"||r.pstatus===statusF)&&(q===""||(r.vendor+r.desc+r.category+r.account+lineLabel(r.budgetLineId)).toLowerCase().includes(q.toLowerCase())));
  const spent=filtered.reduce((a,r)=>a+(r.cost||0),0); const grantAmt=filtered.reduce((a,r)=>a+(r.grantable?(r.cost||0)*(r.grantPct||0)/100:0),0);
  const untagged=tracker.filter(r=>!r.budgetLineId).length;
  const exportCSV=()=>{ const head=["Date","Vendor","Total Cost","Description","Category","Subcategory","Dept","Project","QB Account Line","Payment Method","Payment Status","Requested By","Approved By","Approval Date","Contract Req","Contract Signed","Grantable","Grant %","Grant Amount","Budget Line"];
    const lines=[head.join(",")].concat(tracker.map(r=>[r.date,r.vendor,r.cost,r.desc,r.category,r.subcategory,r.dept,r.project,r.account,r.method,r.pstatus,r.requestedBy,r.approvedBy,r.approvalDate,r.contractReq?"Yes":"No",r.contractSigned?"Yes":"No",r.grantable?"Yes":"No",r.grantPct,(r.grantable?(r.cost*r.grantPct/100):0).toFixed(2),lineLabel(r.budgetLineId)].map(x=>`"${String(x??"").replace(/"/g,'""')}"`).join(",")));
    downloadFile(lines.join("\n"),"convention_expense_tracker.csv","text/csv"); };
  return <div className="space-y-5">
    <SectionTitle sub="Log every committed cost, then tag it to a budget line so it rolls up into that line's Actual on the Budget tab. Grant amount auto-calculates from grantable % × cost.">Expense Tracker</SectionTitle>
    <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))"}}>
      <Kpi label="Logged spend" value={usd(spent)} tone={C.deep}/><Kpi label="Entries" value={filtered.length} tone={C.nile}/><Kpi label="Grant-eligible $" value={usd(grantAmt)} tone={C.gold}/><Kpi label="Untagged to a line" value={untagged} sub={untagged?"won't roll into Budget":"all tagged"} tone={untagged?C.warn:C.pos}/>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{background:"#fff",border:`1px solid ${C.line}`}}><Search size={15} style={{color:C.muted}}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search vendor, item, account…" className="outline-none text-sm" style={{width:220}}/></div>
      <Select value={statusF} onChange={setStatusF} options={["All",...PAY_STATUS]} w={150}/>
      <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-white text-sm font-semibold" style={{background:C.deep}}><Plus size={15}/>Add expense</button>
      <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold" style={{background:C.chip,color:C.deep}}><Download size={15}/>Export CSV</button>
    </div>
    <Card pad={false} style={{overflow:"hidden"}}>
      <div className="overflow-x-auto"><table className="text-sm" style={{borderCollapse:"collapse",minWidth:2120}}>
        <thead><tr style={{background:C.deep,color:"#cfe0da"}} className="text-[11px] uppercase tracking-wide">{TRK_COLS.map(c=><th key={c[0]} className="text-left font-semibold px-3 py-2 whitespace-nowrap">{c[1]}</th>)}<th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Budget Line ⤴</th><th className="px-3 py-2 text-left font-semibold whitespace-nowrap">Grant $</th><th></th></tr></thead>
        <tbody>
          {filtered.length===0 && <tr><td colSpan={TRK_COLS.length+3} className="px-4 py-10 text-center" style={{color:C.muted}}>No expenses logged yet. Add your first committed cost to start tracking.</td></tr>}
          {filtered.map(r=><tr key={r.id} style={{borderBottom:`1px solid ${C.line}`}}>
            {TRK_COLS.map(c=><td key={c[0]} className="px-3 py-2 whitespace-nowrap">
              {c[2]==="txt"&&<TxtCell value={r[c[0]]} onChange={v=>patch(r.id,c[0],v)} w={c[3]}/>}
              {c[2]==="num"&&<NumCell value={r[c[0]]} onChange={v=>patch(r.id,c[0],v)} prefix={c[0]==="cost"?"$":""} w={c[3]} step="0.01"/>}
              {c[2]==="date"&&<input type="date" value={r[c[0]]||""} onChange={e=>patch(r.id,c[0],e.target.value)} className="px-2 py-1 text-sm rounded-md outline-none" style={{border:`1px solid ${C.line}`,width:c[3]}}/>}
              {c[2]==="sel"&&<Select value={r[c[0]]} onChange={v=>patch(r.id,c[0],v)} options={c[0]==="method"?PAY_METHOD:PAY_STATUS} w={c[3]}/>}
              {c[2]==="chk"&&<input type="checkbox" checked={!!r[c[0]]} onChange={e=>patch(r.id,c[0],e.target.checked)} style={{width:16,height:16,accentColor:C.deep}}/>}
            </td>)}
            <td className="px-3 py-2 whitespace-nowrap">
              <select value={r.budgetLineId||""} onChange={e=>patch(r.id,"budgetLineId",e.target.value)} className="px-2 py-1 text-sm outline-none rounded-md font-medium" style={{border:`1px solid ${r.budgetLineId?C.line:C.warn}`,background:"#fff",width:210,color:r.budgetLineId?C.ink:C.warn}}>
                <option value="">— tag to a budget line —</option>
                {Object.entries(byCat).map(([cat,rows])=><optgroup key={cat} label={cat}>{rows.map(e=><option key={e.id} value={e.id}>{e.item}</option>)}</optgroup>)}
              </select>
            </td>
            <td className="px-3 py-2 font-semibold whitespace-nowrap" style={{color:C.gold}}>{r.grantable?usd((r.cost||0)*(r.grantPct||0)/100):"—"}</td>
            <td className="px-2 py-2"><button onClick={()=>del(r)} style={{color:C.muted}}><Trash2 size={15}/></button></td>
          </tr>)}
        </tbody>
      </table></div>
    </Card>
  </div>;
}

/* ============================== INCOME + SPONSORS ====================== */
function Income({income,setIncome,sponsors,setSponsors,headcount}){
  const set=(section,arr,note)=> setIncome({...income,[section]:arr}, note);
  const patch=(section,id,f,v)=> set(section,income[section].map(r=>r.id===id?{...r,[f]:v}:r));
  const del=(section,id)=> set(section,income[section].filter(r=>r.id!==id),"Removed an income line");
  const groups=["Undergraduate","Alumni","Guests"]; const regBy=g=>income.registration.filter(r=>r.group===g);
  const regTotal=income.registration.reduce((a,r)=>a+r.qty*r.price,0);
  const addonRev=income.addons.reduce((a,r)=>a+r.attendees*r.price,0); const addonSurplus=income.addons.reduce((a,r)=>a+r.attendees*(r.price-r.cost),0);
  const itemRev=income.items.reduce((a,r)=>a+r.qty*r.price,0); const itemSurplus=income.items.reduce((a,r)=>a+r.qty*(r.price-r.cost),0);
  const otherBud=income.other.reduce((a,r)=>a+(r.budgeted||0),0);
  const sponCommitted=sponsors.filter(s=>["Committed","Invoiced","Paid"].includes(s.stage)).reduce((a,s)=>a+(s.amount||0),0);
  const sponPaid=sponsors.filter(s=>s.stage==="Paid").reduce((a,s)=>a+(s.amount||0),0); const sponPipeline=sponsors.reduce((a,s)=>a+(s.amount||0),0);
  const grand=regTotal+addonRev+itemRev+otherBud+sponCommitted; const hc=headcount;
  const sPatch=(id,f,v)=> setSponsors(sponsors.map(s=>s.id===id?{...s,[f]:v}:s));
  const sStage=(s,v)=> setSponsors(sponsors.map(x=>x.id===s.id?{...x,stage:v}:x), `Sponsor “${s.name}” → ${v}`);
  const sAdd=()=> setSponsors([...sponsors,{id:uid("s"),name:"New sponsor",tier:"Bronze",amount:0,stage:"Prospect",contact:"",note:""}], "Added sponsor to pipeline");
  const sDel=(s)=> setSponsors(sponsors.filter(x=>x.id!==s.id), `Removed sponsor “${s.name}”`);

  return <div className="space-y-6">
    <SectionTitle sub="This tab drives everything. Registration quantities below set your total headcount — which every per-head expense and the student-attribution math reads from.">Income</SectionTitle>

    <div className="flex flex-wrap items-center gap-5 px-5 py-4 rounded-xl" style={{background:C.deep,color:"#fff"}}>
      <div className="flex items-center gap-2"><Users size={20} style={{color:C.gold}}/><div><div style={{fontFamily:"Fraunces,serif",fontWeight:700}} className="text-2xl leading-none">{hc.total}</div><div className="text-[11px]" style={{color:"#9fc3b8"}}>total attendees expected</div></div></div>
      <div className="h-9 w-px" style={{background:"#1b4a42"}}/>
      <HcChip label="Undergrad" v={hc.undergrad} a={hc.actualUndergrad}/><HcChip label="Alumni" v={hc.alumni} a={hc.actualAlumni}/><HcChip label="Guests" v={hc.guest} a={hc.actualGuest}/><HcChip label="Discounted" v={hc.disc}/>
      <div className="ml-auto text-right"><div className="text-[11px]" style={{color:"#9fc3b8"}}>Registered so far</div><div style={{fontFamily:"Fraunces,serif",fontWeight:700,color:C.gold}} className="text-xl">{hc.actual}</div></div>
    </div>

    <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))"}}>
      <Kpi label="Projected income" value={usd(grand)} tone={C.pos} accent/><Kpi label="Registration" value={usd(regTotal)} tone={C.deep}/><Kpi label="Sponsorship committed" value={usd(sponCommitted)} sub={usd(sponPaid)+" paid"} tone={C.gold}/><Kpi label="Add-ons + items surplus" value={usd(addonSurplus+itemSurplus)} tone={C.nile}/>
    </div>

    <Card pad={false}>
      <Bar2 title="Registration pricing — sets your headcount" right={usd(regTotal)} action={<button onClick={()=>set("registration",[...income.registration,{id:uid("r"),group:"Alumni",tier:"New tier",qty:0,price:0,actualQty:0,actualTotal:0,window:""}])} className="text-xs flex items-center gap-1 font-semibold" style={{color:C.gold}}><Plus size={13}/>Add tier</button>}/>
      {groups.map(g=> regBy(g).length>0 && <div key={g}>
        <div className="px-4 pt-3 pb-1 text-xs font-bold uppercase tracking-wide" style={{color:C.nile}}>{g} · {regBy(g).reduce((a,r)=>a+(r.qty||0),0)} expected</div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{color:C.muted}} className="text-[11px] uppercase">{["Tier","Window","Proj. qty","Price","Projected","Actual qty","Actual $",""].map((h,i)=><th key={i} className="text-left font-semibold px-3 py-1.5" style={{borderBottom:`1px solid ${C.line}`}}>{h}</th>)}</tr></thead>
          <tbody>{regBy(g).map(r=><tr key={r.id} style={{borderBottom:`1px solid ${C.line}`}}>
            <td className="px-3 py-2"><TxtCell value={r.tier} onChange={v=>patch("registration",r.id,"tier",v)} w={170}/></td>
            <td className="px-3 py-2"><TxtCell value={r.window} onChange={v=>patch("registration",r.id,"window",v)} w={150}/></td>
            <td className="px-3 py-2"><NumCell value={r.qty} onChange={v=>patch("registration",r.id,"qty",v)} w={62}/></td>
            <td className="px-3 py-2"><NumCell value={r.price} onChange={v=>patch("registration",r.id,"price",v)} prefix="$" w={82}/></td>
            <td className="px-3 py-2 font-semibold">{usd(r.qty*r.price)}</td>
            <td className="px-3 py-2"><NumCell value={r.actualQty} onChange={v=>patch("registration",r.id,"actualQty",v)} w={62}/></td>
            <td className="px-3 py-2"><NumCell value={r.actualTotal} onChange={v=>patch("registration",r.id,"actualTotal",v)} prefix="$" w={90}/></td>
            <td className="px-2 py-2"><button onClick={()=>del("registration",r.id)} style={{color:C.muted}}><Trash2 size={14}/></button></td>
          </tr>)}</tbody></table></div></div>)}
    </Card>

    <Card pad={false}>
      <Bar2 title="Sponsorship pipeline" right={`${usd(sponCommitted)} committed · ${usd(sponPipeline)} pipeline`} action={<button onClick={sAdd} className="text-xs flex items-center gap-1 font-semibold" style={{color:C.gold}}><Plus size={13}/>Add sponsor</button>}/>
      <div className="flex gap-2 px-4 pt-3 flex-wrap">{SPONSOR_STAGES.map(st=>{ const tot=sponsors.filter(s=>s.stage===st).reduce((a,s)=>a+(s.amount||0),0); const ct=sponsors.filter(s=>s.stage===st).length;
        return <div key={st} className="px-3 py-2 rounded-lg text-center" style={{background:STAGE_COLOR[st]+"18",minWidth:96}}><div className="text-[10px] font-semibold uppercase" style={{color:STAGE_COLOR[st]}}>{st}</div><div className="font-semibold text-sm">{usd(tot)}</div><div className="text-[10px]" style={{color:C.muted}}>{ct} sponsor{ct!==1?"s":""}</div></div>; })}</div>
      <div className="overflow-x-auto mt-2"><table className="w-full text-sm"><thead><tr style={{color:C.muted}} className="text-[11px] uppercase">{["Sponsor","Tier","Amount","Stage","Contact","Note",""].map((h,i)=><th key={i} className="text-left font-semibold px-3 py-2" style={{borderBottom:`1px solid ${C.line}`}}>{h}</th>)}</tr></thead>
        <tbody>{sponsors.map(s=><tr key={s.id} style={{borderBottom:`1px solid ${C.line}`}}>
          <td className="px-3 py-2"><TxtCell value={s.name} onChange={v=>sPatch(s.id,"name",v)} w={170}/></td>
          <td className="px-3 py-2"><TxtCell value={s.tier} onChange={v=>sPatch(s.id,"tier",v)} w={80}/></td>
          <td className="px-3 py-2"><NumCell value={s.amount} onChange={v=>sPatch(s.id,"amount",v)} prefix="$" w={96}/></td>
          <td className="px-3 py-2"><Select value={s.stage} onChange={v=>sStage(s,v)} options={SPONSOR_STAGES} w={120} color={STAGE_COLOR[s.stage]}/></td>
          <td className="px-3 py-2"><TxtCell value={s.contact} onChange={v=>sPatch(s.id,"contact",v)} w={130}/></td>
          <td className="px-3 py-2"><TxtCell value={s.note} onChange={v=>sPatch(s.id,"note",v)} w={170}/></td>
          <td className="px-2 py-2"><button onClick={()=>sDel(s)} style={{color:C.muted}}><Trash2 size={14}/></button></td>
        </tr>)}</tbody></table></div>
      <div className="px-4 py-2 text-[11px]" style={{color:C.muted}}>Committed + Invoiced + Paid flows into projected income. Prospect and Contacted are upside, not yet counted.</div>
    </Card>

    <Card pad={false}>
      <Bar2 title="Add-on revenue (assumptions → actuals)" right={`${usd(addonRev)} rev · ${usd(addonSurplus)} surplus`} action={<button onClick={()=>set("addons",[...income.addons,{id:uid("a"),event:"New add-on",attendees:0,cost:0,price:0,actualAttendees:0,actualRevenue:0}])} className="text-xs flex items-center gap-1 font-semibold" style={{color:C.gold}}><Plus size={13}/>Add</button>}/>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{color:C.muted}} className="text-[11px] uppercase">{["Event","Proj. #","Unit cost","Sale price","Surplus","Actual #","Actual rev",""].map((h,i)=><th key={i} className="text-left font-semibold px-3 py-2" style={{borderBottom:`1px solid ${C.line}`}}>{h}</th>)}</tr></thead>
        <tbody>{income.addons.map(r=><tr key={r.id} style={{borderBottom:`1px solid ${C.line}`}}>
          <td className="px-3 py-2"><TxtCell value={r.event} onChange={v=>patch("addons",r.id,"event",v)} w={210}/></td>
          <td className="px-3 py-2"><NumCell value={r.attendees} onChange={v=>patch("addons",r.id,"attendees",v)} w={58}/></td>
          <td className="px-3 py-2"><NumCell value={r.cost} onChange={v=>patch("addons",r.id,"cost",v)} prefix="$" w={76}/></td>
          <td className="px-3 py-2"><NumCell value={r.price} onChange={v=>patch("addons",r.id,"price",v)} prefix="$" w={76}/></td>
          <td className="px-3 py-2 font-semibold" style={{color:C.pos}}>{usd(r.attendees*(r.price-r.cost))}</td>
          <td className="px-3 py-2"><NumCell value={r.actualAttendees} onChange={v=>patch("addons",r.id,"actualAttendees",v)} w={58}/></td>
          <td className="px-3 py-2"><NumCell value={r.actualRevenue} onChange={v=>patch("addons",r.id,"actualRevenue",v)} prefix="$" w={90}/></td>
          <td className="px-2 py-2"><button onClick={()=>del("addons",r.id)} style={{color:C.muted}}><Trash2 size={14}/></button></td>
        </tr>)}</tbody></table></div>
    </Card>

    <Card pad={false}>
      <Bar2 title="Items sold (assumptions → actuals)" right={`${usd(itemRev)} rev · ${usd(itemSurplus)} surplus`} action={<button onClick={()=>set("items",[...income.items,{id:uid("i"),item:"New item",qty:0,cost:0,price:0,actualQty:0,actualRevenue:0}])} className="text-xs flex items-center gap-1 font-semibold" style={{color:C.gold}}><Plus size={13}/>Add</button>}/>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{color:C.muted}} className="text-[11px] uppercase">{["Item","Proj. qty","Unit cost","Sale price","Surplus","Actual qty","Actual rev",""].map((h,i)=><th key={i} className="text-left font-semibold px-3 py-2" style={{borderBottom:`1px solid ${C.line}`}}>{h}</th>)}</tr></thead>
        <tbody>{income.items.map(r=><tr key={r.id} style={{borderBottom:`1px solid ${C.line}`}}>
          <td className="px-3 py-2"><TxtCell value={r.item} onChange={v=>patch("items",r.id,"item",v)} w={190}/></td>
          <td className="px-3 py-2"><NumCell value={r.qty} onChange={v=>patch("items",r.id,"qty",v)} w={58}/></td>
          <td className="px-3 py-2"><NumCell value={r.cost} onChange={v=>patch("items",r.id,"cost",v)} prefix="$" w={76}/></td>
          <td className="px-3 py-2"><NumCell value={r.price} onChange={v=>patch("items",r.id,"price",v)} prefix="$" w={76}/></td>
          <td className="px-3 py-2 font-semibold" style={{color:C.pos}}>{usd(r.qty*(r.price-r.cost))}</td>
          <td className="px-3 py-2"><NumCell value={r.actualQty} onChange={v=>patch("items",r.id,"actualQty",v)} w={58}/></td>
          <td className="px-3 py-2"><NumCell value={r.actualRevenue} onChange={v=>patch("items",r.id,"actualRevenue",v)} prefix="$" w={90}/></td>
          <td className="px-2 py-2"><button onClick={()=>del("items",r.id)} style={{color:C.muted}}><Trash2 size={14}/></button></td>
        </tr>)}</tbody></table></div>
    </Card>

    <Card pad={false}>
      <Bar2 title="Funding & other income (budget → actual)" right={usd(otherBud)} action={<button onClick={()=>set("other",[...income.other,{id:uid("o"),label:"New source",budgeted:0,actual:0,note:""}])} className="text-xs flex items-center gap-1 font-semibold" style={{color:C.gold}}><Plus size={13}/>Add</button>}/>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{color:C.muted}} className="text-[11px] uppercase">{["Source","Budgeted","Actual","Variance","Note",""].map((h,i)=><th key={i} className="text-left font-semibold px-3 py-2" style={{borderBottom:`1px solid ${C.line}`}}>{h}</th>)}</tr></thead>
        <tbody>{income.other.map(r=><tr key={r.id} style={{borderBottom:`1px solid ${C.line}`}}>
          <td className="px-3 py-2"><TxtCell value={r.label} onChange={v=>patch("other",r.id,"label",v)} w={200}/></td>
          <td className="px-3 py-2"><NumCell value={r.budgeted} onChange={v=>patch("other",r.id,"budgeted",v)} prefix="$" w={104}/></td>
          <td className="px-3 py-2"><NumCell value={r.actual} onChange={v=>patch("other",r.id,"actual",v)} prefix="$" w={104}/></td>
          <td className="px-3 py-2 font-semibold" style={{color:(r.actual-r.budgeted)>=0?C.pos:C.neg}}>{usd((r.actual||0)-(r.budgeted||0))}</td>
          <td className="px-3 py-2"><TxtCell value={r.note} onChange={v=>patch("other",r.id,"note",v)} w={210}/></td>
          <td className="px-2 py-2"><button onClick={()=>del("other",r.id)} style={{color:C.muted}}><Trash2 size={14}/></button></td>
        </tr>)}</tbody></table></div>
    </Card>
  </div>;
}
function HcChip({label,v,a}){ return <div className="text-center"><div className="text-[10px] uppercase tracking-wide" style={{color:"#9fc3b8"}}>{label}</div><div className="font-semibold text-white">{v}{a!==undefined&&<span className="text-[11px]" style={{color:C.gold}}> / {a}</span>}</div></div>; }
function Bar2({title,right,action}){ return <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-2" style={{background:C.deep,borderRadius:"14px 14px 0 0"}}><h3 className="text-white font-semibold text-sm" style={{fontFamily:"Fraunces,serif"}}>{title}</h3><div className="flex items-center gap-4"><span style={{color:C.gold}} className="font-semibold text-sm">{right}</span>{action}</div></div>; }

function Foundation({expenses,income,settings,tracker}){
  const fLines=expenses.filter(r=>r.entity==="Foundation");
  const actualByLine=useMemo(()=>{ const m={}; (tracker||[]).forEach(t=>{ if(t.budgetLineId){ m[t.budgetLineId]=(m[t.budgetLineId]||0)+(t.cost||0); } }); return m; },[tracker]);
  const la=(r)=>actualByLine[r.id]||0;
  const obligation=fLines.reduce((a,r)=>a+effEstimated(r,settings),0); const paid=fLines.reduce((a,r)=>a+la(r),0);
  const reimb=income.other.filter(r=>/foundation/i.test(r.label)).reduce((a,r)=>a+(r.budgeted||0),0);
  const reimbActual=income.other.filter(r=>/foundation/i.test(r.label)).reduce((a,r)=>a+(r.actual||0),0);
  const variance=reimb-obligation;
  return <div className="space-y-5">
    <SectionTitle sub="Everything tagged “Foundation” as the paying entity, netted against the Foundation reimbursement budgeted in Income. Paid amounts roll up from Expense Tracker entries tagged to each line.">Foundation Reimbursement Reconciliation</SectionTitle>
    <div className="grid gap-3" style={{gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))"}}>
      <Kpi label="Foundation obligation" value={usd(obligation)} sub="Foundation-tagged expense" tone={C.gold}/><Kpi label="Reimbursement budgeted" value={usd(reimb)} sub={usd(reimbActual)+" received"} tone={C.nile}/><Kpi label="Coverage variance" value={usd(variance)} tone={variance>=0?C.pos:C.neg} accent/><Kpi label="Actually paid out" value={usd(paid)} sub={pct(obligation?paid/obligation:0)+" of obligation"} tone={C.deep}/>
    </div>
    <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg" style={{background:variance>=0?C.goldSoft:"#fdf3ef",color:variance>=0?C.warn:C.neg}}>
      {variance>=0 ? <><ShieldCheck size={16}/>Reimbursement budget covers the Foundation obligation with {usd(variance)} of headroom.</> : <><AlertTriangle size={16}/>The Fraternity is fronting {usd(-variance)} more than the Foundation reimbursement covers. Confirm the gap with the Foundation.</>}
    </div>
    <Card pad={false}>
      <div className="px-4 py-3" style={{background:C.deep,borderRadius:"14px 14px 0 0"}}><h3 className="text-white font-semibold text-sm" style={{fontFamily:"Fraunces,serif"}}>Foundation-paid line items</h3></div>
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{color:C.muted}} className="text-[11px] uppercase">{["Category","Line item","Estimate","Actual","Status"].map((h,i)=><th key={i} className="text-left font-semibold px-3 py-2" style={{borderBottom:`1px solid ${C.line}`}}>{h}</th>)}</tr></thead>
        <tbody>{fLines.map(r=>{ const eff=effEstimated(r,settings); const a=la(r); const st=a>=eff&&eff>0?"Settled":(a>0?"Partial":"Outstanding");
          return <tr key={r.id} style={{borderBottom:`1px solid ${C.line}`}}><td className="px-3 py-2" style={{color:C.muted}}>{r.category.slice(0,28)}</td><td className="px-3 py-2 font-medium">{r.item}</td><td className="px-3 py-2">{usd(eff)}</td><td className="px-3 py-2">{a>0?usd(a):"—"}</td><td className="px-3 py-2"><Pill text={st} color={st==="Settled"?C.pos:(st==="Partial"?C.warn:C.muted)}/></td></tr>; })}
          {fLines.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center" style={{color:C.muted}}>No lines are tagged to the Foundation yet. Set a line's “Pays” to Foundation in the Budget tab.</td></tr>}
          <tr style={{background:C.paper}}><td className="px-3 py-2 font-bold" colSpan={2}>Total</td><td className="px-3 py-2 font-bold">{usd(obligation)}</td><td className="px-3 py-2 font-bold">{usd(paid)}</td><td></td></tr>
        </tbody></table></div>
    </Card>
  </div>;
}

/* ============================== ACTIVITY =============================== */
function Activity({audit,expenses,setExpenses,editor}){
  const pending=expenses.filter(e=>e.approval==="Submitted");
  const decide=(r,val)=> setExpenses(expenses.map(x=>x.id===r.id?{...x,approval:val,approver:editor||"Team member"}:x), `${val} budget line “${r.item}”`);
  const kindColor=k=>({approval:C.pos,system:C.muted,edit:C.gold}[k]||C.gold);
  return <div className="space-y-5">
    <SectionTitle sub="Pending finance-committee approvals and a running log of every change made by the team.">Activity & Approvals</SectionTitle>
    <Card>
      <h3 className="font-semibold mb-3 flex items-center gap-2" style={{fontFamily:"Fraunces,serif"}}><ShieldCheck size={18} style={{color:C.gold}}/>Pending approvals {pending.length>0&&<Pill text={pending.length+" waiting"} color={C.warn}/>}</h3>
      {pending.length===0 ? <p className="text-sm" style={{color:C.muted}}>Nothing awaiting sign-off. Submit a budget line for approval from the Budget tab.</p> :
        <div className="space-y-2">{pending.map(r=><div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg" style={{background:C.paper}}>
          <div><div className="font-medium text-sm">{r.item}</div><div className="text-xs" style={{color:C.muted}}>{r.category.slice(0,30)} · {usd(rowEstimated(r))}</div></div>
          <div className="flex gap-2"><button onClick={()=>decide(r,"Approved")} className="px-3 py-1.5 rounded-md text-white text-xs font-semibold" style={{background:C.pos}}>Approve</button><button onClick={()=>decide(r,"Rejected")} className="px-3 py-1.5 rounded-md text-xs font-semibold" style={{background:C.chip,color:C.neg}}>Reject</button></div></div>)}</div>}
    </Card>
    <Card>
      <h3 className="font-semibold mb-3 flex items-center gap-2" style={{fontFamily:"Fraunces,serif"}}><History size={18} style={{color:C.nile}}/>Audit trail</h3>
      {audit.length===0 ? <p className="text-sm" style={{color:C.muted}}>No activity logged yet. Changes will appear here with who made them and when.</p> :
        <div className="space-y-0">{audit.map((a,i)=><div key={a.id} className="flex items-start gap-3 py-2" style={{borderBottom:i<audit.length-1?`1px solid ${C.line}`:"none"}}>
          <span style={{width:8,height:8,borderRadius:4,background:kindColor(a.kind),marginTop:6,flexShrink:0}}/><div className="flex-1"><div className="text-sm">{a.summary}</div><div className="text-[11px]" style={{color:C.muted}}>{a.editor} · {tstr(a.ts)}</div></div></div>)}</div>}
      <p className="text-[11px] mt-3 pt-2" style={{color:C.muted,borderTop:`1px solid ${C.line}`}}>Keeps the most recent 500 changes. Set your name in the header so edits are attributed to you.</p>
    </Card>
  </div>;
}


/* ============================== AUTH GATE ============================== */
function injectFonts(){ if(document.getElementById("dsp-fonts")) return;
  const l=document.createElement("link"); l.id="dsp-fonts"; l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap";
  document.head.appendChild(l); }
function Login(){
  const [pw,setPw]=useState(""); const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const submit=async()=>{ if(!pw)return; setBusy(true); setErr("");
    const { error } = await signInWithPassword(pw);
    if(error) setErr("That password didn't work. Try again, or check with Andrew.");
    setBusy(false); };
  return <div style={{background:C.deep,minHeight:"100vh",fontFamily:"Inter, system-ui, sans-serif"}} className="flex items-center justify-center px-4">
    <div style={{background:C.card,borderRadius:16,maxWidth:380}} className="w-full p-7">
      <div style={{color:C.gold,letterSpacing:".2em"}} className="text-[11px] font-semibold">DELTA SIGMA PHI · NEXT ERA IN ACTION</div>
      <h1 style={{fontFamily:"Fraunces, serif",fontWeight:600}} className="text-2xl mt-1 mb-1">Convention Hub</h1>
      <p className="text-sm mb-5" style={{color:C.muted}}>Enter the team password to continue.</p>
      <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Team password" autoFocus className="w-full px-3 py-2 rounded-md outline-none text-sm" style={{border:`1px solid ${C.line}`}}/>
      {err && <div className="text-xs mt-2" style={{color:C.neg}}>{err}</div>}
      <button onClick={submit} disabled={busy} className="w-full mt-4 py-2.5 rounded-md text-white font-semibold text-sm flex items-center justify-center gap-2" style={{background:C.deep}}>{busy && <Loader2 size={15} className="animate-spin"/>}{busy?"Signing in…":"Enter"}</button>
    </div></div>;
}
function Root(){
  const [session,setSession]=useState(undefined);
  useEffect(()=>{ injectFonts(); let mounted=true;
    getSession().then(s=>{ if(mounted)setSession(s); });
    const { data:sub } = supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
    return ()=>{ mounted=false; sub.subscription.unsubscribe(); };
  },[]);
  if(session===undefined) return <Splash/>;
  if(!session) return <Login/>;
  return <Hub/>;
}
export default Root;

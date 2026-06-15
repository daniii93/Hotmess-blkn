// Zentrale Demo-Datenbasis für alle Bereiche — wird durch echte DB-Daten ersetzt

export const DEMO_EVENTS = [
  {
    id: "evt-ibk-2026-09",
    slug: "innsbruck-2026-09",
    title: "HotMess Innsbruck",
    city: "Innsbruck",
    venue: "Club X, Salurner Str. 15",
    date: "12.09.2026",
    doors: "22:00",
    category: "Club Night",
    status: "published" as const,
    statusLabel: "Veröffentlicht",
    capacityF: 200,
    soldF: 183,
    capacityM: 200,
    soldM: 196,
    revenue: 14_820,
    waitlist: 23,
    tickets: [
      { type: "Early Bird", price: 20, sold: 120, limit: 120 },
      { type: "Regular", price: 25, sold: 195, limit: 220 },
      { type: "VIP", price: 45, sold: 64, limit: 80 },
    ],
  },
  {
    id: "evt-vie-2026-10",
    slug: "wien-2026-10",
    title: "HotMess Wien",
    city: "Wien",
    venue: "Pratersauna, Waldsteingartenstr. 135",
    date: "10.10.2026",
    doors: "23:00",
    category: "Club Night",
    status: "published" as const,
    statusLabel: "Fast ausverkauft",
    capacityF: 250,
    soldF: 241,
    capacityM: 250,
    soldM: 238,
    revenue: 19_450,
    waitlist: 61,
    tickets: [
      { type: "Early Bird", price: 24, sold: 200, limit: 200 },
      { type: "Regular", price: 30, sold: 230, limit: 240 },
      { type: "VIP", price: 55, sold: 49, limit: 60 },
    ],
  },
  {
    id: "evt-muc-2026-11",
    slug: "muenchen-2026-11",
    title: "HotMess München",
    city: "München",
    venue: "TBA",
    date: "08.11.2026",
    doors: "22:30",
    category: "Club Night",
    status: "draft" as const,
    statusLabel: "Entwurf",
    capacityF: 180,
    soldF: 0,
    capacityM: 180,
    soldM: 0,
    revenue: 0,
    waitlist: 0,
    tickets: [],
  },
];

export const DEMO_USERS = [
  { id: "u1", name: "Ana Markovic", email: "ana@demo.at", city: "Innsbruck", status: "aktiv", verified: true, role: "user", joined: "03.01.2026", tickets: 3 },
  { id: "u2", name: "Marko Jovanovic", email: "marko@demo.at", city: "Wien", status: "aktiv", verified: true, role: "user", joined: "15.01.2026", tickets: 2 },
  { id: "u3", name: "Lena Horvat", email: "lena@demo.hr", city: "Innsbruck", status: "aktiv", verified: true, role: "user", joined: "22.02.2026", tickets: 4 },
  { id: "u4", name: "Stefan Petrovic", email: "stefan@demo.at", city: "München", status: "aktiv", verified: false, role: "user", joined: "01.03.2026", tickets: 1 },
  { id: "u5", name: "Nexo Dragan", email: "nexo@demo.de", city: "München", status: "aktiv", verified: true, role: "user", joined: "14.03.2026", tickets: 2 },
  { id: "u6", name: "Milica Stojanovic", email: "milica@demo.rs", city: "Graz", status: "inaktiv", verified: false, role: "user", joined: "29.03.2026", tickets: 0 },
  { id: "u7", name: "Djordje Boskovic", email: "djordje@demo.at", city: "Salzburg", status: "aktiv", verified: true, role: "scanner", joined: "05.04.2026", tickets: 1 },
  { id: "u8", name: "Ivana Nikolic", email: "ivana@demo.at", city: "Wien", status: "gesperrt", verified: true, role: "user", joined: "10.04.2026", tickets: 0 },
];

export const DEMO_ACTIVITY = [
  { time: "Jetzt", text: "Marko Jovanovic hat Ticket für HotMess Wien gekauft", type: "ticket" },
  { time: "vor 3 Min", text: "Ana Markovic hat sich verifiziert (Stripe Identity)", type: "verify" },
  { time: "vor 11 Min", text: "Neue Meldung: Post von @nexo als Spam markiert", type: "mod" },
  { time: "vor 24 Min", text: "Lena Horvat hat VIP-Ticket + Tisch 4er gebucht", type: "ticket" },
  { time: "vor 1 Std", text: "Business Plus: Stefan Petrovic aktiviert", type: "business" },
  { time: "vor 2 Std", text: "Broadcast 'HotMess Wien fast ausverkauft' gesendet — 2.104 Empfänger", type: "broadcast" },
  { time: "vor 3 Std", text: "Djordje Boskovic als Scanner für HotMess Innsbruck freigeschaltet", type: "scanner" },
  { time: "Heute früh", text: "Dating-Matches: 47 neue Matches in Innsbruck", type: "dating" },
];

export const DEMO_FINANCE = [
  { event: "HotMess Innsbruck", tickets: 9_750, addons: 2_340, hotel: 1_290, other: 1_440, costs: 4_800, net: 10_020 },
  { event: "HotMess Wien", tickets: 13_920, addons: 3_100, hotel: 890, other: 1_540, costs: 5_600, net: 13_850 },
];

export const DEMO_PARTNERS = [
  { name: "Hotel Adler Innsbruck", type: "Hotel", commission: 12, status: "aktiv", revenue: 1_290, outstanding: 0 },
  { name: "Club X Innsbruck", type: "Club", commission: 8, status: "aktiv", revenue: 4_200, outstanding: 800 },
  { name: "Getränke Sponsor Austria", type: "Sponsor", commission: 5, status: "aktiv", revenue: 600, outstanding: 600 },
  { name: "Hotel Sacher Wien", type: "Hotel", commission: 10, status: "aktiv", revenue: 890, outstanding: 890 },
];

export const DEMO_DISTRIBUTION_PARTNERS = [
  { name: "Ana Markovic", code: "ANA2026", level: 3, status: "active", tickets: 36, commission: 648, pending: 180 },
  { name: "Marko Jovanovic", code: "MARKO2026", level: 2, status: "active", tickets: 24, commission: 360, pending: 120 },
  { name: "Lena Horvat", code: "LENA2026", level: 1, status: "active", tickets: 12, commission: 144, pending: 144 },
];

export const DEMO_CODES = [
  { code: "EARLY20", type: "percent", value: 20, uses: 87, limit: 100, expires: "01.08.2026", event: "Alle" },
  { code: "VIP-IBK", type: "fixed", value: 10, uses: 34, limit: 50, expires: "12.09.2026", event: "Innsbruck" },
  { code: "FREUNDE", type: "percent", value: 15, uses: 12, limit: null, expires: null, event: "Alle" },
];

export const DEMO_KPI = {
  members: 2_847,
  membersGrowth: "+124 diese Woche",
  salesToday: 87,
  salesLabel: "Tickets heute",
  revenueMonth: "34.200 EUR",
  revenueGrowth: "+12% ggü. Vormonat",
  dau: 1_203,
  dauLabel: "aktive Nutzer heute",
  verifyOpen: 12,
  verifyLabel: "Stripe-Fälle offen",
  modOpen: 4,
  modLabel: "Meldungen priorisiert",
  nextEvent: "Innsbruck",
  nextEventDays: "in 90 Tagen",
  waitlist: "W 183 / M 196",
  waitlistLabel: "Gender-Stand",
};

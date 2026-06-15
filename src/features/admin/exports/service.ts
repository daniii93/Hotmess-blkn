export type AdminExportType =
  | "guest_list"
  | "hotel_bookings"
  | "table_list"
  | "fast_lane"
  | "birthday_packages"
  | "revenue"
  | "scanner_log";

export const exportHeadersByType: Readonly<Record<AdminExportType, string[]>> = {
  guest_list: ["Name", "Geschlecht", "Ticketstatus", "Check-in"],
  hotel_bookings: ["Gast", "Zimmerart", "Check-in", "Check-out", "Status"],
  table_list: ["Tisch", "Typ", "Kapazität", "Status"],
  fast_lane: ["Name", "Event", "Status"],
  birthday_packages: ["Buchender", "Paket", "Zeitfenster", "Interne Notiz"],
  revenue: ["Quelle", "Betrag", "Status", "Datum"],
  scanner_log: ["Scanner", "Ticket", "Ergebnis", "Zeitpunkt"],
};

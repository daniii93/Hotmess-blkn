export type CronJobKey =
  | "expire_reservations"
  | "promote_waitlist"
  | "expire_split_payments"
  | "send_event_reminders"
  | "complete_events"
  | "cleanup_verification_files";

export type CronJobDefinition = {
  key: CronJobKey;
  schedule: string;
  description: string;
};

export const cronJobs: readonly CronJobDefinition[] = [
  { key: "expire_reservations", schedule: "* * * * *", description: "Ticketreservierungen jede Minute ablaufen lassen." },
  { key: "promote_waitlist", schedule: "* * * * *", description: "Warteliste jede Minute promoten." },
  { key: "expire_split_payments", schedule: "*/5 * * * *", description: "Split Payments alle 5 Minuten pruefen." },
  { key: "send_event_reminders", schedule: "0 9 * * *", description: "Event Reminder taeglich senden." },
  { key: "complete_events", schedule: "0 * * * *", description: "Events stuendlich abschliessen." },
  { key: "cleanup_verification_files", schedule: "30 2 * * *", description: "Verification-Dateien taeglich bereinigen." },
];

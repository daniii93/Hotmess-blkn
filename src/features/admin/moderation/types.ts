export type ModerationDecision =
  | "warn"
  | "restrict_chat"
  | "suspend"
  | "ban"
  | "clear"
  | "dismiss_report";

export type ModerationReportStatus = "new" | "in_review" | "resolved" | "dismissed";

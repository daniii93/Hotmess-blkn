export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export type TicketStatus = "reserved" | "paid" | "valid" | "used" | "cancelled" | "expired";

export type WaitlistStatus = "waiting" | "promoted" | "expired" | "cancelled";

export type OrderStatus = "pending" | "paid" | "partially_refunded" | "cancelled" | "expired";

export type BookingStatus = "reserved" | "confirmed" | "cancelled" | "completed" | "checked_in" | "checked_out";

export type ScanResult = "ok" | "already_used" | "invalid" | "wrong_event" | "cancelled" | "expired";


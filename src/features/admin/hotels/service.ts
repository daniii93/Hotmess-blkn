export type AdminHotelBookingRow = {
  bookingId: string;
  guestNames: string[];
  guestUserIds: string[];
  roomType: "single" | "double" | "twin" | "suite";
  nights: number;
  checkIn: string;
  checkOut: string;
  salePriceCents: number;
  costPriceCents: number;
  status: "reserved" | "confirmed" | "cancelled" | "expired";
  confirmationCode?: string;
};

export const calculateHotelMarginCents = (
  booking: Pick<AdminHotelBookingRow, "salePriceCents" | "costPriceCents">,
): number => booking.salePriceCents - booking.costPriceCents;

export type HotelPartnerLevel = "standard" | "premium" | "signature";

export type HotelBookingMode = "external_link" | "inquiry" | "direct";

export type HotelInventoryStatus = "available" | "request_only" | "sold_out";

export type HotelRoomType = "single" | "double" | "twin" | "suite";

export type HotelRoomOption = "breakfast" | "late_checkout" | "upgrade";

export type EventHotelInventory = {
  eventId: string;
  hotelId: string;
  roomType: HotelRoomType;
  totalRooms: number;
  reservedRooms: number;
  confirmedRooms: number;
  priceCents: number;
  options: HotelRoomOption[];
};

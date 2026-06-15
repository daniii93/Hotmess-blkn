import type { EventHotelInventory, HotelInventoryStatus } from "./types";

export const getAvailableHotelRooms = (inventory: EventHotelInventory): number =>
  Math.max(0, inventory.totalRooms - inventory.reservedRooms - inventory.confirmedRooms);

export const getHotelInventoryStatus = (inventory: EventHotelInventory): HotelInventoryStatus => {
  const available = getAvailableHotelRooms(inventory);
  if (available === 0) return "sold_out";
  if (available <= 2) return "request_only";
  return "available";
};

export const canBookHotelForEvent = (params: {
  hasTicket: boolean;
  inventory: EventHotelInventory;
}): boolean => params.hasTicket && getAvailableHotelRooms(params.inventory) > 0;

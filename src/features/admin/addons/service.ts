export type AdminAddonCategory =
  | "hotel"
  | "table"
  | "drink_package"
  | "bottle_service"
  | "fast_lane"
  | "birthday"
  | "fruit_platter";

export type AdminAddonConfig = {
  category: AdminAddonCategory;
  enabled: boolean;
  priceCents: number;
  marginCents?: number;
  inventory?: number;
  bookingDeadline?: string;
};

export const isAddonConfigSellable = (config: AdminAddonConfig): boolean =>
  config.enabled && config.priceCents >= 0 && (config.inventory === undefined || config.inventory > 0);

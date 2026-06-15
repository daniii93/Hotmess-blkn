export const formatMoney = (cents: number, currency = "EUR") =>
  new Intl.NumberFormat("de-AT", { style: "currency", currency }).format(cents / 100);

export const formatEventDate = (value: string) =>
  new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

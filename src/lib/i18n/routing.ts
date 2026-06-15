export const locales = ["de", "sr-latn", "it"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";

export const localePrefix = "as-needed" as const;

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);


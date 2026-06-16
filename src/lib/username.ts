export const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;

export const normalizeUsername = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "")
    .slice(0, 30);

export const usernameRuleText = "3-30 Zeichen: Kleinbuchstaben, Zahlen, Punkt oder Unterstrich.";

export function buildUsernameCandidates(desired: string, seed?: string | number) {
  const normalized = normalizeUsername(desired);
  const compact = normalized.replace(/[._]/g, "");
  const suffix = String(seed ?? new Date().getFullYear()).slice(-2);
  const base = (normalized || compact || "hotmess").slice(0, 22);
  const shortBase = (compact || base || "hotmess").slice(0, 18);

  return Array.from(new Set([
    base,
    `${base}.${suffix}`,
    `${base}_${suffix}`,
    `${shortBase}${suffix}`,
    `${shortBase}_hm`,
    `${shortBase}.hm`,
  ]))
    .map((candidate) => candidate.slice(0, 30))
    .filter((candidate) => USERNAME_REGEX.test(candidate));
}

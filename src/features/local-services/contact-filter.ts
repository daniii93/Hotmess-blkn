const contactPatterns: Array<{ reason: string; pattern: RegExp }> = [
  { reason: "Telefonnummer", pattern: /(?:\+|00)?\d[\d\s()./-]{6,}\d/g },
  { reason: "E-Mail-Adresse", pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi },
  { reason: "Externe URL", pattern: /\b(?:https?:\/\/|www\.)\S+/gi },
  { reason: "WhatsApp-Hinweis", pattern: /\b(?:whatsapp|wa\.me)\b/gi },
  { reason: "Telegram-Hinweis", pattern: /\b(?:telegram|t\.me)\b/gi },
  { reason: "Social-Media-Handle", pattern: /(^|\s)@[a-z0-9._]{3,}/gi },
  { reason: "Direktkontakt", pattern: /\b(?:ruf mich an|schreib mir direkt|machen wir ausserhalb|machen wir außerhalb|direkt melden|extern klären|extern klaeren)\b/gi },
  { reason: "Zahlungsdaten", pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g },
  { reason: "Terminlink", pattern: /\b(?:calendly|cal\.com|doodle|terminland)\b/gi },
];

export type ContactFilterResult = {
  blocked: boolean;
  reasons: string[];
  sanitizedText: string;
};

export const contactProtectionMessage =
  "Aus Sicherheitsgruenden bleiben Kontaktdaten bis zur Auftragsbestaetigung geschuetzt. Bitte nutze den HotMess-Chat.";

export function filterProtectedContactText(text: string): ContactFilterResult {
  const reasons = new Set<string>();
  let sanitizedText = text;

  for (const { reason, pattern } of contactPatterns) {
    sanitizedText = sanitizedText.replace(pattern, (match) => {
      reasons.add(reason);
      return "[geschuetzte Kontaktdaten]";
    });
  }

  return {
    blocked: reasons.size > 0,
    reasons: [...reasons],
    sanitizedText,
  };
}

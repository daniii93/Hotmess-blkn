import type { ModerationDecision } from "./types";

export const getModerationNotice = (decision: ModerationDecision): string => {
  switch (decision) {
    case "warn":
      return "Dein Konto wurde verwarnt. Bitte beachte die HOTMESS Regeln.";
    case "restrict_chat":
      return "Deine Chat-Funktion ist aktuell eingeschränkt.";
    case "suspend":
      return "Dein Konto wurde vorübergehend eingeschränkt.";
    case "ban":
      return "Dein Konto wurde gesperrt.";
    case "clear":
      return "Dein Konto ist wieder vollständig aktiv.";
    case "dismiss_report":
      return "Die Meldung wurde ohne weitere Maßnahme geschlossen.";
  }
};

# HotMess Masterplan v5.0

## Abschnitt 2/10: Brand Identity, Luxury Members Club Design System & UX Philosophy

Stand: 2026-06-12

Dieser Abschnitt definiert die visuelle und UX-technische Grundlage fuer HotMess. Er aendert keine Businesslogik und entfernt keine bestehenden Funktionen. Alle folgenden Abschnitte muessen diese Regeln respektieren.

## 0. Kritische Design-Regel

HotMess darf nicht wie eine normale Event-App, Dating-App, Social-Media-App oder Nightlife-Plattform aussehen.

HotMess muss wirken wie:

- Luxury Members Club
- European Elite Lifestyle
- Premium Travel Community
- Private Event Society
- High-End Hospitality Plattform

Die Plattform soll sich anfuehlen wie St. Moritz, Monaco, Zuerich, Mailand, Como, Lugano, elegante Rooftop Lounges, Luxushotels und Private Members Clubs.

## 1. Markenpositionierung

HotMess ist ein exklusiver digitaler Members Club fuer verifizierte Menschen der Ex-Jugoslawien Diaspora in DACH und Italien.

Markengefuehl:

> HotMess ist nicht fuer jeden. Und das ist der Punkt.

Die UI muss exklusiv, kuratiert, hochwertig, ruhig, erwachsen, luxurioes, sozial, selbstbewusst und nicht laut wirken.

## 2. Visuell verboten

Konsequent vermeiden:

- Neonfarben
- Club-Flyer-Optik
- billige Party-App-Optik
- Dating-App-Muster
- Tinder-aehnliche Cards
- generische SaaS-Templates
- Gaming-Aesthetik
- aggressive Gradients
- grelle Pink/Orange-Flaechen
- ueberladene Screens
- Social-Media-Klon-UI
- billige Stockfotos
- laute Animationen

Diese Verbote sind in `src/config/brand.ts` als `forbiddenVisualDirections` dokumentiert.

## 3. Visuelle DNA

HotMess ist:

```txt
Luxury Social Club x Balkan Elite x European Travel Lifestyle
```

Das Design fuehlt sich an wie ein privater Abend auf einer Rooftop-Terrasse in Mailand, ein Wochenende in St. Moritz, eine elegante Hotelbar in Zuerich oder ein exklusives Dinner vor einem HotMess Event.

## 4. Farbpalette

Die offiziellen Tokens liegen in:

- `src/styles/tokens.css`
- `src/config/theme.ts`
- `tailwind.config.ts`
- gespiegelt in `styles.css` fuer die aktuelle PHP-Live-Seite

Kernfarben:

- Ivory: `#F7F4EF`
- Pearl: `#FDFBF8`
- Champagne: `#D8B46A`
- Soft Gold: `#C8A35D`
- Antique Gold: `#A9823A`
- Red: `#B91C1C`
- Black: `#0F0F10`
- Luxury Black: `#080808`
- Charcoal: `#171717`
- Deep Charcoal: `#232323`

## 5. Farbverwendung

Hauptflaechen:

- App: `hm-black`, `hm-luxury-black`
- Cards: `hm-charcoal`, `hm-deep-charcoal`, optional Glass
- helle Landing-Sektionen: `hm-ivory`, `hm-pearl`

Gold:

- Premium CTAs
- Borders
- Badges
- Icons
- wichtige Hervorhebungen
- Hover States

Rot:

- HotMess Signature
- Warnungen
- wenige gezielte Akzente
- niemals als grosse Primaerflaeche

## 6. Tailwind Theme

`tailwind.config.ts` enthaelt:

- `colors.hm.*`
- `borderRadius.luxury`, `card`, `pill`
- `boxShadow.luxury`, `gold`, `soft`
- `letterSpacing.luxury`
- `fontFamily.display`
- `fontFamily.sans`

## 7. Typografie

Headlines:

- Cormorant Garamond
- Playfair Display
- Libre Baskerville Fallback

Body/UI:

- Inter
- Arial/Helvetica Fallback

Regeln:

- Headlines gross, ruhig, editorial
- Labels klein, uppercase erlaubt, hohe Laufweite
- Buttons Inter Medium/SemiBold

## 8. Bildsprache

Erlaubt:

- Luxushotels
- Rooftop Lounges
- Alpenpanorama
- elegante Terrassen
- exklusive Restaurants
- private Dinner
- Champagner-Momente
- hochwertige Gruppenfotos
- Golden Hour
- warme Innenraeume
- Premium Travel Lifestyle

Verboten:

- Neonclubs
- betrunkene Menschen
- verschwitzte Tanzflaechen
- harte Blitzlichtfotos
- EDM Festivalbilder
- Fake-Stock-Laecheln
- extreme Influencer-Posen

## 9. Layout-Prinzipien

1. Weniger Elemente pro Screen.
2. Grosse visuelle Flaechen.
3. Viel Abstand.
4. Ruhige Hierarchie.
5. Mobile First.

Jede Seite muss schnell beantworten:

1. Wo bin ich?
2. Was ist wichtig?
3. Was kann ich tun?

## 10. Globale Komponenten-Regeln

Vorbereitet:

- `LuxuryButton`
- `LuxuryCard`
- `LuxuryBadge`
- `LuxurySection`
- `AppShell`
- `BottomNav`

Regeln:

- Buttons mindestens 44px hoch.
- Primary Button: Champagne Gold, dunkle Schrift, Pill Shape.
- Secondary Button: transparent, Gold-Border.
- Cards: grosse Rundung, subtile Border, weiche Schatten.
- Badges: klein, pill, hochwertig.
- Forms: grosse Inputs, klare Labels, dezente Fehler.
- Modals: grosse Rundung, Glass- oder Ivory-Look.

## 11. Animation

Motion-Grundlage liegt in `src/config/motion.ts`.

Erlaubt:

- Fade In
- leichte Y-Bewegung
- sanfte Scale-Effekte
- Card Hover Lift
- sehr subtiler Image Zoom
- weiche Page Transition

Verboten:

- Bouncy Animation
- aggressive Popups
- schnelle Neon-Glows
- Shake ausser bei Fehler
- gamifizierte Effekte

## 12. UX Philosophie

Jede Seite folgt:

```txt
Emotion -> Vertrauen -> Funktion
```

Nicht:

```txt
Funktion -> Preis -> Kaufdruck
```

Events zeigen zuerst Bild, Titel, Ort, Datum, Atmosphaere und Community-Kontext. Checkout zeigt zuerst Vertrauen, klare Schritte, personalisiertes Ticket und Sicherheit, dann Zahlung.

## 13. Landing Page Vorgaben

Landing Page ist eine Einladung, kein Ticketshop.

Reihenfolge:

1. Hero
2. Was ist HotMess?
3. Naechstes Event
4. Warum verifiziert?
5. Gender Balance erklaert
6. Travel & Add-ons
7. Community Preview
8. Join CTA
9. Footer

## 14. App Shell

Mobile Bottom Navigation:

- Feed
- Events
- Tickets
- Chat
- Profil

Scanner und Admin sind rollenbasiert getrennt. Scanner erscheint nicht in der normalen User Navigation.

## 15. Screen-spezifische Regeln

- Feed: Editorial Social Feed, grosse Bilder, wenig UI-Chrome.
- Events: Coverbilder, Premium Travel Look, Datum/Ort prominent, Gender Balance elegant.
- Event Detail: Hero, Eventdaten, Beschreibung, Gender Balance, Teilnehmer, Tickets, Add-ons, Hotels, Chat.
- Checkout: Premium Booking Flow, klare Steps, Warenkorb elegant.
- Tickets: Wallet-Look, grosser QR, Name/Foto sichtbar.
- Profile: Portrait, Cover, wenige Zahlen, Verified Badge.
- Chat: dunkel, ruhig, elegant, keine kindliche Messenger-Optik.
- Admin: Dark Luxury SaaS, KPI Cards mit Gold-Akzent.
- Scanner: klar, hoher Kontrast, keine dekorative Ablenkung.

## 16. i18n

Vorbereitet:

- `messages/de.json`
- `messages/sr-latn.json`
- `messages/it.json`

Launch-Sprache ist Deutsch. SR/HR und Italienisch sind strukturell vorbereitet.

## 17. Accessibility

Regeln:

- ausreichender Kontrast
- sichtbare Fokuszustaende
- Buttons mindestens 44px
- Labels vorhanden
- klare Fehlermeldungen
- Tastaturbedienung moeglich
- Screenreader Labels fuer Icons

## 18. Implementierte Abschnitt-2-Dateien

- `docs/masterplan/section-02-brand-design-ux.md`
- `src/config/brand.ts`
- `src/config/theme.ts`
- `src/config/motion.ts`
- `src/config/navigation.ts`
- `src/styles/globals.css`
- `src/styles/tokens.css`
- `src/components/ui/luxury-button.tsx`
- `src/components/ui/luxury-card.tsx`
- `src/components/ui/luxury-badge.tsx`
- `src/components/ui/luxury-section.tsx`
- `src/components/layout/app-shell.tsx`
- `src/components/layout/bottom-nav.tsx`
- `messages/de.json`
- `messages/sr-latn.json`
- `messages/it.json`

## 19. Offene TODOs fuer spaetere Abschnitte

- Komponenten im spaeteren Next.js App Router aktiv importieren.
- `next-intl` Routing im Zielstack anschliessen.
- Bestehende PHP-Seiten schrittweise auf die neuen CSS Tokens konsolidieren.
- Echte Premium-Bildauswahl pro Seite finalisieren.
- Admin, Scanner und Checkout visuell weiter an diese Regeln angleichen.

